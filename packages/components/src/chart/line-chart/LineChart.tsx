"use client";

import React, { useMemo, useState } from "react";
import type { CartesianChartProps } from "../types";
import { ChartFrame, nextIndex, type TooltipState } from "../_shared/ChartFrame";
import { YGrid, XLabels, labelStride, plotBox } from "../_shared/cartesian";
import { makeFormatters, seriesColor } from "../_shared/format";
import { areaPath, linePath, type Curve, type Point } from "../_shared/paths";
import { extent, linearScale, niceDomain } from "../_shared/scale";
import { useChartSize } from "../_shared/useChartSize";

export interface LineChartProps<T> extends CartesianChartProps<T> {
  /** `"smooth"`: monoton eğri (veriyi aşan tepe çizmez). Varsayılan `"linear"`. */
  curve?: Curve;
  /** Çizginin altını serinin renginde hafif (%10) doldurur — Area grafiği. */
  area?: boolean;
  /**
   * y ekseni sıfırdan başlasın mı. Varsayılan: `area`da `true` (alan büyüklük
   * anlatır), çizgide `false` (değişim anlatır; sıfır eklemek eğilimi ezer).
   */
  includeZero?: boolean;
}

const toNumber = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * Faz 16.9 — çizgi / alan grafiği. Zaman ya da sıralı kategori boyunca
 * değişim. 2px çizgi; üzerine gelince dikey kılavuz en yakın noktaya oturur ve
 * o noktadaki TÜM serileri tek tooltip'te gösterir. Klavye: odaklanıp ok
 * tuşlarıyla noktalar gezilir. Eksik (`null`) değer çizgiyi böler — uydurulmaz.
 */
export function LineChart<T>({
  data,
  xKey,
  series,
  label,
  curve = "linear",
  area = false,
  includeZero = area,
  xFormatter,
  valueFormatter,
  locale = "tr-TR",
  showGrid = true,
  showLegend,
  emptyText = "Veri yok",
  skeleton,
  className,
}: LineChartProps<T>) {
  const [plotRef, size] = useChartSize<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const fmt = useMemo(() => makeFormatters(locale, valueFormatter), [locale, valueFormatter]);

  const xLabels = data.map((row) => (xFormatter ? xFormatter(row[xKey], row) : String(row[xKey] ?? "")));
  const colors = series.map((s, i) => seriesColor(s.color, i));
  const values = series.flatMap((s) => data.map((row) => toNumber(row[s.key])));
  const [lo, hi] = extent(values);
  const domain = niceDomain(includeZero ? Math.min(0, lo) : lo, includeZero ? Math.max(0, hi) : hi);
  const box = plotBox(size.width, size.height, size.rem, domain.ticks.map(fmt.axis));
  const y = linearScale([domain.min, domain.max], [box.top + box.height, box.top]);
  const xAt = (i: number) => (data.length <= 1 ? box.left + box.width / 2 : box.left + (i * box.width) / (data.length - 1));
  const stride = labelStride(xLabels, box.width, size.rem);
  const baseY = y(Math.max(domain.min, Math.min(0, domain.max)));

  const legend = (showLegend ?? series.length > 1) ? series.map((s, i) => ({ name: s.name, color: colors[i]!, shape: area ? ("rect" as const) : ("line" as const) })) : undefined;

  const tooltipAt = (i: number): TooltipState => {
    const row = data[i]!;
    const ys = series.map((s) => toNumber(row[s.key])).filter((v): v is number => v !== null);
    return {
      x: xAt(i),
      y: ys.length ? y(Math.max(...ys)) : box.top + box.height / 2,
      title: xLabels[i],
      rows: series.map((s, si) => {
        const v = toNumber(row[s.key]);
        return { name: s.name, color: colors[si]!, shape: "line", value: v === null ? "—" : fmt.value(v) };
      }),
    };
  };

  const onPointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const i = data.length <= 1 ? 0 : Math.round((px / rect.width) * (data.length - 1));
    setActive(Math.max(0, Math.min(data.length - 1, i)));
  };

  const ready = size.width > 0 && box.width > 0 && box.height > 0;

  return (
    <ChartFrame
      label={label}
      className={className}
      skeleton={skeleton}
      empty={data.length === 0 || series.length === 0}
      emptyText={emptyText}
      legend={legend}
      table={{
        columns: ["", ...series.map((s) => s.name)],
        rows: data.map((row, i) => [xLabels[i]!, ...series.map((s) => {
          const v = toNumber(row[s.key]);
          return v === null ? "—" : fmt.value(v);
        })]),
      }}
      tooltip={active !== null && data[active] ? tooltipAt(active) : null}
      plotRef={plotRef}
      plotWidth={size.width}
      onKeyDown={(e) => {
        const next = nextIndex(e.key, active, data.length);
        if (next === null) return;
        e.preventDefault();
        setActive(next);
      }}
      onBlur={() => setActive(null)}
    >
      {ready && (
        <svg aria-hidden width={size.width} height={size.height} className="absolute inset-0 overflow-visible">
          <YGrid domain={domain} y={y} box={box} format={fmt.axis} showGrid={showGrid} zeroLine />
          <XLabels labels={xLabels} xAt={xAt} box={box} stride={stride} />
          {series.map((s, si) => {
            const pts: Array<Point | null> = data.map((row, i) => {
              const v = toNumber(row[s.key]);
              return v === null ? null : [xAt(i), y(v)];
            });
            return (
              <g key={s.key}>
                {area && <path d={areaPath(pts, baseY, curve)} fill={colors[si]} fillOpacity={0.1} />}
                <path d={linePath(pts, curve)} fill="none" stroke={colors[si]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              </g>
            );
          })}
          {active !== null && (
            <g>
              <line x1={xAt(active)} x2={xAt(active)} y1={box.top} y2={box.top + box.height} className="stroke-mari-muted/50" strokeWidth={1} />
              {series.map((s, si) => {
                const v = toNumber(data[active]?.[s.key]);
                return v === null ? null : (
                  <circle key={s.key} cx={xAt(active)} cy={y(v)} r={4} fill={colors[si]} className="stroke-mari-surface" strokeWidth={2} />
                );
              })}
            </g>
          )}
          {/* Tüm çizim alanı vuruş hedefi: okuyucu tarihe nişan alır, 2px çizgiye değil. */}
          <rect
            x={box.left}
            y={box.top}
            width={box.width}
            height={box.height}
            fill="transparent"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          />
        </svg>
      )}
    </ChartFrame>
  );
}
