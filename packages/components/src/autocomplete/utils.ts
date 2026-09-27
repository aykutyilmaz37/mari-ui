import type { Option } from "./types";

/**
 * Arama için katlama: Türkçe küçük harf + aksanları at + ı→i. Böylece
 * "istanbul" → "İstanbul", "sehir" → "Şehir", "IĞDIR" → "Iğdır" bulunur.
 * Eskiden düz `toLowerCase()` vardı: "İstanbul".toLowerCase() JS'te
 * "i̇stanbul" (i + birleşik nokta) verir ve "istanbul" ile HİÇ eşleşmezdi.
 * Karakter sayısını korur (NFC girişte her harf tek karaktere iner) — vurgu
 * aralıkları özgün metne aynı indekslerle uygulanabilir.
 */
export function foldForSearch(text: string): string {
  return text.toLocaleLowerCase("tr").normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i");
}

export function getFilteredOption(options: Option[], searchText: string): Option[] {
  const query = foldForSearch(searchText.trim());
  if (!query) return options;
  return options.filter((option) => foldForSearch(option.value).includes(query));
}

/** Seçenek metnini [önce, eşleşen, sonra] olarak böler; eşleşme yoksa `null`. */
export function splitMatch(value: string, searchText: string): [string, string, string] | null {
  const query = foldForSearch(searchText.trim());
  const folded = foldForSearch(value);
  if (!query || folded.length !== value.length) return null;
  const start = folded.indexOf(query);
  if (start < 0) return null;
  const end = start + query.length;
  return [value.slice(0, start), value.slice(start, end), value.slice(end)];
}
