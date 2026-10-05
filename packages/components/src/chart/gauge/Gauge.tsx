"use client";

import React, { useMemo } from "react";
import { cn } from "@mari-ui/core";
import type { ChartColor } from "../types";
import { seriesColor } from "../_shared/format";
import { polar, strokeArcPath } from "../_shared/paths";
import { skeletonBoxProps, type SkeletonableProps } from "../../lib/skeleton";

export interface GaugeSegment {
  /** Bu eşiğe KADAR (dahil) olan değerler bu rengi alır. */
  upTo: number;
  color: ChartColor;
  /** Erişilebilir durum adı (ör. "Kritik") — `aria-valuetext`e eklenir. */
  label?: string;
}

export interface GaugeProps extends SkeletonableProps {
  value: number;
  min?: number;
  max?: number;
  /** Ad — ekran okuyucu (`role="meter"`) ve göstergenin altındaki metin. */
  label: string;
  /** Altta görünen adı gizle (yine okunur). */
  hideLabel?: boolean;
  /** Tek renk. Varsayılan `primary`. `segments` verilirse yok sayılır. */
  color?: ChartColor;
  /**
   * Eşiklere göre renk (ör. doluluk: 70'e kadar yeşil, 90'a kadar sarı, sonra
   * kırmızı). Durum rengi tek başına anlam taşımasın: `label` verin.
   */
  segments?: GaugeSegment[];
  valueFormatter?: (value: number) => string;
  locale?: string;
  /** Boyut. Varsayılan `w-48`; yükseklik genişlikten türer. */
  className?: string;
}

const START = -Math.PI * 0.75;
const END = Math.PI * 0.75;

/**
 * Faz 16.9 — gösterge (270° yay). Tek bir değerin aralıktaki yeri: doluluk,
 * hedefe ulaşma, skor. Dolgu durum rengini taşır; iz, aynı rengin soluk hali.
 * `role="meter"`. Birden çok değer için Bar, zaman içinde değişim için Line.
 */
export function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  hideLabel = false,
  color = "primary",
  segments,
  valueFormatter,
  locale = "tr-TR",
  skeleton,
  className,
}: GaugeProps) {
  const format = useMemo(() => valueFormatter ?? ((v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(v)), [valueFormatter, locale]);
  if (skeleton) return <div {...skeletonBoxProps(cn("aspect-[5/4] w-48 rounded-full", className))} />;

  const clamped = Math.min(max, Math.max(min, value));
  const ratio = max === min ? 0 : (clamped - min) / (max - min);
  const segment = segments?.slice().sort((a, b) => a.upTo - b.upTo).find((s) => clamped <= s.upTo) ?? segments?.[segments.length - 1];
  const fill = seriesColor(segment?.color ?? color, 0);

  // viewBox sabit: yay, kalınlık ve yazı birlikte ölçeklenir (göstergenin kendisi bir figür).
  const r = 80;
  const cx = 100;
  const cy = 96;
  const stroke = 14;
  const valueText = format(value);
  // Uç etiketleri yayın iki ucunun altında. Yazılar kullanıcı birimiyle (fontSize) — figürle birlikte ölçeklensin.
  const [minX, minY] = polar(cx, cy, r, START);
  const [maxX, maxY] = polar(cx, cy, r, END);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={segment?.label ? `${valueText}, ${segment.label}` : valueText}
      className={cn("inline-flex w-48 flex-col items-center", className)}
    >
      <svg viewBox="0 0 200 184" aria-hidden className="block w-full overflow-visible">
        <path d={strokeArcPath(cx, cy, r, START, END)} fill="none" stroke={fill} strokeOpacity={0.15} strokeWidth={stroke} strokeLinecap="round" />
        {ratio > 0 && (
          <path d={strokeArcPath(cx, cy, r, START, START + (END - START) * ratio)} fill="none" stroke={fill} strokeWidth={stroke} strokeLinecap="round" />
        )}
        <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={36} className="fill-mari-foreground font-semibold">
          {valueText}
        </text>
        <text x={minX} y={minY + 26} textAnchor="middle" fontSize={14} className="fill-mari-muted tabular-nums">
          {format(min)}
        </text>
        <text x={maxX} y={maxY + 26} textAnchor="middle" fontSize={14} className="fill-mari-muted tabular-nums">
          {format(max)}
        </text>
      </svg>
      {!hideLabel && <span className="-mt-2 text-sm text-mari-muted">{label}</span>}
      {segment?.label && <span className="text-xs font-medium text-mari-foreground">{segment.label}</span>}
    </div>
  );
}
