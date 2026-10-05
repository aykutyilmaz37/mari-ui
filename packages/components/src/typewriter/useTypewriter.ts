"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motionAllowed } from "../lib/useAnimatedValue";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type TypewriterPhase = "waiting" | "typing" | "pausing" | "deleting" | "done";

export interface TypewriterState {
  /** Yazılan metnin sırası. */
  index: number;
  /** Görünen karakter sayısı. */
  length: number;
  phase: TypewriterPhase;
}

export interface UseTypewriterOptions {
  texts: string[];
  loop: boolean;
  typeSpeed: number;
  deleteSpeed: number;
  pauseMs: number;
  startDelay: number;
  trigger: "visible" | "mount";
  onComplete?: () => void;
}

/** Karakterler (birleşik emoji/aksanlı harf bölünmesin diye kod noktasıyla). */
export const charsOf = (text: string) => Array.from(text);

/**
 * Durum makinesi: bekle → yaz → (dizide) bekle → sil → sıradaki … → bitti.
 * `null` döner → animasyon yok, metin olduğu gibi (hareket azaltma, SSR,
 * `matchMedia`sız ortam). İlk render `null` (sunucu çıktısıyla aynı);
 * hareket serbestse boyamadan önce `waiting`e geçer → tam metin bir kare
 * bile görünmez.
 */
export function useTypewriter<T extends HTMLElement>(options: UseTypewriterOptions) {
  const { texts, loop, typeSpeed, deleteSpeed, pauseMs, startDelay, trigger } = options;
  const ref = useRef<T>(null);
  const [state, setState] = useState<TypewriterState | null>(null);
  const onComplete = useRef(options.onComplete);
  onComplete.current = options.onComplete;
  // Metin dizisi her render'da yeni dizi olabilir — içerik değişince baştan başlar.
  const key = texts.join("\u0000");

  useIsomorphicLayoutEffect(() => {
    if (!motionAllowed() || texts.length === 0) {
      setState(null);
      return;
    }
    setState({ index: 0, length: 0, phase: "waiting" });
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      timer = setTimeout(() => setState({ index: 0, length: 0, phase: "typing" }), startDelay);
    };
    const el = ref.current;
    if (trigger === "mount" || !el || typeof IntersectionObserver === "undefined") {
      start();
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        start();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [key, trigger, startDelay]);

  useEffect(() => {
    if (!state || state.phase === "waiting" || state.phase === "done") return;
    const total = charsOf(texts[state.index] ?? "").length;
    const isLast = state.index === texts.length - 1;
    let next: TypewriterState;
    let delay: number;
    if (state.phase === "typing") {
      if (state.length < total) {
        next = { ...state, length: state.length + 1 };
        delay = typeSpeed;
      } else if (texts.length > 1 && (loop || !isLast)) {
        next = { ...state, phase: "pausing" };
        delay = 0;
      } else {
        setState({ ...state, phase: "done" });
        onComplete.current?.();
        return;
      }
    } else if (state.phase === "pausing") {
      next = { ...state, phase: "deleting" };
      delay = pauseMs;
    } else if (state.length > 0) {
      next = { ...state, length: state.length - 1 };
      delay = deleteSpeed;
    } else {
      next = { index: (state.index + 1) % texts.length, length: 0, phase: "typing" };
      delay = typeSpeed;
    }
    const timer = setTimeout(() => setState(next), delay);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` metin içeriğini temsil eder
  }, [state, key, loop, typeSpeed, deleteSpeed, pauseMs]);

  return [ref, state] as const;
}
