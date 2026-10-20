/*
 * `foundations/Elevation.mdx`'te vaat edilen tablo: `shadow-mari-*` + ince
 * `border-mari-border` kombinasyonu birlikte kullanılır. Koyu temada saf
 * siyah-alfa gölge tek başına neredeyse görünmez — yükseklik hissi asıl
 * kenarlıktan gelir, gölge sadece üstüne biner. Faz 13 öncesi component'ler
 * (Card, Carousel) `shadow-md`/`shadow` gibi tokensız Tailwind built-in'lerini
 * kullanıyordu; bu tablo onların yerini alır. Düz metin: modül seviyesindeki
 * bir `cn()` çağrısı yan etkili sayılıp tree-shaking'i bozar (Faz 4c).
 */
export const elevationClass: Record<"sm" | "md" | "lg" | "xl", string> = {
  sm: "shadow-mari-sm border border-mari-border",
  md: "shadow-mari-md border border-mari-border",
  lg: "shadow-mari-lg border border-mari-border",
  xl: "shadow-mari-xl border border-mari-border",
};
