"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Değer animasyonu — Statistic (ve sonraki Typewriter) ortak çekirdeği.
 *
 * - `count`: sayı bir önceki değerden (ilkinde 0) hedefe sayar, sonda yavaşlar.
 * - `typewriter`: metin karakter karakter yazılır.
 *
 * Hareket azaltma tercihinde (ya da `matchMedia` olmayan ortamda: SSR, test)
 * hiç çalışmaz → değer doğrudan son halinde. İlk durum her zaman SON değerdir
 * (sunucu çıktısı ile aynı → hidrasyon uyuşmazlığı yok); animasyon boyamadan
 * önce (layout effect) başlar, son değer bir kare bile görünmez.
 */
export type ValueAnimation = "count" | "typewriter";

export function motionAllowed(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const COUNT_MS = 1000;
const CHAR_MS = 45;
/** Çok uzun metinde yazım en fazla bu kadar sürsün. */
const MAX_TYPE_MS = 1200;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

export interface AnimatedValueOptions {
  /** Son (gösterilecek) metin. */
  text: string;
  /** `count` için hedef sayı; yoksa `count` yazıya düşmez, animasyon olmaz. */
  number?: number;
  /** Ara sayıların biçimi (`count`). */
  format?: (value: number) => string;
  mode: ValueAnimation;
  enabled: boolean;
  /** Başlamadan önce bekleme (ms). */
  delay?: number;
}

/** Animasyon sürerken gösterilecek ara metin; `null` → son değeri göster. */
export function useAnimatedValue({ text, number, format, mode, enabled, delay = 0 }: AnimatedValueOptions): string | null {
  const [shown, setShown] = useState<string | null>(null);
  const lastNumber = useRef(0);
  const formatRef = useRef(format);
  formatRef.current = format;

  useIsomorphicLayoutEffect(() => {
    const canCount = mode === "count" && number !== undefined && Number.isFinite(number);
    if (!enabled || !motionAllowed() || (mode === "count" && !canCount)) {
      if (canCount) lastNumber.current = number!;
      setShown(null);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const from = lastNumber.current;
    const chars = Array.from(text);
    const charMs = Math.min(CHAR_MS, MAX_TYPE_MS / Math.max(chars.length, 1));
    const fmt = formatRef.current ?? String;
    setShown(canCount ? fmt(from) : "");

    const tick = (now: number) => {
      start ??= now;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (canCount) {
        const t = Math.min(1, elapsed / COUNT_MS);
        const value = from + (number! - from) * easeOutCubic(t);
        if (t >= 1) {
          lastNumber.current = number!;
          setShown(null);
          return;
        }
        setShown(fmt(value));
      } else {
        const n = Math.floor(elapsed / charMs) + 1;
        if (n >= chars.length) {
          setShown(null);
          return;
        }
        setShown(chars.slice(0, n).join(""));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (canCount) lastNumber.current = number!;
    };
  }, [text, number, mode, enabled, delay]);

  return shown;
}

/**
 * Animasyonlu metin kutusu: yer SON metne göre ayrılır (saydam, ekran okuyucu
 * onu okur), ara metin üstüne çizilir (gizli) → genişlik zıplamaz, okuyucu
 * ara sayıları duymaz. `shown` null iken düz metin.
 */
export function AnimatedText({ text, shown }: Readonly<{ text: string; shown: string | null }>) {
  if (shown === null) return <>{text}</>;
  return (
    <span className="relative inline-block">
      <span className="text-transparent">{text}</span>
      <span aria-hidden className="absolute inset-y-0 left-0 whitespace-nowrap">
        {shown}
      </span>
    </span>
  );
}
