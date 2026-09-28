import type { ExtendedSize } from "@mari-ui/core";

/**
 * `@mari-ui/core`'un `componentSize` tablosuyla (height/paddingX/paddingY/
 * fontSize) BİLİNÇLİ OLARAK sayısal olarak hizalı, ama burada Tailwind'in
 * kendi built-in utility'leri kullanılır (`h-8`, `px-3`, `rounded-md`),
 * `@mari-ui/tokens`'ın `--mari-*` CSS değişkenleri değil.
 *
 * Neden: renk ekseni tema stüdyosunda ÇALIŞMA ZAMANINDA değişebilir
 * (kullanıcı primary/accent'i değiştirir) — bu yüzden renk CSS değişkeni
 * üzerinden akmalı. Boyut/radius skalası ise `mari-ui.config.json`'da
 * sadece bir PRESET seçimi (Faz 6'daki `density.radius`); rastgele bir
 * değere çekilebilir olması gerekmiyor. Bu ayrım, gereksiz yere ikinci bir
 * özel Tailwind namespace'i icat etmekten kaçınır.
 *
 * Her class ismi burada da (renk tablolarındaki gibi) literal string'tir —
 * Tailwind'in derleme-zamanı tarayıcısı için.
 */
export const sizeClass: Record<ExtendedSize, string> = {
  xs: "h-5 px-2 py-0.5 text-xs gap-1 rounded-sm",
  sm: "h-6 px-2 py-1 text-xs gap-1.5 rounded-sm",
  md: "h-8 px-3 py-1.5 text-sm gap-2 rounded-md",
  lg: "h-10 px-4 py-2 text-base gap-2 rounded-md",
  xl: "h-12 px-5 py-2.5 text-lg gap-2.5 rounded-lg",
};

/** Sadece font boyutu gereken (Typography gibi) bileşenler için. */
export const fontSizeClass: Record<ExtendedSize, string> = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

/**
 * Faz 15 — dokunmatik hedef. Varsayılan kontroller masaüstü yoğunluğunda
 * (md = 32px); parmakla kullanımda önerilen en az 44px. GÖRÜNÜMÜ DEĞİŞTİRMEDEN
 * yalnızca kaba işaretçili (dokunmatik) cihazlarda görünmez bir `::before`
 * katmanı tıklama alanını 44px'e tamamlar. Öğe `relative` olmalı.
 *
 * Dikey: (44 − yükseklik) / 2 → xs 20→12px, sm 24→10px, md 32→6px, lg 40→2px,
 * xl 48 zaten yeterli. Yatay genişletme YOK: yan yana butonlar arasında
 * (gap-2) hedefler çakışırdı; ikon-only (kare) kontroller için
 * `touchTargetSquareClass` kullanın.
 */
export const touchTargetClass: Record<ExtendedSize, string> = {
  xs: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-3",
  sm: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-2.5",
  md: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-1.5",
  lg: "pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-0.5",
  xl: "",
};

/** Kare/daire ikon-only kontroller: her yönde 44px'e tamamlar. */
export const touchTargetSquareClass: Record<ExtendedSize, string> = {
  xs: "pointer-coarse:before:absolute pointer-coarse:before:-inset-3",
  sm: "pointer-coarse:before:absolute pointer-coarse:before:-inset-2.5",
  md: "pointer-coarse:before:absolute pointer-coarse:before:-inset-1.5",
  lg: "pointer-coarse:before:absolute pointer-coarse:before:-inset-0.5",
  xl: "",
};

/**
 * Checkbox/Radio satırı (kutu + etiket) için dokunmatik hedef: satır
 * yüksekliği etiketin satır yüksekliğidir (sm 16 / md 20 / lg 24px) → 44px'e
 * tamamlar. `<label>` içindeki bir öğeye uygulanır; pseudo alana dokunmak
 * etikete dokunmak sayılır ve kontrolü değiştirir.
 */
export const checkableTouchTargetClass: Record<"sm" | "md" | "lg", string> = {
  sm: "pointer-coarse:before:absolute pointer-coarse:before:-inset-x-1 pointer-coarse:before:-inset-y-3.5",
  md: "pointer-coarse:before:absolute pointer-coarse:before:-inset-x-1 pointer-coarse:before:-inset-y-3",
  lg: "pointer-coarse:before:absolute pointer-coarse:before:-inset-x-1 pointer-coarse:before:-inset-y-2.5",
};
