/** Tour'un saf yardımcıları. */

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Karartma yolu: tüm ekranı kaplayan dikdörtgen + hedefin çevresinde
 * yuvarlatılmış bir delik (`fill-rule="evenodd"`). `pad` hedefin çevresindeki
 * boşluk, `r` köşe yarıçapı (px; çağıran rem'den çevirir).
 */
export function spotlightPath(vw: number, vh: number, box: Box | null, pad: number, r: number): string {
  const outer = `M0 0H${vw}V${vh}H0Z`;
  if (!box) return outer;
  const x = box.left - pad;
  const y = box.top - pad;
  const w = box.width + pad * 2;
  const h = box.height + pad * 2;
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  const hole = `M${x + rr} ${y}H${x + w - rr}A${rr} ${rr} 0 0 1 ${x + w} ${y + rr}V${y + h - rr}A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h}H${x + rr}A${rr} ${rr} 0 0 1 ${x} ${y + h - rr}V${y + rr}A${rr} ${rr} 0 0 1 ${x + rr} ${y}Z`;
  return `${outer}${hole}`;
}

/** Öğe görünür alanda tamamen mi (kaydırma gerekmez). */
export function isFullyVisible(box: Box, vw: number, vh: number): boolean {
  return box.top >= 0 && box.left >= 0 && box.top + box.height <= vh && box.left + box.width <= vw;
}

/** Yön tuşlarıyla adım: ←/→, sınırlarda kesilir. Yazı alanındayken (`editable`) uygulanmaz. */
export function stepFromKey(key: string, current: number, total: number, editable: boolean): number | null {
  if (editable) return null;
  if (key === "ArrowRight" && current < total - 1) return current + 1;
  if (key === "ArrowLeft" && current > 0) return current - 1;
  return null;
}

