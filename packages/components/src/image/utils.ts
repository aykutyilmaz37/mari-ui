import type React from "react";
import type { ImageLoader, ImageSource, ImageStaticSource } from "./types";

/** `srcSet` için varsayılan aday genişlikler (yaygın cihaz genişlikleri). */
export const DEFAULT_WIDTHS = [384, 640, 828, 1080, 1280, 1920, 2560];
/** Bulanık ön izleme için `loader`dan istenen küçük boy. */
export const BLUR_WIDTH = 24;

export function normalizeSource(src: ImageSource | null | undefined): ImageStaticSource | null {
  if (src == null) return null;
  if (typeof src === "string") return src === "" ? null : { src };
  return src.src ? src : null;
}

export interface ResolvedImage {
  src: string;
  srcSet?: string;
}

/**
 * Asıl `<img>` adresleri.
 * - `loader` yoksa: kaynak olduğu gibi, `srcSet` yok.
 * - Sayısal `width` varsa: 1x/2x yoğunluk adayları (sabit boyutlu görsel).
 * - Yoksa: `widths` genişlik adayları (`sizes` ile duyarlı görsel).
 */
export function resolveImage(
  source: ImageStaticSource,
  { loader, width, widths = DEFAULT_WIDTHS, quality }: { loader?: ImageLoader; width?: number | string; widths?: number[]; quality?: number }
): ResolvedImage {
  if (!loader) return { src: source.src };
  const call = (w: number) => loader({ src: source.src, width: w, quality });
  if (typeof width === "number") {
    return { src: call(width), srcSet: `${call(width)} 1x, ${call(width * 2)} 2x` };
  }
  const sorted = [...new Set(widths)].sort((a, b) => a - b);
  const largest = sorted[sorted.length - 1] ?? 1080;
  return { src: call(largest), srcSet: sorted.map((w) => `${call(w)} ${w}w`).join(", ") };
}

/** `placeholder` → bulanık ön izleme URL'si (yoksa `null`: parıltı ya da özel node). */
export function resolveBlurSource(
  placeholder: unknown,
  source: ImageStaticSource,
  loader: ImageLoader | undefined
): string | null {
  if (typeof placeholder === "string") return placeholder;
  if (placeholder !== true) return null;
  if (source.blurDataURL) return source.blurDataURL;
  if (loader) return loader({ src: source.src, width: BLUR_WIDTH, quality: 30 });
  return null;
}

function toCssLength(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === "number" ? `${value}px` : value;
}

function toAspectRatio(value: number | string | undefined): string | undefined {
  if (value === undefined) return undefined;
  return String(value);
}

/**
 * Dış kutunun boyutu. Öncelik: açık `aspectRatio` → sayısal `width`/`height` oranı
 * → statik kaynağın kendi boyutu. Oran varsa ve yalnız biri verilmişse diğeri
 * orandan gelir; hiç boyut yoksa kutu kabın genişliğini alır.
 */
export function getBoxStyle({
  width,
  height,
  aspectRatio,
  source,
}: {
  width?: number | string;
  height?: number | string;
  aspectRatio?: number | string;
  source?: ImageStaticSource | null;
}): React.CSSProperties {
  let ratio = toAspectRatio(aspectRatio);
  if (!ratio && typeof width === "number" && typeof height === "number") ratio = `${width} / ${height}`;
  if (!ratio && width === undefined && height === undefined && source?.width && source.height) {
    ratio = `${source.width} / ${source.height}`;
  }
  const style: React.CSSProperties = {};
  const w = toCssLength(width);
  const h = toCssLength(height);
  if (w) style.width = w;
  if (h && !(ratio && w)) style.height = h;
  if (ratio) {
    style.aspectRatio = ratio;
    if (!w && !h) style.width = "100%";
  }
  return style;
}

/** `<img>`ye gidecek boyut/öncelik öznitelikleri (tarayıcı oranı önceden bilsin, LCP görseli öne alınsın). */
export function imgAttributes({
  width,
  height,
  source,
  srcSet,
  sizes,
  priority,
  loading,
  fetchPriority,
}: {
  width?: number | string;
  height?: number | string;
  source: ImageStaticSource | null;
  srcSet?: string;
  sizes?: string;
  priority: boolean;
  loading: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const fixedWidth = typeof width === "number";
  const lazy = loading === "lazy" && !priority;
  // `auto`: lazy görselde tarayıcı gerçek kutu genişliğine göre seçer (desteklemeyen 100vw'ye düşer).
  const defaultSizes = lazy ? "auto, 100vw" : "100vw";
  return {
    width: fixedWidth ? width : source?.width,
    height: typeof height === "number" ? height : source?.height,
    sizes: sizes ?? (srcSet && !fixedWidth ? defaultSizes : undefined),
    loading: lazy ? loading : ("eager" as const),
    fetchPriority: priority ? ("high" as const) : fetchPriority,
  };
}
