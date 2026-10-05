import type { NiceDomain } from "./scale";

/** Ortalama karakter genişliği ≈ 0.6em; eksen yazısı `text-xs` = 0.75rem. */
export const approxTextWidth = (text: string, rem: number, sizeRem = 0.75) => text.length * sizeRem * rem * 0.6;

export interface PlotBox {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Çizim alanı: sol boşluk en uzun y etiketine göre, alt boşluk x etiketlerine.
 * Hepsi rem'e bağlı — büyük ekran ölçeğinde orantılı büyür.
 */
export function plotBox(width: number, height: number, rem: number, leftLabels: string[], hasBottomLabels = true): PlotBox {
  const left = Math.ceil(Math.max(0, ...leftLabels.map((l) => approxTextWidth(l, rem))) + rem * 0.5);
  const right = Math.ceil(rem * 0.75);
  const top = Math.ceil(rem * 0.5);
  const bottom = hasBottomLabels ? Math.ceil(rem * 1.75) : Math.ceil(rem * 0.5);
  return { left, right, top, bottom, width: Math.max(0, width - left - right), height: Math.max(0, height - top - bottom) };
}

/** Sığmayan x etiketlerini seyreltir: her `k`'ıncıyı gösterir (ilk ve son korunur). */
export function labelStride(labels: string[], available: number, rem: number): number {
  if (labels.length <= 1 || available <= 0) return 1;
  const widest = Math.max(...labels.map((l) => approxTextWidth(l, rem))) + rem;
  return Math.max(1, Math.ceil((widest * labels.length) / available));
}

/** Yatay kılavuz çizgileri + y ekseni değerleri. Kılavuz saç teli, düz, geri planda. */
export function YGrid({
  domain,
  y,
  box,
  format,
  showGrid,
  zeroLine,
}: {
  domain: NiceDomain;
  y: (v: number) => number;
  box: PlotBox;
  format: (v: number) => string;
  showGrid: boolean;
  zeroLine: boolean;
}) {
  return (
    <g aria-hidden>
      {domain.ticks.map((t) => (
        <g key={t}>
          {showGrid && (
            <line x1={box.left} x2={box.left + box.width} y1={y(t)} y2={y(t)} className="stroke-mari-border" strokeWidth={1} shapeRendering="crispEdges" />
          )}
          <text x={box.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-mari-muted text-xs tabular-nums">
            {format(t)}
          </text>
        </g>
      ))}
      {zeroLine && domain.min < 0 && domain.max > 0 && (
        <line x1={box.left} x2={box.left + box.width} y1={y(0)} y2={y(0)} className="stroke-mari-muted/60" strokeWidth={1} shapeRendering="crispEdges" />
      )}
    </g>
  );
}

/** Dikey kılavuz + x değerleri (yatay çubuk grafiğinin değer ekseni). */
export function XValueGrid({ domain, x, box, format, showGrid }: { domain: NiceDomain; x: (v: number) => number; box: PlotBox; format: (v: number) => string; showGrid: boolean }) {
  return (
    <g aria-hidden>
      {domain.ticks.map((t) => (
        <g key={t}>
          {showGrid && <line y1={box.top} y2={box.top + box.height} x1={x(t)} x2={x(t)} className="stroke-mari-border" strokeWidth={1} shapeRendering="crispEdges" />}
          <text x={x(t)} y={box.top + box.height + 8} dy="0.71em" textAnchor="middle" className="fill-mari-muted text-xs tabular-nums">
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Gösterilecek x etiketi indeksleri: her `stride`'ıncı; son etiket öncekine yeterince uzaksa o da. */
export function visibleLabelIndexes(count: number, stride: number): number[] {
  const shown: number[] = [];
  for (let i = 0; i < count; i += stride) shown.push(i);
  const last = count - 1;
  const prev = shown[shown.length - 1] ?? 0;
  if (last > prev && last - prev >= stride * 0.6) shown.push(last);
  return shown;
}

/** Kategori etiketleri (alt eksen). */
export function XLabels({ labels, xAt, box, stride }: { labels: string[]; xAt: (i: number) => number; box: PlotBox; stride: number }) {
  return (
    <g aria-hidden>
      {visibleLabelIndexes(labels.length, stride).map((i) => (
        <text key={i} x={xAt(i)} y={box.top + box.height + 8} dy="0.71em" textAnchor="middle" className="fill-mari-muted text-xs">
          {labels[i]}
        </text>
      ))}
    </g>
  );
}

/**
 * Çubuk: veri ucunda 4px yuvarlak, taban tarafında köşeli (tabandan büyür).
 * `end`: veri ucunun yönü.
 */
export function barPath(x: number, y: number, w: number, h: number, radius: number, end: "top" | "bottom" | "right" | "left"): string {
  if (w <= 0 || h <= 0) return "";
  const r = Math.min(radius, (end === "top" || end === "bottom" ? w : h) / 2, end === "top" || end === "bottom" ? h : w);
  const f = (n: number) => Number(n.toFixed(2));
  const [x0, y0, x1, y1] = [f(x), f(y), f(x + w), f(y + h)];
  if (r <= 0) return `M${x0},${y0}H${x1}V${y1}H${x0}Z`;
  switch (end) {
    case "top":
      return `M${x0},${y1}V${f(y + r)}Q${x0},${y0},${f(x + r)},${y0}H${f(x + w - r)}Q${x1},${y0},${x1},${f(y + r)}V${y1}Z`;
    case "bottom":
      return `M${x0},${y0}H${x1}V${f(y + h - r)}Q${x1},${y1},${f(x + w - r)},${y1}H${f(x + r)}Q${x0},${y1},${x0},${f(y + h - r)}Z`;
    case "right":
      return `M${x0},${y0}H${f(x + w - r)}Q${x1},${y0},${x1},${f(y + r)}V${f(y + h - r)}Q${x1},${y1},${f(x + w - r)},${y1}H${x0}Z`;
    case "left":
      return `M${x1},${y0}V${y1}H${f(x + r)}Q${x0},${y1},${x0},${f(y + h - r)}V${f(y + r)}Q${x0},${y0},${f(x + r)},${y0}Z`;
  }
}
