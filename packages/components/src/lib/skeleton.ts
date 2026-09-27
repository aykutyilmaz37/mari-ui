import { cn } from "@mari-ui/core";

/**
 * Faz 15 — component'lerin ortak `skeleton` sözleşmesi.
 *
 * `loading` ≠ `skeleton`: `loading` = bir EYLEM sürüyor (Button spinner'ı,
 * component etkileşimli kalır ya da disabled olur). `skeleton` = VERİ henüz
 * yok; component kendi geometrisinde (aynı boyut + radius sınıfları) içeriksiz
 * bir yer tutucu çizer → yüklenince layout zıplamaz.
 *
 * Yer tutucu ekran okuyucudan gizlidir; "yükleniyor" duyurusu tüketicinin
 * işidir (yüklenen bölgeye `aria-busy`, ya da tek bir `<Skeleton label>`).
 */
export interface SkeletonableProps {
  /** Veri gelene kadar component'in kendi boyutunda iskelet çizer. */
  skeleton?: boolean;
}

/**
 * Tek kaynak dolgu: `active` → parıltı (gradyan kayar), değilse düz.
 * `prefers-reduced-motion`da parıltı durur.
 */
export function skeletonFill(active: boolean | undefined): string {
  return active
    ? "bg-linear-to-r from-mari-border/70 via-mari-surface-alt to-mari-border/70 bg-[length:400%_100%] animate-[mari-skeleton-shimmer_1.4s_ease_infinite] motion-reduce:animate-none"
    : "bg-mari-border/70";
}

/**
 * Bir component'in `skeleton` dalında kök elemana yayılacak prop'lar.
 * `className`e component'in GERÇEK boyut/radius sınıflarını verin (örn.
 * `sizeClass[size]`) ki iskelet ile yüklenmiş hali birebir aynı kutuyu kaplasın.
 */
export function skeletonBoxProps(className?: string) {
  return {
    "aria-hidden": true as const,
    "data-skeleton": "",
    // Dolgu ve şeffaf metin SONDA: `className` bir metin rengi (ör. Typography'nin
    // `text-mari-foreground`'u) taşısa bile twMerge onları ezmesin.
    className: cn("pointer-events-none select-none", className, skeletonFill(true), "text-transparent"),
  };
}
