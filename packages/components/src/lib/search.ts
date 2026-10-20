/*
 * Arama için katlama: Türkçe küçük harf + aksanları at + ı→i. Böylece
 * "istanbul" → "İstanbul", "sehir" → "Şehir", "IĞDIR" → "Iğdır" bulunur.
 * Eskiden düz `toLowerCase()` vardı: "İstanbul".toLowerCase() JS'te
 * "i̇stanbul" (i + birleşik nokta) verir ve "istanbul" ile HİÇ eşleşmezdi.
 * Karakter sayısını korur (NFC girişte her harf tek karaktere iner) — vurgu
 * aralıkları özgün metne aynı indekslerle uygulanabilir.
 *
 * lib'de durur: AutoComplete, Select, Transfer ve Mentions ortak kullanır;
 * `autocomplete/`ten import edilince o klasör hepsinin bundle'ına giriyordu.
 */
export function foldForSearch(text: string): string {
  return text.toLocaleLowerCase("tr").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i");
}
