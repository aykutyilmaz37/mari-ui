/**
 * Görüntüleyicinin (ImageViewer) saf jest/geometri mantığı — DOM'suz, ayrıca test edilir.
 * Koordinatlar sahnenin (stage) MERKEZİNE göredir; görsel ölçek 1'de sahneye
 * `contain` ile sığdırılmış boyuttadır (`base`).
 */

export const MIN_SCALE = 1;
export const MAX_SCALE = 4;
/** Çift dokunuş / çift tıklama yakınlaştırması. */
export const DOUBLE_TAP_SCALE = 2.5;

export interface ViewState {
  scale: number;
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export const IDENTITY: ViewState = { scale: 1, x: 0, y: 0 };

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Görsel sahneden büyükse taşan kadar kaydırılabilir; küçükse ortada kalır. */
export function clampPan(view: ViewState, base: Size, stage: Size): ViewState {
  const maxX = Math.max(0, (base.width * view.scale - stage.width) / 2);
  const maxY = Math.max(0, (base.height * view.scale - stage.height) / 2);
  // `|| 0`: -0 yerine 0 (sınır 0 iken Math.max(-0, negatif) = -0).
  return { scale: view.scale, x: clamp(view.x, -maxX, maxX) || 0, y: clamp(view.y, -maxY, maxY) || 0 };
}

/**
 * `point` (sahne merkezine göre) sabit kalacak şekilde yeni ölçeğe geç —
 * imlecin/parmakların altındaki nokta yerinden oynamaz.
 */
export function zoomAround(view: ViewState, nextScale: number, point: { x: number; y: number }, base: Size, stage: Size): ViewState {
  const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
  const ratio = scale / view.scale;
  const next = { scale, x: point.x - (point.x - view.x) * ratio, y: point.y - (point.y - view.y) * ratio };
  return scale === MIN_SCALE ? IDENTITY : clampPan(next, base, stage);
}

/** Çift dokunuş: yakın değilse noktaya yakınlaş, yakınsa sıfırla. */
export function toggleZoom(view: ViewState, point: { x: number; y: number }, base: Size, stage: Size): ViewState {
  return view.scale > MIN_SCALE ? IDENTITY : zoomAround(view, DOUBLE_TAP_SCALE, point, base, stage);
}

/** Sürükleme bırakılınca: -1 önceki, 1 sonraki, 0 yerine dön. Hız px/ms. */
export function swipeOutcome(dx: number, velocityX: number, stageWidth: number): -1 | 0 | 1 {
  const far = Math.abs(dx) > stageWidth * 0.25;
  const fast = Math.abs(velocityX) > 0.5 && Math.abs(dx) > 20;
  if (!far && !fast) return 0;
  return dx < 0 ? 1 : -1;
}

/** Aşağı çekerek kapatma: 0..1 ilerleme (arka plan saydamlaşır, görsel küçülür). */
export function dismissProgress(dy: number, stageHeight: number): number {
  return clamp(dy / (stageHeight * 0.5), 0, 1);
}

export function shouldDismiss(dy: number, velocityY: number, stageHeight: number): boolean {
  return dy > stageHeight * 0.18 || (velocityY > 0.5 && dy > 30);
}

/**
 * İlk sürükleme yönü: yatay → kaydırma, aşağı → kapatma, belirsiz → bekle.
 * Yakınken her yön kaydırmadır (pan).
 */
export function dragIntent(dx: number, dy: number): "swipe" | "dismiss" | null {
  if (Math.hypot(dx, dy) < 8) return null;
  if (Math.abs(dx) > Math.abs(dy)) return "swipe";
  return dy > 0 ? "dismiss" : "swipe";
}

export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Küçük resimden büyüyerek açılış (FLIP): hedef kutudaki görseli, kaynak
 * kutunun yerine ve boyutuna götüren dönüşüm. Küçük resim kare kırpılmış
 * olabilir — ölçek, kaynağı KAPLAYACAK (cover) şekilde seçilir.
 */
export function originTransform(from: RectLike, to: RectLike): { x: number; y: number; scale: number } {
  if (to.width === 0 || to.height === 0) return { x: 0, y: 0, scale: 1 };
  const scale = Math.max(from.width / to.width, from.height / to.height);
  return {
    x: from.left + from.width / 2 - (to.left + to.width / 2),
    y: from.top + from.height / 2 - (to.top + to.height / 2),
    scale,
  };
}

/** Görüntülenecek komşu dilimler (önceki, şimdiki, sonraki). */
export function visibleSlides(index: number, count: number): number[] {
  return [index - 1, index, index + 1].filter((i) => i >= 0 && i < count);
}

/** Doğal boyuttaki görselin sahneye `contain` ile sığmış boyutu (büyütmeden). */
export function containSize(natural: Size, stage: Size, upscale = true): Size {
  if (natural.width === 0 || natural.height === 0) return stage;
  let ratio = Math.min(stage.width / natural.width, stage.height / natural.height);
  if (!upscale) ratio = Math.min(1, ratio);
  return { width: natural.width * ratio, height: natural.height * ratio };
}
