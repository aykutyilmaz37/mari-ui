/**
 * Carousel'in saf mantığı (react-native'siz, testli). Konumlar SLAYT
 * birimindedir: 0 = ilk slayt görünen alanın solunda, 1 = bir slayt kaymış.
 */

export type CarouselAlign = "start" | "center" | "end";

export interface ResponsiveItem {
  breakpoint: number;
  slidesToShow: number;
  slidesToScroll?: number;
}

/** Web ile aynı kural: genişlik ≤ breakpoint olan EN KÜÇÜK kural uygulanır. */
export function responsiveSlides(baseShow: number, baseScroll: number | undefined, responsive: ResponsiveItem[] | undefined, width: number): { slidesToShow: number; slidesToScroll: number } {
  let show = baseShow;
  let scroll = baseScroll ?? baseShow;
  const rule = [...(responsive ?? [])].sort((a, b) => a.breakpoint - b.breakpoint).find((r) => width <= r.breakpoint);
  if (rule) {
    show = rule.slidesToShow;
    scroll = rule.slidesToScroll ?? rule.slidesToShow;
  }
  return { slidesToShow: Math.max(1, show), slidesToScroll: Math.max(1, scroll) };
}

/** Döngü yalnız görünenden fazla slayt varsa (Embla ile aynı). */
export function canLoop(loop: boolean, count: number, show: number): boolean {
  return loop && count > show;
}

/**
 * Durak konumları (slayt birimi). Her grup `scroll` slayt; `align` grubu görünen
 * alanda hizalar. Döngüsüz `trimSnaps`: duraklar [0, count - show] aralığına
 * kırpılır (boşluk görünmez), tekrar edenler atılır.
 */
export function computeSnaps({ count, show, scroll, loop, align = "start", containScroll = "trimSnaps" }: { count: number; show: number; scroll: number; loop: boolean; align?: CarouselAlign; containScroll?: "trimSnaps" | "keepSnaps" }): number[] {
  if (count <= 0) return [];
  const shift = { start: 0, center: (show - scroll) / 2, end: show - scroll }[align];
  const groups = Math.ceil(count / scroll);
  const raw = Array.from({ length: groups }, (_, i) => i * scroll - shift);
  if (loop) return raw;
  const max = Math.max(0, count - show);
  const snaps = containScroll === "trimSnaps" ? raw.map((s) => Math.min(max, Math.max(0, s))) : raw;
  return snaps.filter((s, i) => snaps.indexOf(s) === i);
}

/** Döngüde konumu [0, count) aralığına indirger (kopya slaytlar aynı göründüğü için atlama fark edilmez). */
export function wrap(pos: number, count: number): number {
  return ((pos % count) + count) % count;
}

/** Konuma en yakın durak (döngüde dairesel uzaklıkla). */
export function nearestSnap(snaps: number[], pos: number, loop: boolean, count: number): number {
  let best = 0;
  let bestDist = Infinity;
  snaps.forEach((s, i) => {
    const raw = Math.abs(s - pos);
    const dist = loop ? Math.min(raw, count - raw) : raw;
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  });
  return best;
}

/**
 * Sürükleme bırakılınca hedef durak. Yeterince uzak (bir slaydın %25'i) ya da
 * hızlı (> 0,5 px/ms, 20px üstü — görüntüleyiciyle aynı) sürüklemede başlangıç durağından en az bir adım gider;
 * daha uzun sürüklemede en yakın durak. `dx` px, `vx` px/ms.
 */
export function releaseSnap({ snaps, start, pos, dx, vx, slideWidth, loop, count }: { snaps: number[]; start: number; pos: number; dx: number; vx: number; slideWidth: number; loop: boolean; count: number }): number {
  const n = snaps.length;
  const nearest = nearestSnap(snaps, loop ? wrap(pos, count) : pos, loop, count);
  const intent = Math.abs(dx) > slideWidth * 0.25 || (Math.abs(vx) > 0.5 && Math.abs(dx) > 20);
  if (nearest !== start || !intent) return nearest;
  const step = dx < 0 ? 1 : -1;
  if (loop) return (start + step + n) % n;
  return Math.min(n - 1, Math.max(0, start + step));
}

/**
 * Döngüde `from` konumundan `to` durağına giden EN KISA hedef konum — sondan
 * ilke ileri gidişte konum `count`'u aşar (kopya slayt), sonra `wrap` edilir.
 */
export function loopTarget(from: number, snap: number, count: number): number {
  let delta = snap - wrap(from, count);
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  return from + delta;
}

/** Ok/otomatik oynatma adımı: döngüde dairesel, değilse uçlarda durur. */
export function stepSnap(index: number, step: 1 | -1, n: number, loop: boolean): number {
  if (loop) return (index + step + n) % n;
  return Math.min(n - 1, Math.max(0, index + step));
}

/** Döngüde her iki uca eklenecek kopya slayt sayısı: bir görünen alan + bir adım payı. */
export function cloneCount(show: number, scroll: number, count: number): number {
  return Math.min(count, Math.ceil(show) + scroll);
}

/** Görünen alanda (yarısından fazlası) olan slaytlar — gerisi ekran okuyucudan gizlenir (web `inViewThreshold: 0.5`). */
export function slidesInView(pos: number, show: number, count: number, loop: boolean): Set<number> {
  const visible = new Set<number>();
  for (let i = Math.floor(pos - 1); i <= Math.ceil(pos + show); i++) {
    const overlap = Math.min(i + 1, pos + show) - Math.max(i, pos);
    if (overlap > 0.5) visible.add(loop ? wrap(i, count) : i);
  }
  return visible;
}
