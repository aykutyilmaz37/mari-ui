"use client";

import React, { useEffect, useState } from "react";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import type { LoadingProps } from "./types";
import { SPINNER_PX, STROKE_PX, strokeClass, TIP_CLASS } from "./utils";

export type { LoadingProps };

/**
 * Faz 13.6 — yapı ant.design Spin'den, görünüm kendi token'larımızdan.
 *
 * Eski sürüm tek bir şey yapabiliyordu: `fixed inset-0` tam ekran bir spinner.
 * - Bir kartın/formun İÇİNDE kullanılamıyordu; örtü de yoktu — alttaki
 *   sayfa yükleme sırasında tıklanabiliyordu.
 * - `role="status"` yoktu (gizli "Yükleniyor..." metni hiç duyurulmuyordu);
 *   boyut, açıklama, gecikme yoktu.
 *
 * Artık üç mod: satır içi (varsayılan), sarmalama (`children` — içerik yerinde
 * kalır, soluklaşır, `inert` olur; düzen kaymaz), tam ekran (`fullscreen`).
 * `delay` hızlı biten isteklerde yanıp sönmeyi önler; `percent` belirli ilerleme.
 */

function useDelayedVisible(spinning: boolean, delay: number): boolean {
  const [delayed, setDelayed] = useState(delay <= 0 && spinning);
  useEffect(() => {
    if (!spinning) {
      setDelayed(false);
      return;
    }
    if (delay <= 0) {
      setDelayed(true);
      return;
    }
    const timer = setTimeout(() => setDelayed(true), delay);
    return () => clearTimeout(timer);
  }, [spinning, delay]);
  return spinning && delayed;
}

function Spinner({ size, color, percent }: { size: Size; color: ColorRole; percent?: number }) {
  const px = SPINNER_PX[size];
  const stroke = STROKE_PX[size];
  const radius = (px - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const determinate = percent !== undefined;
  const clamped = Math.min(100, Math.max(0, percent ?? 0));
  const dash = determinate ? (clamped / 100) * circumference : circumference * 0.28;

  return (
    <svg
      aria-hidden
      width={px}
      height={px}
      viewBox={`0 0 ${px} ${px}`}
      className={cn(
        "shrink-0",
        // Hareket azaltma tercihinde de döner (durum bilgisi taşıyor) ama yavaş.
        !determinate && "animate-spin motion-reduce:animate-[spin_2s_linear_infinite]",
        determinate && "-rotate-90"
      )}
    >
      <circle cx={px / 2} cy={px / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-mari-border" />
      <circle
        cx={px / 2}
        cy={px / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
        className={cn(strokeClass[color], determinate && "transition-[stroke-dasharray] duration-300 motion-reduce:transition-none")}
      />
    </svg>
  );
}

export function Loading({
  spinning = true,
  size = "md",
  tip,
  delay = 0,
  percent,
  fullscreen = false,
  children,
  color = "primary",
  indicator,
  className,
}: LoadingProps) {
  const visible = useDelayedVisible(spinning, delay);
  const isWrapper = children !== undefined;
  const determinate = percent !== undefined;
  const label = typeof tip === "string" ? tip : "Yükleniyor";

  const indicatorBlock = (
    <div className={cn("flex items-center gap-2 text-mari-muted", size === "sm" && !fullscreen ? "flex-row" : "flex-col")}>
      {indicator ?? <Spinner size={size} color={color} percent={percent} />}
      {(tip || determinate) && (
        <span className={cn("tabular-nums", TIP_CLASS[size])}>
          {tip}
          {determinate && (
            <span className={cn(tip ? "ml-1.5" : "", "font-medium text-mari-foreground")}>%{Math.round(Math.min(100, Math.max(0, percent ?? 0)))}</span>
          )}
        </span>
      )}
    </div>
  );

  // Belirli ilerlemede progressbar, aksi halde canlı durum bölgesi.
  const a11yProps = determinate
    ? { role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(percent ?? 0) }
    : { role: "status", "aria-live": "polite" as const, "aria-label": label };

  if (fullscreen) {
    if (!visible) return null;
    return (
      <div
        {...a11yProps}
        className={cn(
          "fixed inset-0 z-mari-modal flex items-center justify-center bg-mari-surface/80 backdrop-blur-sm",
          "transition-opacity duration-200 motion-reduce:transition-none starting:opacity-0",
          className
        )}
      >
        {indicatorBlock}
      </div>
    );
  }

  if (isWrapper) {
    return (
      <div className={cn("relative", className)} aria-busy={visible || undefined}>
        {/* Yüklenirken içerik etkileşime kapalı (inert) — formda çift gönderimi, listede yarım veriye tıklamayı önler. */}
        <div inert={visible || undefined} className={cn("transition-opacity duration-200 motion-reduce:transition-none", visible && "pointer-events-none select-none opacity-40")}>
          {children}
        </div>
        {/* Canlı bölge HEP DOM'da, sadece metni değişir — yükleme başlayınca yeni
            eklenen bir role=status'u bazı ekran okuyucular duyurmuyor. */}
        {!determinate && (
          <span role="status" aria-live="polite" className="sr-only">
            {visible ? label : ""}
          </span>
        )}
        {visible && (
          // Uzun içerikte spinner ilk 400px'in ortasında kalsın (ant.design) — sayfanın dibinde kaybolmasın.
          <div
            {...(determinate ? a11yProps : { "aria-hidden": true })}
            className="absolute inset-x-0 top-0 z-10 flex h-full max-h-[25rem] items-center justify-center transition-opacity duration-200 motion-reduce:transition-none starting:opacity-0"
          >
            {/* Soluk içeriğin (grafik, metin) üstünde okunur kalsın diye yüzey kutusu. */}
            <div className="rounded-xl border border-mari-border bg-mari-surface/95 px-4 py-3 shadow-mari-md">{indicatorBlock}</div>
          </div>
        )}
      </div>
    );
  }

  if (!visible) return null;
  return (
    <div {...a11yProps} className={cn("inline-flex", className)}>
      {indicatorBlock}
    </div>
  );
}
