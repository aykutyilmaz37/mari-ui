"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { ChartColor } from "../types";
import { seriesColor } from "../_shared/format";
import { areaPath, linePath, type Curve, type Point } from "../_shared/paths";
import { extent, linearScale } from "../_shared/scale";
import { useChartSize } from "../_shared/useChartSize";
import { skeletonBoxProps, type SkeletonableProps } from "../../lib/skeleton";

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
}

/**
 * Faz 16.9 — eksensiz mini çizgi. Statistic kartlarında, tablo hücrelerinde
 * eğilimi göstermek için. Değer okutmaz (değeri yanındaki sayı taşır); ekseni,
 * tooltip'i yoktur.
 */
export function Sparkline({ data, label, color = "muted", endColor = "primary", area = false, curve = "smooth", skeleton, className }: SparklineProps) {
  const [ref, size] = useChartSize<HTMLDivElement>();
  if (skeleton) return <span {...skeletonBoxProps(cn("block h-8 w-full rounded-sm", className))} />;

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
          {area && <path d={areaPath(pts, size.height, curve)} fill={stroke} fillOpacity={0.1} />}
          <path d={linePath(pts, curve)} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
          {last && <circle cx={last[0]} cy={last[1]} r={3} fill={seriesColor(endColor, 0)} className="stroke-mari-surface" strokeWidth={1.5} />}
        </svg>
      )}
    </div>
  );
}
