"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import type { LoadingProps } from "./types";
import { clampPercent, SPINNER_SIZE, SPINNER_VIEWBOX, STROKE_WIDTH, strokeClass, TIP_CLASS } from "./utils";

export type { LoadingProps };

/**
 * Eski sürüm tek bir şey yapabiliyordu: `fixed inset-0` tam ekran bir spinner.
 * - Bir kartın/formun İÇİNDE kullanılamıyordu; örtü de yoktu — alttaki
 *  sayfa yükleme sırasında tıklanabiliyordu.
 * - `role="status"` yoktu (gizli "Yükleniyor..." metni hiç duyurulmuyordu);
 *  boyut, açıklama, gecikme yoktu.
 *
 * Artık üç mod: satır içi (varsayılan), sarmalama (`children` — içerik yerinde
 * kalır, soluklaşır, `inert` olur; düzen kaymaz), tam ekran (`fullscreen`).
 * `delay` hızlı biten isteklerde yanıp sönmeyi önler; `percent` belirli ilerleme.
 *
 * Spinner boyutu rem (px kök fontla ölçeklenmiyordu); `aria-valuenow`
 * da sınırlanır (percent=150 → 150/100 duyuruluyordu); tam ekran `document.body`'ye
 * portal edilir (transform'lu bir atanın içinde `fixed` ekranı kaplamıyordu);
 * mod başına ayrık bileşenler (sonar cognitive-complexity).
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

function Spinner({ size, color, percent }: Readonly<{ size: Size; color: ColorRole; percent?: number }>) {
  const box = SPINNER_VIEWBOX[size];
  const stroke = STROKE_WIDTH[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const determinate = percent !== undefined;
  const dash = determinate ? (clampPercent(percent) / 100) * circumference : circumference * 0.28;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${box} ${box}`}
      style={{ width: SPINNER_SIZE[size], height: SPINNER_SIZE[size] }}
      className={cn(
        "shrink-0",
        // Hareket azaltma tercihinde de döner (durum bilgisi taşıyor) ama yavaş.
        !determinate && "animate-spin motion-reduce:animate-[spin_2s_linear_infinite]",
        determinate && "-rotate-90"
      )}
    >
      <circle cx={box / 2} cy={box / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-mari-border" />
      <circle
        cx={box / 2}
        cy={box / 2}
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

interface IndicatorProps {
  size: Size;
  color: ColorRole;
  percent?: number;
  tip?: React.ReactNode;
  indicator?: React.ReactNode;
  /** Küçük satır içi gösterge yan yana, diğerleri alt alta. */
  row: boolean;
}

function IndicatorBlock({ size, color, percent, tip, indicator, row }: Readonly<IndicatorProps>) {
  const determinate = percent !== undefined;
  return (
    <div className={cn("flex items-center gap-2 text-mari-muted", row ? "flex-row" : "flex-col")}>
      {indicator ?? <Spinner size={size} color={color} percent={percent} />}
      {(tip || determinate) && (
        <span className={cn("tabular-nums", TIP_CLASS[size])}>
          {tip}
          {determinate && <span className={cn(tip ? "ml-1.5" : "", "font-medium text-mari-foreground")}>%{Math.round(clampPercent(percent))}</span>}
        </span>
      )}
    </div>
  );
}

/** Belirli ilerlemede progressbar, aksi halde canlı durum bölgesi. */
function getA11yProps(label: string, percent: number | undefined): React.HTMLAttributes<HTMLDivElement> {
  if (percent === undefined) return { role: "status", "aria-live": "polite", "aria-label": label };
  return { role: "progressbar", "aria-label": label, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": Math.round(clampPercent(percent)) };
}

function WrapperLoading({
  visible,
  label,
  a11yProps,
  determinate,
  className,
  children,
  indicator,
}: Readonly<{
  visible: boolean;
  label: string;
  a11yProps: React.HTMLAttributes<HTMLDivElement>;
  determinate: boolean;
  className?: string;
  children: React.ReactNode;
  indicator: React.ReactNode;
}>) {
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
          <div className="rounded-xl border border-mari-border bg-mari-surface/95 px-4 py-3 shadow-mari-md">{indicator}</div>
        </div>
      )}
    </div>
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
}: Readonly<LoadingProps>) {
  const visible = useDelayedVisible(spinning, delay);
  const label = typeof tip === "string" ? tip : "Yükleniyor";
  const a11yProps = getA11yProps(label, percent);
  const indicatorBlock = (
    <IndicatorBlock size={size} color={color} percent={percent} tip={tip} indicator={indicator} row={size === "sm" && !fullscreen} />
  );

  if (children !== undefined && !fullscreen) {
    return (
      <WrapperLoading visible={visible} label={label} a11yProps={a11yProps} determinate={percent !== undefined} className={className} indicator={indicatorBlock}>
        {children}
      </WrapperLoading>
    );
  }

  if (!visible) return null;

  if (fullscreen) {
    if (typeof document === "undefined") return null;
    return createPortal(
      <div
        {...a11yProps}
        className={cn(
          "fixed inset-0 z-mari-modal flex items-center justify-center bg-mari-surface/80 backdrop-blur-sm",
          "transition-opacity duration-200 motion-reduce:transition-none starting:opacity-0",
          className
        )}
      >
        {indicatorBlock}
      </div>,
      document.body
    );
  }

  return (
    <div {...a11yProps} className={cn("inline-flex", className)}>
      {indicatorBlock}
    </div>
  );
}
