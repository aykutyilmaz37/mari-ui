/**
 * Faz 16.9 — SVG `d` yolları (d3-shape'in ihtiyaç duyduğumuz kısmı):
 * düz/yumuşak çizgi, alan, pasta/halka dilimi, yay.
 */

export type Point = [number, number];
export type Curve = "linear" | "smooth";

const f = (n: number) => Number(n.toFixed(2));

function linearSegments(points: Point[]): string {
  return points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${f(x)},${f(y)}`).join("");
}

/**
 * Monoton kübik eğri (Fritsch–Carlson; d3 `curveMonotoneX` ile aynı fikir):
 * noktalardan geçer, iki nokta arasında taşma YAPMAZ — veri 0 ile 10
 * arasındaysa çizgi 11'e çıkmaz, yanıltıcı tepe çizmez.
 */
function monotoneSegments(points: Point[]): string {
  const n = points.length;
  if (n < 3) return linearSegments(points);
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(points[i + 1]![0] - points[i]![0]);
    slope.push((points[i + 1]![1] - points[i]![1]) / (dx[i] || 1));
  }
  const tangent: number[] = [slope[0]!];
  for (let i = 1; i < n - 1; i++) {
    const a = slope[i - 1]!;
    const b = slope[i]!;
    if (a * b <= 0) tangent.push(0);
    else {
      const w1 = 2 * dx[i]! + dx[i - 1]!;
      const w2 = dx[i]! + 2 * dx[i - 1]!;
      tangent.push((w1 + w2) / (w1 / a + w2 / b));
    }
  }
  tangent.push(slope[n - 2]!);

  let d = `M${f(points[0]![0])},${f(points[0]![1])}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;
    const h = dx[i]! / 3;
    d += `C${f(x0 + h)},${f(y0 + tangent[i]! * h)},${f(x1 - h)},${f(y1 - tangent[i + 1]! * h)},${f(x1)},${f(y1)}`;
  }
  return d;
}

/** Çizgi yolu. Boş/eksik (`null`) değerler çizgiyi böler — veri yokken çizgi uydurulmaz. */
export function linePath(points: Array<Point | null>, curve: Curve = "linear"): string {
  const segments: Point[][] = [[]];
  for (const p of points) {
    if (p) segments[segments.length - 1]!.push(p);
    else if (segments[segments.length - 1]!.length) segments.push([]);
  }
  const draw = curve === "smooth" ? monotoneSegments : linearSegments;
  return segments.filter((s) => s.length).map(draw).join("");
}

/** Alan yolu: çizgi + taban çizgisine (`baseY`) kapanış. Her kesintisiz parça ayrı kapanır. */
export function areaPath(points: Array<Point | null>, baseY: number, curve: Curve = "linear"): string {
  const segments: Point[][] = [[]];
  for (const p of points) {
    if (p) segments[segments.length - 1]!.push(p);
    else if (segments[segments.length - 1]!.length) segments.push([]);
  }
  return segments
    .filter((s) => s.length > 1)
    .map((s) => {
      const top = curve === "smooth" ? monotoneSegments(s) : linearSegments(s);
      return `${top}L${f(s[s.length - 1]![0])},${f(baseY)}L${f(s[0]![0])},${f(baseY)}Z`;
    })
    .join("");
}

/** Açı (radyan, 0 = saat 12 yönü, saat yönünde artar) → nokta. */
export function polar(cx: number, cy: number, r: number, angle: number): Point {
  return [cx + r * Math.sin(angle), cy - r * Math.cos(angle)];
}

/**
 * Pasta/halka dilimi. `inner` 0 → pasta dilimi, > 0 → halka dilimi.
 * Tam tur (2π) iki yarım yayla çizilir (tek yay SVG'de sıfır uzunluk olur).
 */
export function arcPath(cx: number, cy: number, outer: number, inner: number, start: number, end: number): string {
  const sweep = end - start;
  if (sweep <= 0) return "";
  if (sweep >= Math.PI * 2 - 1e-6) {
    const mid = start + Math.PI;
    return arcPath(cx, cy, outer, inner, start, mid) + arcPath(cx, cy, outer, inner, mid, start + Math.PI * 2);
  }
  const large = sweep > Math.PI ? 1 : 0;
  const [x0, y0] = polar(cx, cy, outer, start);
  const [x1, y1] = polar(cx, cy, outer, end);
  if (inner <= 0) {
    return `M${f(cx)},${f(cy)}L${f(x0)},${f(y0)}A${f(outer)},${f(outer)},0,${large},1,${f(x1)},${f(y1)}Z`;
  }
  const [x2, y2] = polar(cx, cy, inner, end);
  const [x3, y3] = polar(cx, cy, inner, start);
  return `M${f(x0)},${f(y0)}A${f(outer)},${f(outer)},0,${large},1,${f(x1)},${f(y1)}L${f(x2)},${f(y2)}A${f(inner)},${f(inner)},0,${large},0,${f(x3)},${f(y3)}Z`;
}

/** Açık yay (Gauge izi ve dolgusu — `stroke` ile çizilir). */
export function strokeArcPath(cx: number, cy: number, r: number, start: number, end: number): string {
  if (end - start <= 0) return "";
  const [x0, y0] = polar(cx, cy, r, start);
  const [x1, y1] = polar(cx, cy, r, end);
  return `M${f(x0)},${f(y0)}A${f(r)},${f(r)},0,${end - start > Math.PI ? 1 : 0},1,${f(x1)},${f(y1)}`;
}
