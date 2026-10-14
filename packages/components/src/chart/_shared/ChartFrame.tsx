"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import { Empty } from "../../empty";
import { ChartEmpty, LegendSkeleton } from "./ChartSkeleton";

export interface LegendItem {
  name: string;
  color: string;
  /** Lejant işareti işaretlediği şekle benzer: çubuk/alan/dilim → kare, çizgi → kısa çizgi. */
  shape: "rect" | "line";
}

export interface TooltipRow extends LegendItem {
  value: string;
}

export interface TooltipState {
  /** Grafik alanı içindeki piksel konumu. */
  x: number;
  y: number;
  title?: string;
  rows: TooltipRow[];
}

export interface TableModel {
  columns: string[];
  rows: Array<Array<string>>;
}

function Swatch({ color, shape }: Pick<LegendItem, "color" | "shape">) {
  return shape === "line" ? (
    <span aria-hidden className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
  ) : (
    <span aria-hidden className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
  );
}

export function ChartLegend({ items }: Readonly<{ items: LegendItem[] }>) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-mari-muted">
      {items.map((item) => (
        <li key={item.name} className="flex items-center gap-1.5">
          <Swatch color={item.color} shape={item.shape} />
          {item.name}
        </li>
      ))}
    </ul>
  );
}

/**
 * Tek tooltip, o noktadaki TÜM seriler. Değer önde ve güçlü, seri adı ikincil
 * (lejantın tersi: okuyucu seriyi biliyor, sayıyı istiyor). Görsel kolaylık —
 * değerlere tablo ile de ulaşılır, bu yüzden ekran okuyucudan gizli.
 */
function ChartTooltip({ state, width }: Readonly<{ state: TooltipState; width: number }>) {
  const flip = state.x > width / 2;
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-mari-tooltip min-w-32 rounded-md border border-mari-border bg-mari-surface px-3 py-2 text-xs shadow-mari-md"
      style={{
        left: state.x,
        top: state.y,
        transform: `translate(${flip ? "calc(-100% - 0.75rem)" : "0.75rem"}, -50%)`,
      }}
    >
      {state.title && <p className="mb-1 text-mari-muted">{state.title}</p>}
      <ul className="flex flex-col gap-1">
        {state.rows.map((row) => (
          <li key={row.name} className="flex items-center gap-2">
            <Swatch color={row.color} shape="line" />
            <span className="font-semibold tabular-nums text-mari-foreground">{row.value}</span>
            <span className="text-mari-muted">{row.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export interface ChartFrameProps {
  label: string;
  className?: string;
  skeleton?: boolean;
  empty: boolean;
  emptyText: string;
  legend?: LegendItem[];
  table: TableModel;
  tooltip: TooltipState | null;
  plotRef: React.Ref<HTMLDivElement>;
  plotWidth: number;
  /** Klavye: ok tuşlarıyla odak noktasını gezdirmek için (grafik türü işler). */
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onBlur?: () => void;
  children: React.ReactNode;
  /** Lejant konumu. Varsayılan üstte (okuyucu önce neyin ne olduğunu görsün). */
  legendPosition?: "top" | "bottom";
  /** İskelette çizim alanı — grafiğin kendi şekli (`ChartSkeleton`). */
  skeletonPlot: React.ReactNode;
  /** İskelette lejant öğesi sayısı (0 → lejant yok); yüklü halle aynı yerde. */
  skeletonLegend?: number;
}

/**
 * Tüm grafiklerin ortak kabuğu: lejant, ölçülen çizim alanı, tooltip, boş ve
 * iskelet hali, ekran okuyucu tablosu. Değerler tooltip'e kapanmaz — aynı veri
 * görünmez bir `<table>`da da var (renk tek başına kimlik taşımaz kuralı).
 */
export function ChartFrame({
  label,
  className,
  skeleton,
  empty,
  emptyText,
  legend,
  table,
  tooltip,
  plotRef,
  plotWidth,
  onKeyDown,
  onBlur,
  children,
  legendPosition = "top",
  skeletonPlot,
  skeletonLegend = 0,
}: Readonly<ChartFrameProps>) {
  if (skeleton) {
    const legendStub = skeletonLegend > 0 ? <LegendSkeleton count={skeletonLegend} /> : null;
    return (
      <div aria-hidden data-skeleton="" className={cn("pointer-events-none flex h-64 w-full min-w-0 flex-col gap-3", className)}>
        {legendPosition === "top" && legendStub}
        <div className="relative min-h-0 flex-1">{skeletonPlot}</div>
        {legendPosition === "bottom" && legendStub}
      </div>
    );
  }

  const interactive = !empty && Boolean(onKeyDown);
  const legendNode = legend && legend.length > 0 && !empty ? <ChartLegend items={legend} /> : null;

  return (
    <figure aria-label={label} className={cn("flex h-64 w-full min-w-0 flex-col gap-3", className)}>
      {legendPosition === "top" && legendNode}
      <div
        ref={plotRef}
        className="relative min-h-0 flex-1 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
        {...(interactive
          ? { role: "group", tabIndex: 0, "aria-label": `${label}. Değerleri ok tuşlarıyla gezin.`, onKeyDown, onBlur }
          : {})}
      >
        {empty ? (
          <ChartEmpty plot={skeletonPlot}>
            <Empty size="sm" title={emptyText} />
          </ChartEmpty>
        ) : (
          children
        )}
        {tooltip && <ChartTooltip state={tooltip} width={plotWidth} />}
      </div>
      {legendPosition === "bottom" && legendNode}
      {!empty && (
        <table className="sr-only">
          <caption>{label}</caption>
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </figure>
  );
}

/** Ok/Home/End ile 0…count-1 arasında gezinme; diğer tuşlarda `null`. */
export function nextIndex(key: string, current: number | null, count: number): number | null {
  if (count === 0) return null;
  switch (key) {
    case "ArrowRight":
    case "ArrowDown":
      return current === null ? 0 : Math.min(current + 1, count - 1);
    case "ArrowLeft":
    case "ArrowUp":
      return current === null ? count - 1 : Math.max(current - 1, 0);
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return null;
  }
}
