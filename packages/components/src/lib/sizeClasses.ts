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
