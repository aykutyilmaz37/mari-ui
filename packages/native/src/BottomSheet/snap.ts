/** Durak noktası: pt ya da ekran yüksekliğinin yüzdesi ("50%"). */
export type SnapPoint = number | `${number}%`;

/** Durakları pt'ye çevirir, küçükten büyüğe sıralar; ekranın %95'ini aşamaz. */
export function resolveSnapPoints(points: SnapPoint[], screenHeight: number): number[] {
  const max = screenHeight * 0.95;
  const px = points.map((p) => (typeof p === "number" ? p : (Number.parseFloat(p) / 100) * screenHeight));
  return [...new Set(px.map((h) => Math.round(Math.min(Math.max(h, 0), max))))].sort((a, b) => a - b);
}

/** Bırakınca kapanması için en alt durağın altına çekilmesi gereken oran. */
export const CLOSE_RATIO = 0.35;
/** Bu hızdan (pt/ms) hızlı fırlatma yönü belirler. */
export const FLING_VELOCITY = 0.8;

/**
 * Parmak bırakıldığında hedef: durak indeksi ya da `-1` (kapat).
 * `height` panelin o anki görünen yüksekliği, `vy` aşağı yönde pozitif hız.
 * Hızlı fırlatma yönündeki bir sonraki durağa gider; aşağı fırlatma en alt
 * duraktaysa kapatır. Yavaş bırakmada en yakın durak; en alt durağın
 * `CLOSE_RATIO` kadar altına inildiyse kapatır.
 */
export function releaseTarget(height: number, vy: number, snaps: number[], closable = true): number {
  const lowest = snaps[0] ?? 0;
  if (vy > FLING_VELOCITY) {
    const below = [...snaps].reverse().findIndex((s) => s < height - 1);
    if (below === -1) return closable ? -1 : 0;
    return snaps.length - 1 - below;
  }
  if (vy < -FLING_VELOCITY) {
    const above = snaps.findIndex((s) => s > height + 1);
    return above === -1 ? snaps.length - 1 : above;
  }
  if (closable && height < lowest * (1 - CLOSE_RATIO)) return -1;
  let nearest = 0;
  snaps.forEach((s, i) => {
    if (Math.abs(s - height) < Math.abs((snaps[nearest] ?? 0) - height)) nearest = i;
  });
  return nearest;
}
