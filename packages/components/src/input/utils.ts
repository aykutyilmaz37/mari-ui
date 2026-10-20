import type React from "react";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { borderStrongColorClass } from "../lib/colorClasses";
import { sizeClass } from "../lib/sizeClasses";
import type { InputShape, InputVariant } from "./types";

/*
 * Kendi `SIZE_CLASS`/`TEXTAREA_SIZE_CLASS` tabloları vardı — `lib.sizeClass`
 * ile SAYISAL OLARAK zaten birebir aynıydı (yükseklik/padding/font). Faz 13
 * gereği tek kaynağa bağlandı; rakip tablo silindi.
 */
export function getSizeClasses(size: Size): string {
  return sizeClass[size];
}

/** Textarea çok satırlı olduğu için sabit `h-*` almaz — geri kalan (padding/font/gap/radius) aynı ölçekten. */
export function getTextareaSizeClasses(size: Size): string {
  return cn(sizeClass[size], "h-auto");
}

/*
 * Odakta kenarlık ROL RENGİNE döner: eskiden açık `-border` tonuydu
 * (#93c6f6 ≈ 1.8:1 beyazda — WCAG 1.4.11'in 3:1'ini geçmiyordu; outline
 * Button'da bulunan sorunun aynısı). Ayrıca ofsetli outline yerine kenarlığa
 * yapışık yumuşak bir hale (`ring`) — modern form alanı görünümü, iki ayrı
 * çerçeve üst üste binmiyor. Literal tablo: pseudo-class önekleri runtime'da
 * string birleştirmesiyle kurulmaz (Tailwind taraması).
 */
const FOCUS_BORDER_CLASS: Record<ColorRole, string> = {
  primary: "focus-within:border-mari-primary focus-within:ring-mari-primary/20",
  accent: "focus-within:border-mari-accent focus-within:ring-mari-accent/20",
  success: "focus-within:border-mari-success focus-within:ring-mari-success/20",
  error: "focus-within:border-mari-error focus-within:ring-mari-error/20",
  warning: "focus-within:border-mari-warning focus-within:ring-mari-warning/20",
  info: "focus-within:border-mari-info focus-within:ring-mari-info/20",
  neutral: "focus-within:border-mari-neutral focus-within:ring-mari-neutral/20",
};

/** Kutu (wrapper) ortak sınıfları — Input ve Textarea. */
export const FIELD_BASE_CLASS = "transition-[color,background-color,border-color,box-shadow] duration-150 focus-within:ring-3";

/**
 * Devre dışı: `pointer-events-none` KULLANILMAZ — imleci de kapatıp
 * `cursor-not-allowed`'ı hiç göstermiyordu. Yazmayı native `disabled` engeller.
 */
export const FIELD_DISABLED_CLASS = "opacity-50 cursor-not-allowed [&_*]:cursor-not-allowed";

/**
 * İOS Safari 16px'ten küçük yazılı bir alana odaklanınca sayfayı yakınlaştırır
 * (ve geri uzaklaştırmaz). Dar ekranda alanın METNİ en az 16px olur; `sm` (640px)
 * ve üstünde boyut ölçeğinin kendi fontu geçerli.
 */
export const FIELD_MOBILE_TEXT_CLASS = "max-sm:text-base";

/*
 * Kullanıcı geri bildirimi: `color` verilmediyse (yani gerçek bir
 * doğrulama durumu YOKSA) dinlenme halindeki kenarlık HER ZAMAN nötr/gri
 * olmalı (`border-mari-input` — Faz 13.0a'da tam bunun için eklenen ama o
 * zamana kadar hiç tüketilmeyen token) — eskiden varsayılan `"primary"`e
 * düşüp her input'u sürekli mavi gösteriyordu. Odaklanınca `primary`e döner.
 * `color` AÇIKÇA verildiyse (örn. `error`/`warning` doğrulama durumu) o renk
 * dinlenme halinde de kalıcıdır — odak beklemeden görünür olmalı.
 */
export function getVariantClasses(variant: InputVariant, color: ColorRole | undefined): string {
  // Açık renk (doğrulama durumu) → rol rengi; açık `-border` tonu beyazda
  // ~1.8:1 ile WCAG 1.4.11'in 3:1'ini geçmiyordu (Faz 15).
  const restBorderClass = color ? borderStrongColorClass[color] : "border-mari-input";
  const focusBorderClass = FOCUS_BORDER_CLASS[color ?? "primary"];

  switch (variant) {
    case "outline":
      return cn("border bg-mari-surface text-mari-foreground", restBorderClass, focusBorderClass);
    case "soft":
      return cn("border bg-mari-surface-alt text-mari-foreground", restBorderClass, focusBorderClass);
    case "ghost":
      // Kenarlık yok → odak göstergesi tek başına halka.
      return "border-none bg-transparent focus-within:ring-mari-ring/40";
    case "underlined":
      // Halkasız: alt çizgili alanın odağı çizginin kendisidir.
      return cn("border-b bg-transparent rounded-none focus-within:ring-0", restBorderClass, focusBorderClass);
  }
}

/*
 * `underlined` her zaman köşesiz — eskiden `shape` sınıfı varyanttan SONRA
 * geldiği için `rounded-md` kazanıyor ve alt çizginin uçları bükülüyordu.
 */
export function getShapeClasses(shape: InputShape, variant?: InputVariant): string {
  if (variant === "underlined") return "rounded-none";
  return { square: "rounded-none", pill: "rounded-full px-4", default: "rounded-md" }[shape];
}

export function isClearable(allowClear: boolean | { clearIcon?: React.ReactNode } | undefined): boolean {
  return typeof allowClear === "boolean" ? allowClear : !!allowClear;
}

/*
 * Temizle düğmesi alanı GERÇEK bir değişiklik olarak boşaltır: yerel değer
 * setter'ı + `input` olayı → React `onChange`'i gerçek bir ChangeEvent'le
 * çalışır. Eskiden yalnız iç state siliniyordu; kontrollü kullanımda
 * (`value` + `onChange`) `onChange` hiç çağrılmadığı için X hiçbir şey
 * silmiyordu (Tree arama story'sinde yakalandı).
 */
export function clearNativeValue(el: HTMLInputElement | HTMLTextAreaElement | null): void {
  if (!el) return;
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  // Önce tümünü seç: MaskedInput'un maske kütüphanesi değişikliği imleç/seçime göre
  // yorumlar; seçimsiz boşaltmayı geri alıyordu (temizle butonu çalışmıyordu).
  // `select()`, `setSelectionRange`'in aksine seçimsiz tiplerde (email, number) hata atmaz.
  el.select();
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, "");
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

