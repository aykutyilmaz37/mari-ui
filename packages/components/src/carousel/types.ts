export type DotPosition = "bottom" | "top" | "left" | "right";

/*
 * `"sides"` (varsayılan): eskiden tek seçenekti — biri solda biri sağda,
 * dikeyde ortalanmış. Metin ağırlıklı slaytlarda (örn. yorum kartları) bu,
 * ortadaki içeriğin üzerine biniyordu. Köşe değerleri okları TEK bir köşede
 * yan yana grupluyor — içerikten uzak durmaları gerektiğinde kullanılır.
 */
/**
 * Okların yeri: `sides` (varsayılan) iki yanda, dikeyde ortalı. Köşe değerleri iki oku tek
 * köşede yan yana toplar; içerik slaytın ortasındaysa üstüne binmez.
 */
export type ArrowsPlacement = "sides" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

/*
 * `"overlay"` (varsayılan): noktalar carousel'in üzerine `absolute` konumlanır
 * (`dotPosition` ile hangi kenarda olacağı belirlenir) — eskiden TEK
 * seçenekti, kısa/ikonlu slaytlarda sorun değildi ama slaytın kendi içeriği
 * (örn. bir ürün kartının fiyat satırı) tam o kenarda bitiyorsa noktalar
 * üzerine biniyordu. `"outside"` noktaları normal akışa alır — carousel'in
 * ALTINA, içerikle çakışmadan, ayrı bir satır olarak render eder.
 */
/**
 * Noktaların yeri: `overlay` (varsayılan) slaytın üzerinde, `dotPosition` kenarında;
 * `outside` slaytın dışında, içeriğin üstüne binmez.
 */
export type DotsPlacement = "overlay" | "outside";

export type EffectType = "scrollx";

export type ResponsiveItem = {
  breakpoint: number;
  slidesToShow: number;
  slidesToScroll?: number;
};

export type CarouselControls = {
  selectedIndex: number;
  scrollSnaps: number[];
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollPrev: () => void;
  scrollNext: () => void;
  scrollTo: (index: number) => void;
};
