"use client";

import React, { useMemo } from "react";
import { InboxIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { ChartColor } from "../types";
import { seriesColor } from "../_shared/format";
import { polar, strokeArcPath } from "../_shared/paths";
import { skeletonFill, type SkeletonableProps } from "../../lib/skeleton";
import { ChartEmpty, svgMask } from "../_shared/ChartSkeleton";
import { drawProps } from "../_shared/animation";

export interface GaugeSegment {
  /** Bu eşiğe KADAR (dahil) olan değerler bu rengi alır. */
  upTo: number;
  color: ChartColor;
  /** Erişilebilir durum adı (ör. "Kritik") — `aria-valuetext`e eklenir. */
  label?: string;
}

export interface GaugeProps extends SkeletonableProps {
  /** `null`/`undefined` → boş hal (ör. henüz ölçüm yok): bulanık gösterge + `emptyText`. */
  value: number | null | undefined;
  /** Değer yokken yayın ortasında görünen metin. Varsayılan "Veri yok". */
  emptyText?: string;
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
  /** Giriş animasyonu: dolgu yayı izin başından değere kadar süpürülür. Varsayılan açık; hareket azaltma tercihinde çalışmaz. */
  animated?: boolean;
}

const START = -Math.PI * 0.75;
const END = Math.PI * 0.75;

// viewBox sabit: yay, kalınlık ve yazı birlikte ölçeklenir (göstergenin kendisi bir figür).
const R = 80;
const CX = 100;
const CY = 96;
const STROKE = 14;

/**
 * İskelet: göstergenin kendi geometrisi — iz yayı, ortadaki değer ve iki uç
 * etiketi, aynı viewBox'ta. Parıltılı dolgu bu şekille maskelenir.
 */
function gaugeMask(withValue: boolean): React.CSSProperties {
  const [minX, minY] = polar(CX, CY, R, START);
  const [maxX] = polar(CX, CY, R, END);
  const stub = (x: number, y: number, w: number, h: number) => `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="3" fill="black"/>`;
  return svgMask(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 184">` +
      `<path d="${strokeArcPath(CX, CY, R, START, END)}" fill="none" stroke="black" stroke-width="${STROKE}" stroke-linecap="round"/>` +
      (withValue ? stub(CX, CY, 64, 26) : "") +
      stub(minX, minY + 21, 16, 10) +
      stub(maxX, minY + 21, 24, 10) +
      `</svg>`
  );
}

const SKELETON_MASK = gaugeMask(true);
/** Boş hal: ortadaki değer yerine uyarı durduğu için değer çubuğu yok. */
const EMPTY_MASK = gaugeMask(false);

/**
 * Gösterge (270° yay). Tek bir değerin aralıktaki yeri: doluluk,
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
  emptyText = "Veri yok",
  skeleton,
  animated = true,
  className,
}: Readonly<GaugeProps>) {
  const format = useMemo(() => valueFormatter ?? ((v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(v)), [valueFormatter, locale]);
  if (skeleton) {
    return (
      <div aria-hidden data-skeleton="" className={cn("pointer-events-none inline-flex w-48 flex-col items-center", className)}>
        <div className={cn("aspect-[200/184] w-full", skeletonFill(true))} style={SKELETON_MASK} />
        {!hideLabel && (
          <span className="-mt-2 flex h-5 items-center">
            <span className={cn("block h-2.5 w-24 rounded-sm", skeletonFill(true))} />
          </span>
        )}
      </div>
    );
  }

  // Boş (değer yok — ör. henüz ölçüm gelmedi): diğer grafiklerle aynı desen —
  // arkada bulanık sabit iskelet, değerin yerinde uyarı. "0" göstermek yanlış
  // olurdu (0 bir ölçümdür); ad altta kalır ki neyin boş olduğu bilinsin.
  if (value == null || !Number.isFinite(value)) {
    return (
      <div role="img" aria-label={`${label}: ${emptyText}`} className={cn("inline-flex w-48 flex-col items-center", className)}>
        <div className="relative aspect-[200/184] w-full">
          <ChartEmpty plot={<div className={cn("absolute inset-0", skeletonFill(false))} style={EMPTY_MASK} />}>
            {/* Değer yazısının yeri: yay merkezi (viewBox y=96 / 184). */}
            <span className="absolute top-[52%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-xs text-mari-muted">
              <InboxIcon aria-hidden className="size-5" />
              <span className="whitespace-nowrap">{emptyText}</span>
            </span>
          </ChartEmpty>
        </div>
        {!hideLabel && <span className="-mt-2 text-sm text-mari-muted">{label}</span>}
      </div>
    );
  }

  const clamped = Math.min(max, Math.max(min, value));
  const ratio = max === min ? 0 : (clamped - min) / (max - min);
  const segment = segments?.slice().sort((a, b) => a.upTo - b.upTo).find((s) => clamped <= s.upTo) ?? segments?.[segments.length - 1];
  const fill = seriesColor(segment?.color ?? color, 0);

  const r = R;
  const cx = CX;
  const cy = CY;
  const stroke = STROKE;
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
          <path d={strokeArcPath(cx, cy, r, START, START + (END - START) * ratio)} fill="none" stroke={fill} strokeWidth={stroke} strokeLinecap="round" {...drawProps(animated)} />
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
