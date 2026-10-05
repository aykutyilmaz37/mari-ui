import type React from "react";

/**
 * Giriş animasyonu (`animated`): grafik ilk çizildiğinde — iskeletten yüklü
 * hale geçerken de — işaretler büyür/çizilir. Varsayılan açık (`animated={false}`
 * ile kapatılır). Yalnız CSS: başlangıç hali `both` dolgu kipiyle animasyonun
 * içinde; `motion-reduce:animate-none` ile hareket azaltma tercihinde
 * animasyon hiç çalışmaz ve işaret doğrudan son halinde görünür.
 * Keyframe'ler `styles.css`te (`mari-chart-*`).
 */
export const CHART_ANIMATION_MS = 700;

/** Tailwind derleme tarayıcısı için literal sınıflar. */
const GROW_Y = "animate-[mari-chart-grow-y_700ms_var(--mari-easing-decelerate)_both] motion-reduce:animate-none";
const GROW_X = "animate-[mari-chart-grow-x_700ms_var(--mari-easing-decelerate)_both] motion-reduce:animate-none";
const DRAW = "animate-[mari-chart-draw_900ms_var(--mari-easing-decelerate)_both] motion-reduce:animate-none";
const FADE = "animate-[mari-fade-in_300ms_ease-out_both] motion-reduce:animate-none";

/** Ardışık işaretler arasında küçük gecikme — toplamda en fazla ~0.4 sn. */
const stagger = (index: number, count: number) => `${Math.round((Math.min(index, count) * 400) / Math.max(count, 1))}ms`;

/**
 * Çubuk: sıfır çizgisinden büyür. SVG öğelerinde `transform-origin` kullanıcı
 * biriminde (görünüm kutusu) çalışır → kökeni sıfır çizgisine koyarız; negatif
 * çubuklar da aynı çizgiden aşağı/sola büyür.
 */
export function growProps(animated: boolean | undefined, horizontal: boolean, zero: number, index: number, count: number): { className?: string; style?: React.CSSProperties } {
  if (!animated) return {};
  return {
    className: horizontal ? GROW_X : GROW_Y,
    style: { transformOrigin: horizontal ? `${zero}px 0px` : `0px ${zero}px`, animationDelay: stagger(index, count) },
  };
}

/**
 * Çizgi/alan: soldan sağa açılan kırpma dikdörtgeni (`clipPath`). Boşluklu
 * (eksik veri) çizgiler ve alan dolgusu da aynı hareketle açılır.
 */
export function revealRectProps(animated: boolean | undefined, left: number): { className?: string; style?: React.CSSProperties } {
  if (!animated) return {};
  return { className: GROW_X, style: { transformOrigin: `${left}px 0px` } };
}

/** Yay/dilim süpürmesi: `pathLength=1` yolda `stroke-dashoffset` 1 → 0. */
export function drawProps(animated: boolean | undefined): { className?: string; pathLength?: number; strokeDasharray?: string } {
  if (!animated) return {};
  return { className: DRAW, pathLength: 1, strokeDasharray: "1 1" };
}

/** İşaretlerden sonra beliren öğeler (son nokta, merkez yazısı). */
export function fadeAfterProps(animated: boolean | undefined, delayMs = CHART_ANIMATION_MS): { className?: string; style?: React.CSSProperties } {
  if (!animated) return {};
  return { className: FADE, style: { animationDelay: `${delayMs}ms` } };
}
