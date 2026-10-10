import type React from "react";
import type { DimensionValue, ImageStyle, StyleProp, ViewStyle } from "react-native";
import type { SkeletonableProps } from "../lib/Skeleton";

/**
 * Statik kaynak — web'deki `ImageStaticSource` ile aynı şekil (`{ src, width,
 * height, blurDataURL }`). Boyut verilirse yer önceden ayrılır.
 */
export interface ImageStaticSource {
  src: string;
  width?: number;
  height?: number;
  /** Küçük bulanık ön izleme (genelde `data:` URL) — `placeholder` için kendiliğinden kullanılır. */
  blurDataURL?: string;
}

/** URL, statik kaynak ya da `require("./foto.jpg")` (paketlenmiş görsel). */
export type ImageSource = string | ImageStaticSource | number;

export interface ImageLoaderParams {
  src: string;
  /** İstenen piksel genişliği (kutu genişliği × ekran piksel oranı). */
  width: number;
  quality?: number;
}

/** Kaynak + genişlik → gerçek URL (CDN boyutlandırma). Web'deki `loader` ile aynı imza. */
export type ImageLoader = (params: ImageLoaderParams) => string;

export type ImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

export interface ImagePreviewConfig {
  /** Önizlemede gösterilecek (genelde daha yüksek çözünürlüklü) kaynak. Varsayılan: `src`. */
  src?: ImageSource;
  /** Görüntüleyicide görselin altındaki açıklama. */
  caption?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface ImageLoadInfo {
  width: number;
  height: number;
}

export interface ImageProps extends SkeletonableProps {
  src: ImageSource | null | undefined;
  /** Zorunlu. Süs görselse `alt=""` verin (ekran okuyucu atlar). */
  alt: string;
  /** Sayı = pt, yüzde = kaba göre. */
  width?: DimensionValue;
  height?: DimensionValue;
  /**
   * Yer önceden ayrılsın (yüklenince ekran kaymasın): `"4/3"`, `1.5`.
   * Verilmezse sayısal `width`/`height`ten (ya da kaynağın boyutundan) çıkarılır.
   */
  aspectRatio?: number | string;
  /** Varsayılan: `"cover"`. */
  fit?: ImageFit;
  loader?: ImageLoader;
  /** `loader` aday genişlikleri; kutu genişliği × piksel oranına en yakın büyük aday istenir. */
  widths?: number[];
  quality?: number;
  /**
   * Yüklenirken gösterilen:
   * - `true`: bulanık ön izleme (`blurDataURL` ya da `loader` ile küçük boy), yoksa nabız,
   * - string: bu düşük çözünürlüklü URL bulanık gösterilir,
   * - node: özel içerik.
   * Varsayılan: `blurDataURL` varsa `true`.
   */
  placeholder?: boolean | string | React.ReactNode;
  /** Yüklenemezse: URL (yedek görsel) ya da node. Varsayılan: ikon + "Görsel yüklenemedi". */
  fallback?: string | React.ReactNode;
  /** Dokununca tam ekran görüntüleyicide açılır. */
  preview?: boolean | ImagePreviewConfig;
  /** Dış kutu (köşe, kenarlık, boyut). */
  style?: StyleProp<ViewStyle>;
  /** İç `Image`. */
  imageStyle?: StyleProp<ImageStyle>;
  onLoad?: (info: ImageLoadInfo) => void;
  onError?: () => void;
}
