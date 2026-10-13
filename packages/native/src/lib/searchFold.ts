/**
 * Arama için harf katlama — Select ve Tree / TreeSelect ortak kullanır.
 * Web'deki `normalize("NFD")`, `\p{M}` ve
 * `toLocaleLowerCase("tr")` her Hermes yapılandırmasında yok / yerel ayarı
 * yok sayabiliyor ("İ" → "i̇" iki karakter olur, vurgu aralıkları kayar).
 * Burada açık bir harf tablosu: her karakter TEK karaktere iner, uzunluk korunur.
 */

/** Katlanacak harfler: Türkçe I/İ/ı → i, aksanlılar → çıplak harf (küçük harfe indirildikten sonra). */
const FOLD: Record<string, string> = {
  ı: "i", ş: "s", ğ: "g", ü: "u", ö: "o", ç: "c",
  â: "a", á: "a", à: "a", ä: "a", ã: "a", å: "a",
  é: "e", è: "e", ê: "e", ë: "e",
  í: "i", ì: "i", î: "i", ï: "i",
  ó: "o", ò: "o", ô: "o", õ: "o",
  ú: "u", ù: "u", û: "u",
  ñ: "n", ý: "y", ÿ: "y",
};

/** Tek karakter katlama; büyük "İ" ve "I" doğrudan "i" (yerel ayardan bağımsız). */
function foldChar(ch: string): string {
  if (ch === "İ" || ch === "I") return "i";
  const lower = ch.toLowerCase();
  // Bazı motorlar tek harfi iki karaktere indirir — uzunluk korunmazsa harfi olduğu gibi bırak.
  const one = lower.length === 1 ? lower : ch;
  return FOLD[one] ?? one;
}

/** "istanbul" → "İstanbul", "sehir" → "Şehir", "IĞDIR" → "Iğdır" eşleşsin; uzunluk değişmez. */
export function foldForSearch(text: string): string {
  let out = "";
  for (const ch of text) out += foldChar(ch);
  return out;
}
