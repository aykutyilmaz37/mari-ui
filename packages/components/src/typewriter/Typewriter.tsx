"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import { skeletonBoxProps } from "../lib/skeleton";
import type { TypewriterProps } from "./types";
import { charsOf, useTypewriter } from "./useTypewriter";

export type { TypewriterProps };

/** İmleç: metin boyunda ince çubuk, adımlı yanıp söner (gerçek imleç gibi; OtpInput ile aynı ritim). */
const CURSOR_CLASS =
  "ml-[0.05em] inline-block h-[1.05em] w-[0.08em] min-w-px translate-y-[0.15em] bg-current animate-[mari-caret-blink_1.06s_step-end_infinite] motion-reduce:hidden";

/**
 * Daktilo efekti — metni karakter karakter yazar; dizi verilirse yazar,
 * bekler, siler, sıradakine geçer (`loop` ile baştan).
 *
 * - Erişilebilirlik: ekran okuyucu ara harfleri değil TAM metni bir kez okur
 *   (dizide metinler virgülle); yazılan katman gizlidir.
 * - Yerleşim: tek metinde yer baştan tam metne göre ayrılır (paragraf yazılırken
 *   satırlar zıplamaz). Dizide genişlik metinle değişir — cümle içinde dönen
 *   kelime için doğal olan bu.
 * - Hareket azaltma tercihinde (ve JS'siz ilk çıktıda) metin doğrudan tam görünür.
 */
export function Typewriter({
  text,
  loop = false,
  typeSpeed = 50,
  deleteSpeed = 30,
  pauseMs = 1500,
  startDelay = 0,
  trigger = "visible",
  cursor = true,
  as = "span",
  onComplete,
  className,
  style,
  skeleton = false,
}: TypewriterProps) {
  const texts = Array.isArray(text) ? text : [text];
  const [ref, state] = useTypewriter<HTMLElement>({ texts, loop, typeSpeed, deleteSpeed, pauseMs, startDelay, trigger, onComplete });
  const Tag = as as React.ElementType;

  if (skeleton) {
    // Yer tutucu ilk metnin kendi genişliğinde (satır kaymaz).
    // Yer tutucu ekran okuyucudan gizli; başlık içinde boş kalmasın diye kısa bir durum metni okunur.
    return (
      <>
        <Tag {...skeletonBoxProps(cn("rounded-sm", className))} style={style}>{texts[0]}</Tag>
        <span className="sr-only">Yükleniyor</span>
      </>
    );
  }

  // Animasyon yok: düz metin (dizide son metin — döngü dışı bitiş hali).
  if (!state) {
    return (
      <Tag ref={ref} className={className} style={style}>
        {Array.isArray(text) && !loop ? texts[texts.length - 1] : texts[0]}
      </Tag>
    );
  }

  const current = texts[state.index] ?? "";
  const shown = charsOf(current).slice(0, state.length).join("");
  const caret = cursor ? <span aria-hidden className={CURSOR_CLASS} /> : null;
  const reserve = texts.length === 1;

  return (
    <Tag ref={ref} className={className} style={style}>
      <span className="sr-only">{texts.join(", ")}</span>
      {reserve ? (
        // Tek metin: tam metin saydam olarak yer ayırır, yazılan katman aynı hücrede üstte.
        <span aria-hidden className="inline-grid">
          <span className="invisible [grid-area:1/1]">{current}</span>
          <span className="[grid-area:1/1]">
            {shown}
            {caret}
          </span>
        </span>
      ) : (
        <span aria-hidden>
          {shown}
          {caret}
        </span>
      )}
    </Tag>
  );
}
