"use client";

import React, { useId } from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { ChartColor } from "../types";
import { seriesColor } from "../_shared/format";
import { areaPath, linePath, type Curve, type Point } from "../_shared/paths";
import { extent, linearScale } from "../_shared/scale";
import { useChartSize } from "../_shared/useChartSize";
import { skeletonFill, type SkeletonableProps } from "../../lib/skeleton";
import { ChartEmpty, waveMask } from "../_shared/ChartSkeleton";
import { fadeAfterProps, revealRectProps } from "../_shared/animation";

export interface SparklineProps extends SkeletonableProps {
  data: Array<number | null>;
  /**
   * Ekran okuyucu için eğilimi anlatan metin (ör. "Son 12 ay, yükselişte").
   * Verilmezse grafik dekoratif sayılır (`aria-hidden`) — yanındaki değer zaten okunuyor.
   */
  label?: string;
  /** Varsayılan: soluk (`muted`) çizgi + vurgulu son nokta — kartın değeri öne çıksın. */
  color?: ChartColor | "muted";
  /** Son noktanın rengi. Varsayılan `primary`. */
  endColor?: ChartColor;
  area?: boolean;
  curve?: Curve;
  /** Boyut. Varsayılan `h-8 w-full`. */
  className?: string;
  /** Değer yokken bulanık çizginin önünde görünen metin. Varsayılan "Veri yok". */
  emptyText?: string;
  /** Giriş animasyonu: çizgi soldan açılır, son nokta ardından belirir. Varsayılan açık. */
  animated?: boolean;
}

/**
 * Eksensiz mini çizgi. Statistic kartlarında, tablo hücrelerinde
 * eğilimi göstermek için. Değer okutmaz (değeri yanındaki sayı taşır); ekseni,
 * tooltip'i yoktur.
 */
export function Sparkline({ data, label, color = "muted", endColor = "primary", area = false, curve = "smooth", skeleton, animated = true, emptyText = "Veri yok", className }: Readonly<SparklineProps>) {
  const [ref, size] = useChartSize<HTMLDivElement>();
  const clipId = `mari-spark-${useId().replace(/[^\w-]/g, "")}`;
  // İskelet: aynı kutuda ince dalga (çizginin kendisi) — düz blok değil.
  if (skeleton) return <span aria-hidden data-skeleton="" className={cn("pointer-events-none block h-8 w-full", skeletonFill(true), className)} style={waveMask(1.5)} />;

  const stroke = color === "muted" ? "var(--mari-color-muted)" : seriesColor(color, 0);
  const pad = 3;
  const [lo, hi] = extent(data);
  const flat = lo === hi;
  const y = linearScale(flat ? [lo - 1, hi + 1] : [lo, hi], [size.height - pad, pad]);
  const x = (i: number) => (data.length <= 1 ? size.width / 2 : pad + (i * (size.width - pad * 2)) / (data.length - 1));
  const pts: Array<Point | null> = data.map((v, i) => (v == null ? null : [x(i), y(v)]));
  let lastIndex = -1;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i] != null) {
      lastIndex = i;
      break;
    }
  }
  const last = lastIndex >= 0 ? pts[lastIndex] : null;

  // Boş: diğer grafiklerle aynı desen — bulanık sabit dalga, önde kısa uyarı.
  if (!last) {
    return (
      <div role="img" aria-label={emptyText} className={cn("relative h-8 w-full", className)}>
        <ChartEmpty compact plot={<span className={cn("absolute inset-0", skeletonFill(false))} style={waveMask(1.5)} />}>
          {/* Empty ile aynı ikon; 2rem'lik satıra sığsın diye ikon + metin yan yana. */}
          <span className="flex items-center gap-1.5 text-xs text-mari-muted">
            <InboxIcon aria-hidden className="size-3.5 shrink-0" />
            {emptyText}
          </span>
        </ChartEmpty>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn("h-8 w-full", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {size.width > 0 && (
        <svg width={size.width} height={size.height} aria-hidden className="block overflow-visible">
          {animated && (
            <defs>
              <clipPath id={clipId}>
                <rect x={-2} y={-2} width={size.width + 4} height={size.height + 4} {...revealRectProps(animated, -2)} />
              </clipPath>
            </defs>
          )}
          <g clipPath={animated ? `url(#${clipId})` : undefined}>
            {area && <path d={areaPath(pts, size.height, curve)} fill={stroke} fillOpacity={0.1} />}
            <path d={linePath(pts, curve)} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {last && <circle cx={last[0]} cy={last[1]} r={3} fill={seriesColor(endColor, 0)} className={cn("stroke-mari-surface", fadeAfterProps(animated).className)} style={fadeAfterProps(animated).style} strokeWidth={1.5} />}
        </svg>
      )}
    </div>
  );
}
