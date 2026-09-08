/**
 * `@mari-ui/tokens`'taki boyut değerleri CSS string'i olarak tutulur
 * ("0.5rem", "9999px", "0px") — web'de doğrudan `style`/CSS değişkeni olarak
 * kullanılabilir ama React Native `StyleSheet` sayısal (yoğunluktan bağımsız
 * piksel) değer bekler; bir string geçmek sessizce hiçbir şey yapmaz. 16px
 * taban font boyutuyla (tarayıcının kendi varsayılanı, tokens'ın da rem
 * hesabında varsaydığı taban) rem/px string'lerini sayıya çevirir.
 */
const REM_BASE_PX = 16;

export function toPx(value: string): number {
  const trimmed = value.trim();
  if (trimmed.endsWith("rem")) {
    return parseFloat(trimmed) * REM_BASE_PX;
  }
  if (trimmed.endsWith("px")) {
    return parseFloat(trimmed);
  }
  const parsed = parseFloat(trimmed);
  return Number.isNaN(parsed) ? 0 : parsed;
}
