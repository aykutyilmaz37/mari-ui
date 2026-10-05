"use client";

import React, { useId, useMemo, useState } from "react";
import { cn } from "@mari-ui/core";
import type { ChartBaseProps, ChartColor } from "../types";
import { ChartFrame, nextIndex } from "../_shared/ChartFrame";
import { makeFormatters, seriesColor } from "../_shared/format";
import { arcPath, polar } from "../_shared/paths";
import { useChartSize } from "../_shared/useChartSize";
import { PieSkeleton } from "../_shared/ChartSkeleton";
import { drawProps, fadeAfterProps } from "../_shared/animation";

export interface PieDatum {
  name: string;
  value: number;
  color?: ChartColor;
}

export interface PieChartProps extends ChartBaseProps {
  data: PieDatum[];
  /** Halka (donut). Ortada toplam (ya da `centerLabel`/`centerValue`) gösterilir. Varsayılan `false`. */
  donut?: boolean;
  /** Halkanın ortasındaki başlık. Varsayılan "Toplam". */
  centerLabel?: React.ReactNode;
  /** Halkanın ortasındaki değer. Varsayılan: biçimlenmiş toplam. */
  centerValue?: React.ReactNode;
  /**
   * Bu sayıdan fazla dilim "Diğer"de toplanır (palet 8 renk; döngüye girmez).
   * Varsayılan 6 — pasta 5–6 dilimden sonra okunmaz, çubuk grafik düşünün.
   */
  maxSlices?: number;
  /** "Diğer" diliminin adı. */
  otherLabel?: string;
  /** Lejantta yüzde. Varsayılan `true`. */
  showPercent?: boolean;
}

/**
 * Faz 16.9 — pasta / halka grafiği. Bir bütünün az sayıda parçası. Dilimler
 * arasında 2px yüzey boşluğu; üzerine gelince dilim hafifçe dışa çıkar ve
 * tooltip ad, değer, yüzde gösterir. Lejant her zaman var (kimlik yalnız
 * renge kalmaz); yüzdeler lejantta. Sıfır ve negatif değerler çizilmez.
 */
export function PieChart({
  data,
  label,
  donut = false,
  centerLabel = "Toplam",
  centerValue,
  maxSlices = 6,
  otherLabel = "Diğer",
  showPercent = true,
  valueFormatter,
  locale = "tr-TR",
  emptyText = "Veri yok",
  skeleton,
  animated = true,
  className,
}: PieChartProps) {
  const [plotRef, size] = useChartSize<HTMLDivElement>();
  const maskId = `mari-pie-${useId().replace(/[^\w-]/g, "")}`;
  const [active, setActive] = useState<number | null>(null);
  const fmt = useMemo(() => makeFormatters(locale, valueFormatter), [locale, valueFormatter]);
  const percent = useMemo(() => new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 1 }), [locale]);

  const slices = useMemo(() => {
    const positive = data.filter((d) => Number.isFinite(d.value) && d.value > 0);
    if (positive.length <= maxSlices) return positive;
    const kept = positive.slice(0, maxSlices - 1);
    const rest = positive.slice(maxSlices - 1).reduce((sum, d) => sum + d.value, 0);
    return [...kept, { name: otherLabel, value: rest }];
  }, [data, maxSlices, otherLabel]);

  const total = slices.reduce((sum, d) => sum + d.value, 0);
  const colors = slices.map((d, i) => seriesColor(d.color, i));
  const cx = size.width / 2;
  const cy = size.height / 2;
  const outer = Math.max(0, Math.min(size.width, size.height) / 2 - 6);
  const inner = donut ? outer * 0.62 : 0;

  let angle = 0;
  const arcs = slices.map((d, i) => {
    const start = angle;
    angle += (d.value / total) * Math.PI * 2;
    return { ...d, start, end: angle, color: colors[i]! };
  });

  const legend = arcs.map((a) => ({
    name: showPercent ? `${a.name} · ${percent.format(a.value / total)}` : a.name,
    color: a.color,
    shape: "rect" as const,
  }));

  const activeArc = active !== null ? arcs[active] : undefined;
  const tooltip = activeArc
    ? (() => {
        const [x, y] = polar(cx, cy, (outer + inner) / 2 || outer * 0.6, (activeArc.start + activeArc.end) / 2);
        return {
          x,
          y,
          rows: [{ name: `${activeArc.name} · ${percent.format(activeArc.value / total)}`, color: activeArc.color, shape: "rect" as const, value: fmt.value(activeArc.value) }],
        };
      })()
    : null;

  return (
    <ChartFrame
      label={label}
      className={className}
      skeleton={skeleton}
      skeletonPlot={<PieSkeleton donut={donut} />}
      skeletonLegend={Math.min(data.length || 4, maxSlices)}
      empty={slices.length === 0}
      emptyText={emptyText}
      legend={legend}
      legendPosition="bottom"
      table={{ columns: ["", "Değer", "Oran"], rows: arcs.map((a) => [a.name, fmt.value(a.value), percent.format(a.value / total)]) }}
      tooltip={tooltip}
      plotRef={plotRef}
      plotWidth={size.width}
      onKeyDown={(e) => {
        const next = nextIndex(e.key, active, arcs.length);
        if (next === null) return;
        e.preventDefault();
        setActive(next);
      }}
      onBlur={() => setActive(null)}
    >
      {outer > 0 && (
        <svg aria-hidden width={size.width} height={size.height} className="absolute inset-0 overflow-visible">
          {animated && (
            <defs>
              {/* Süpürme: saat 12'den saat yönünde açılan maske. Kalın çizgili daire tüm diski
                  (üzerine gelince büyüyen dilim dahil) kaplar; daire yolu saat 3'ten başladığı için -90°. */}
              <mask id={maskId} maskUnits="userSpaceOnUse">
                <circle
                  cx={cx}
                  cy={cy}
                  r={(outer + 6) / 2}
                  fill="none"
                  stroke="white"
                  strokeWidth={outer + 6}
                  transform={`rotate(-90 ${cx} ${cy})`}
                  {...drawProps(animated)}
                />
              </mask>
            </defs>
          )}
          <g mask={animated ? `url(#${maskId})` : undefined}>
          {arcs.map((a, i) => (
            <path
              key={a.name}
              d={arcPath(cx, cy, i === active ? outer + 4 : outer, inner, a.start, a.end)}
              fill={a.color}
              // Dilimler arası 2px yüzey boşluğu (çizgi değil, yüzey rengi).
              className="stroke-mari-surface transition-[d] duration-150 motion-reduce:transition-none"
              strokeWidth={arcs.length > 1 ? 2 : 0}
              strokeLinejoin="round"
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => setActive(null)}
            />
          ))}
          </g>
          {donut && (
            <g className={cn("pointer-events-none", fadeAfterProps(animated, 600).className)} style={fadeAfterProps(animated, 600).style}>
              <text x={cx} y={cy} dy="-0.35em" textAnchor="middle" className="fill-mari-muted text-xs">
                {centerLabel}
              </text>
              <text x={cx} y={cy} dy="1em" textAnchor="middle" className="fill-mari-foreground text-lg font-semibold">
                {centerValue ?? fmt.value(total)}
              </text>
            </g>
          )}
        </svg>
      )}
    </ChartFrame>
  );
}
