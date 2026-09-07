/**
 * WCAG 2.1 göreli parlaklık (relative luminance) ve kontrast oranı hesaplayıcı.
 *
 * Bu dosya var çünkü mevcut design system'de renk/foreground eşleşmeleri göz
 * kararıyla seçilmişti — örneğin turuncu accent üzerine beyaz metin konursa
 * kontrast oranı ~2.8:1 çıkar (AA eşiği 4.5:1). Bu modül semantic token
 * türetiminde ("semantic/deriveColorRole.ts") ve test paketinde
 * ("__tests__/contrast.test.ts") kullanılarak her renk/foreground çiftinin
 * gerçekten WCAG AA'yı geçtiğini garanti eder.
 *
 * Referans: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */

export type HexColor = `#${string}`;

function hexToRgb(hex: HexColor): [number, number, number] {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const int = parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function srgbChannelToLinear(channel255: number): number {
  const c = channel255 / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG göreli parlaklık, 0 (siyah) – 1 (beyaz) arası. */
export function relativeLuminance(hex: HexColor): number {
  const [r, g, b] = hexToRgb(hex);
  const rl = srgbChannelToLinear(r);
  const gl = srgbChannelToLinear(g);
  const bl = srgbChannelToLinear(b);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** İki renk arasındaki WCAG kontrast oranı, 1 (fark yok) – 21 (siyah/beyaz) arası. */
export function contrastRatio(a: HexColor, b: HexColor): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Normal boyuttaki metin için WCAG AA eşiği. */
export const AA_TEXT_MIN = 4.5;
/** Büyük metin (18pt+ veya 14pt+ kalın) ve dolgu olmayan UI bileşenleri için WCAG AA eşiği. */
export const AA_LARGE_OR_UI_MIN = 3;

export function meetsAA(a: HexColor, b: HexColor, threshold = AA_TEXT_MIN): boolean {
  return contrastRatio(a, b) >= threshold;
}

/**
 * Verilen arka plan için, adaylar arasından WCAG AA'yı geçen İLK adayı seçer.
 * Kütüphanenin metin/foreground rengini "beyaz mı koyu mu" diye elle karar
 * vermek yerine bu fonksiyonla hesaplaması, tam olarak `--text-base` gibi
 * elle girilmiş ve dark mode'da bozulan token hatalarının tekrarını engeller.
 */
export function pickAccessibleForeground(
  background: HexColor,
  candidates: readonly HexColor[],
  threshold = AA_TEXT_MIN
): HexColor {
  const passing = candidates.find((candidate) => meetsAA(background, candidate, threshold));
  if (passing) return passing;
  if (candidates.length === 0) {
    throw new Error("[@mari-ui/tokens] pickAccessibleForeground: candidates listesi boş olamaz.");
  }
  // Hiçbiri eşiği geçmiyorsa, en yüksek kontrastı vereni döndür ve build'de uyar.
  const sorted = [...candidates].sort(
    (a, b) => contrastRatio(background, b) - contrastRatio(background, a)
  );
  // sorted, candidates'ten türediği ve candidates boş değil diye kontrol edildiği için dolu.
  const best = sorted[0] as HexColor;
  console.warn(
    `[@mari-ui/tokens] "${background}" için hiçbir aday AA eşiğini (${threshold}) geçemedi. ` +
      `En iyi seçenek "${best}" (${contrastRatio(background, best).toFixed(2)}:1) kullanılıyor.`
  );
  return best;
}
