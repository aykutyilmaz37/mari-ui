import type { ImageFit, ImageLoader, ImageStaticSource } from "./types";

/**
 * Image'ın saf mantığı (react-native'siz, testli). `normalizeSource` ve
 * `resolveBlurSource` web'deki (`components/src/image/utils.ts`) ile birebir;
 * `srcSet` yerine native kutu genişliğinden TEK aday seçilir.
 */

/** `loader` aday genişlikleri (web `DEFAULT_WIDTHS` ile aynı). */
export const DEFAULT_WIDTHS = [384, 640, 828, 1080, 1280, 1920, 2560];
/** Bulanık ön izleme için `loader`dan istenen küçük boy. */
export const BLUR_WIDTH = 24;

export function normalizeSource(src: string | ImageStaticSource | null | undefined): ImageStaticSource | null {
  if (src == null) return null;
  if (typeof src === "string") return src === "" ? null : { src };
  return src.src ? src : null;
}

/** Hedef piksel genişliğini karşılayan en küçük aday; hiçbiri yetmezse en büyüğü. */
export function pickWidth(target: number, widths: number[] = DEFAULT_WIDTHS): number {
  const sorted = [...new Set(widths)].sort((a, b) => a - b);
  return sorted.find((w) => w >= target) ?? sorted[sorted.length - 1] ?? Math.ceil(target);
}

/**
 * Yüklenecek adres.
 * - `loader` yoksa: kaynak olduğu gibi.
 * - Sayısal `width` varsa: tam o boy × piksel oranı (sabit boyutlu görsel).
 * - Yoksa: ölçülen kutu genişliği × piksel oranı → aday genişlik. Kutu henüz
 *   ölçülmediyse `null` (yanlış boyu indirmemek için ölçümü bekle).
 */
export function resolveUri(
  source: ImageStaticSource,
  { loader, width, layoutWidth, widths, quality, pixelRatio }: { loader?: ImageLoader; width?: unknown; layoutWidth?: number; widths?: number[]; quality?: number; pixelRatio: number }
): string | null {
  if (!loader) return source.src;
  if (typeof width === "number") return loader({ src: source.src, width: Math.ceil(width * pixelRatio), quality });
  if (layoutWidth === undefined) return null;
  return loader({ src: source.src, width: pickWidth(layoutWidth * pixelRatio, widths), quality });
}

/** `placeholder` → bulanık ön izleme URL'si (yoksa `null`: nabız ya da özel node). */
export function resolveBlurSource(placeholder: unknown, source: ImageStaticSource, loader: ImageLoader | undefined): string | null {
  if (typeof placeholder === "string") return placeholder;
  if (placeholder !== true) return null;
  if (source.blurDataURL) return source.blurDataURL;
  if (loader) return loader({ src: source.src, width: BLUR_WIDTH, quality: 30 });
  return null;
}

/** `"4/3"`, `"16 / 9"`, `1.5` → sayı. Geçersizse `undefined`. */
export function parseRatio(value: number | string | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value > 0 ? value : undefined;
  const [w, h] = value.split("/").map((part) => Number.parseFloat(part));
  const ratio = h === undefined ? w : (w ?? Number.NaN) / h;
  return ratio !== undefined && Number.isFinite(ratio) && ratio > 0 ? ratio : undefined;
}

/** Boyut bilinmezken (ne oran ne boyut) iskelet/yer tutucu için makul oran — web ile aynı. */
export const FALLBACK_RATIO = 4 / 3;

export interface BoxStyle {
  width?: number | `${number}%`;
  height?: number | `${number}%`;
  aspectRatio?: number;
}

type Length = number | `${number}%` | string | null | undefined;

const sizeRatio = (size?: { width?: number; height?: number } | null) => (size?.width && size.height ? size.width / size.height : undefined);

function deriveRatio({ width, height, aspectRatio, source, natural }: { width?: Length; height?: Length; aspectRatio?: number | string; source?: { width?: number; height?: number } | null; natural?: { width: number; height: number } | null }): number | undefined {
  const explicit = parseRatio(aspectRatio);
  if (explicit !== undefined) return explicit;
  if (typeof width === "number" && typeof height === "number" && height > 0) return width / height;
  const hasW = width != null;
  const hasH = height != null;
  if (!hasW && !hasH && sizeRatio(source) !== undefined) return sizeRatio(source);
  return hasW && hasH ? undefined : sizeRatio(natural);
}

/**
 * Dış kutunun boyutu. Öncelik (web `getBoxStyle` ile aynı): açık `aspectRatio`
 * → sayısal `width`/`height` oranı → kaynağın kendi boyutu → yüklenen görselin
 * doğal boyutu. Hiç boyut yoksa kutu kabın genişliğini alır; oran da yoksa
 * 4:3 yer tutar (`estimated`) — yüklenince doğal orana geçer.
 */
export function getBoxStyle({
  width,
  height,
  aspectRatio,
  source,
  natural,
}: {
  width?: Length;
  height?: Length;
  aspectRatio?: number | string;
  source?: { width?: number; height?: number } | null;
  natural?: { width: number; height: number } | null;
}): { style: BoxStyle; estimated: boolean } {
  const hasW = width != null;
  const hasH = height != null;
  let ratio = deriveRatio({ width, height, aspectRatio, source, natural });
  const style: BoxStyle = {};
  if (hasW) style.width = width as BoxStyle["width"];
  if (hasH && !(ratio !== undefined && hasW)) style.height = height as BoxStyle["height"];
  let estimated = false;
  if (ratio === undefined && !(hasW && hasH)) {
    ratio = FALLBACK_RATIO;
    estimated = true;
  }
  if (ratio !== undefined) {
    style.aspectRatio = ratio;
    if (!hasW && !hasH) style.width = "100%";
  }
  return { style, estimated };
}

export type ResizeMode = "cover" | "contain" | "stretch" | "center";

/**
 * `object-fit` → RN `resizeMode`. RN'de `scale-down` yok: görsel kutudan
 * büyükse `contain`, küçükse `center` (büyütmeden ortada) — doğal boyut
 * bilinmeden `contain`.
 */
export function resizeModeFor(fit: ImageFit, natural?: { width: number; height: number } | null, box?: { width: number; height: number } | null): ResizeMode {
  switch (fit) {
    case "contain":
      return "contain";
    case "fill":
      return "stretch";
    case "none":
      return "center";
    case "scale-down":
      if (natural && box && natural.width <= box.width && natural.height <= box.height) return "center";
      return "contain";
    default:
      return "cover";
  }
}
