"use client";

import React, { useMemo, useState } from "react";
import type { CartesianChartProps } from "../types";
import { ChartFrame, nextIndex, type TooltipState } from "../_shared/ChartFrame";
import { XLabels, XValueGrid, YGrid, labelStride, plotBox, type PlotBox } from "../_shared/cartesian";
import { makeFormatters, seriesColor } from "../_shared/format";
import { bandScale, linearScale, niceDomain } from "../_shared/scale";
import { useChartSize } from "../_shared/useChartSize";
import { CartesianSkeleton } from "../_shared/ChartSkeleton";
import { growProps } from "../_shared/animation";

export interface BarChartProps<T> extends CartesianChartProps<T> {
  /** `"vertical"` (varsayılan): sütunlar. `"horizontal"`: yatay çubuklar — uzun kategori adları ve sıralamalar için. */
  layout?: "vertical" | "horizontal";
  /** Serileri üst üste yığar (parça–bütün). Varsayılan: yan yana gruplu. */
  stacked?: boolean;
}

import { GAP, buildBars, num, valueExtent } from "./bars";

/**
 * Faz 16.9 — çubuk grafiği. Kategoriler arası büyüklük karşılaştırması.
 * Çubuklar tek tabandan büyür, veri ucu 4px yuvarlak, kalınlık en fazla
 * 1.5rem (bant boşluğu nefes payı kalır). Vuruş hedefi tüm kategori bandı;
 * tooltip o kategorideki tüm serileri gösterir. Negatif değerler sıfır
 * çizgisinin altına iner.
 */
export function BarChart<T>({
  data,
  xKey,
  series,
  label,
  layout = "vertical",
  stacked = false,
  xFormatter,
  valueFormatter,
  locale = "tr-TR",
  showGrid = true,
  showLegend,
  emptyText = "Veri yok",
  skeleton,
  animated = true,
  className,
}: BarChartProps<T>) {
  const [plotRef, size] = useChartSize<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const fmt = useMemo(() => makeFormatters(locale, valueFormatter), [locale, valueFormatter]);
  const horizontal = layout === "horizontal";

  const categories = data.map((row) => (xFormatter ? xFormatter(row[xKey], row) : String(row[xKey] ?? "")));
  const colors = series.map((s, i) => seriesColor(s.color, i));

  const matrix = data.map((row) => series.map((s) => num(row[s.key])));
  const domain = niceDomain(...valueExtent(matrix, stacked));

  // Yatayda sol boşluk kategori adlarına, dikeyde değer etiketlerine göre.
  const box: PlotBox = plotBox(size.width, size.height, size.rem, horizontal ? categories : domain.ticks.map(fmt.axis));
  // Yatayda değer ekseni etiketleri altta; kategori etiketleri solda (plotBox sol boşluğu onlara göre).
  const value = horizontal ? linearScale([domain.min, domain.max], [box.left, box.left + box.width]) : linearScale([domain.min, domain.max], [box.top + box.height, box.top]);
  const band = horizontal ? bandScale(data.length, [box.top, box.top + box.height], 0.3) : bandScale(data.length, [box.left, box.left + box.width], 0.3);
  const maxThickness = size.rem * 1.5;
  const groupCount = stacked ? 1 : series.length;
  const thickness = Math.max(1, Math.min(maxThickness, (band.bandwidth - GAP * (groupCount - 1)) / groupCount));
  const zero = value(0);
  const bars = buildBars(matrix, { horizontal, stacked, band, value, thickness });

  const legend = (showLegend ?? series.length > 1) ? series.map((s, i) => ({ name: s.name, color: colors[i]!, shape: "rect" as const })) : undefined;

  const tooltipAt = (i: number): TooltipState => {
    const row = data[i]!;
    const total = series.reduce((acc, s) => acc + num(row[s.key]), 0);
    const tip = value(stacked ? total : Math.max(...series.map((s) => num(row[s.key])), 0));
    return {
      x: horizontal ? tip : band.center(i),
      y: horizontal ? band.center(i) : tip,
      title: categories[i],
      rows: series.map((s, si) => ({ name: s.name, color: colors[si]!, shape: "rect", value: fmt.value(num(row[s.key])) })),
    };
  };

  const stride = horizontal ? 1 : labelStride(categories, box.width, size.rem);
  const ready = size.width > 0 && box.width > 0 && box.height > 0;
  const axisLength = horizontal ? box.height : box.width;
  const step = data.length ? axisLength / data.length : 0;

  return (
    <ChartFrame
      label={label}
      className={className}
      skeleton={skeleton}
      skeletonPlot={<CartesianSkeleton shape={horizontal ? "barHorizontal" : "bar"} count={data.length || 6} />}
      skeletonLegend={legend?.length ?? 0}
      empty={data.length === 0 || series.length === 0}
      emptyText={emptyText}
      legend={legend}
      table={{
        columns: ["", ...series.map((s) => s.name)],
        rows: data.map((row, i) => [categories[i]!, ...series.map((s) => fmt.value(num(row[s.key])))]),
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
          {/* Etkin kategori bandı: hafif yüzey tonu — işaret tepki verdiğini gösterir. */}
          {active !== null &&
            (horizontal ? (
              <rect x={box.left} y={box.top + active * step} width={box.width} height={step} className="fill-mari-surface-alt" />
            ) : (
              <rect x={box.left + active * step} y={box.top} width={step} height={box.height} className="fill-mari-surface-alt" />
            ))}
          {horizontal ? (
            <>
              <XValueGrid domain={domain} x={value} box={box} format={fmt.axis} showGrid={showGrid} />
              <g aria-hidden>
                {categories.map((c, i) => (
                  <text key={i} x={box.left - 8} y={band.center(i)} dy="0.32em" textAnchor="end" className="fill-mari-muted text-xs">
                    {c}
                  </text>
                ))}
              </g>
              <line x1={zero} x2={zero} y1={box.top} y2={box.top + box.height} className="stroke-mari-muted/60" strokeWidth={1} shapeRendering="crispEdges" />
            </>
          ) : (
            <>
              <YGrid domain={domain} y={value} box={box} format={fmt.axis} showGrid={showGrid} zeroLine={false} />
              <XLabels labels={categories} xAt={(i) => band.center(i)} box={box} stride={stride} />
              <line x1={box.left} x2={box.left + box.width} y1={zero} y2={zero} className="stroke-mari-muted/60" strokeWidth={1} shapeRendering="crispEdges" />
            </>
          )}
          {bars.map((bar) => (
            <path key={`${bar.row}-${bar.series}`} d={bar.d} fill={colors[bar.series]} {...growProps(animated, horizontal, zero, bar.row, data.length)} />
          ))}
          {/* Vuruş hedefi: tüm kategori bandı (işaretten büyük). */}
          {data.map((_, i) =>
            horizontal ? (
              <rect key={i} x={box.left} y={box.top + i * step} width={box.width} height={step} fill="transparent" onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} />
            ) : (
              <rect key={i} x={box.left + i * step} y={box.top} width={step} height={box.height} fill="transparent" onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} />
            )
          )}
        </svg>
      )}
    </ChartFrame>
  );
}
