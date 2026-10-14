import { cn } from "@mari-ui/core";

/*
 * `foundations/Elevation.mdx`'te vaat edilen tablo: `shadow-mari-*` + ince
 * `border-mari-border` kombinasyonu birlikte kullanılır. Koyu temada saf
 * siyah-alfa gölge tek başına neredeyse görünmez — yükseklik hissi asıl
 * kenarlıktan gelir, gölge sadece üstüne biner. Faz 13 öncesi component'ler
 * (Card, Carousel) `shadow-md`/`shadow` gibi tokensız Tailwind built-in'lerini
 * kullanıyordu; bu tablo onların yerini alır.
 */
export const elevationClass: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: cn("shadow-mari-sm", "border border-mari-border"),
  md: cn("shadow-mari-md", "border border-mari-border"),
  lg: cn("shadow-mari-lg", "border border-mari-border"),
  xl: cn("shadow-mari-xl", "border border-mari-border"),
};
