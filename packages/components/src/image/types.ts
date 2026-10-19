import type React from "react";
import type { SkeletonableProps } from "../lib/skeleton";

/**
 * Statik import edilmiş görsel. Next'in `StaticImageData`'sı bu şekle uyar
 * (`import hero from "./hero.jpg"` → `{ src, width, height, blurDataURL }`),
 * ama `next`'ten hiçbir şey import edilmez.
 */
export interface ImageStaticSource {
  src: string;
  width?: number;
  height?: number;
  /** Küçük bulanık ön izleme (genelde `data:` URL) — `placeholder` için kendiliğinden kullanılır. */
  blurDataURL?: string;
}

export type ImageSource = string | ImageStaticSource;

export interface ImageLoaderParams {
  src: string;
  /** İstenen piksel genişliği. */
  width: number;
  quality?: number;
}

/**
 * Kaynak + genişlik → gerçek URL. CDN ve boyutlandırma burada çözülür; `srcSet`
 * adayları ve bulanık ön izleme de bununla üretilir. Uygulamanın kendi
 * asset/CDN adres fonksiyonuyla birleşir:
 * `({ src, width }) => \`${asset(src)}?w=${width}\``.
 */
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

type NativeImgProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "width" | "height" | "placeholder" | "loading" | "alt" | "children"
>;

export interface ImageProps extends NativeImgProps, SkeletonableProps {
  src: ImageSource | null | undefined;
  /** Zorunlu. Süs görselse `alt=""` verin (ekran okuyucu atlar). */
  alt: string;
  /** Sayı = px (açık kaçış), string = herhangi bir CSS uzunluğu (`"100%"`, `"12rem"`). */
  width?: number | string;
  height?: number | string;
  /**
   * Yer önceden ayrılsın (yüklenince sayfa kaymasın): `"4/3"`, `1.5`.
   * Verilmezse sayısal `width`/`height`ten (ya da statik kaynağın boyutundan) çıkarılır.
   */
  aspectRatio?: number | string;
  /** `object-fit`. Varsayılan: `"cover"`. */
  fit?: ImageFit;
  loader?: ImageLoader;
  /** `srcSet` aday genişlikleri (yalnız `loader` varken). Sayısal `width` varsa 1x/2x kullanılır. */
  widths?: number[];
  sizes?: string;
  quality?: number;
  /**
   * Yüklenirken gösterilen:
   * - `true`: bulanık ön izleme (`blurDataURL` ya da `loader` ile küçük boy), yoksa parıltı,
   * - string: bu düşük çözünürlüklü URL bulanık gösterilir,
   * - node: özel içerik.
   * Asıl görsel yüklenince yumuşak geçişle üstüne gelir. Varsayılan: `blurDataURL` varsa `true`.
   */
  placeholder?: boolean | string | React.ReactNode;
  /** Yüklenemezse: URL (yedek görsel) ya da node. Varsayılan: ikon + "Görsel yüklenemedi". */
  fallback?: string | React.ReactNode;
  /** Ekrana yakın olana kadar yükleme. Varsayılan: `"lazy"`. */
  loading?: "lazy" | "eager";
  /** Ekranın ilk görünen kısmındaki (LCP) görsel: hemen ve yüksek öncelikle yükler. */
  priority?: boolean;
  /**
   * Yüklenince opaklık geçişiyle belirir. Önbellekten gelen görselde geçiş zaten atlanır;
   * küçük ikonlarda (bayrak vb.) hiç istemiyorsanız `false`. Varsayılan: `true`.
   */
  fade?: boolean;
  /** Tıklayınca tam ekran görüntüleyicide açılır. */
  preview?: boolean | ImagePreviewConfig;
  /** Dış kutunun sınıfı (radius, kenarlık, boyut). `className` `<img>`'ye gider. */
  wrapperClassName?: string;
}
