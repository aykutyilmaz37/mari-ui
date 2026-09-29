import type React from "react";
import type { Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/**
 * - `bordered` (varsayılan): dış çerçeve, tonlu başlıklar, gövde ayrı zeminde.
 * - `borderless`: çerçevesiz tonlu blok, yalnız bölümler arası çizgi.
 * - `ghost`: zemin ve çerçeve yok — bir kartın/panelin içine gömülür.
 * - `separated`: her bölüm ayrı, aralıklı bir kart (SSS sayfaları).
 */
export type AccordionVariant = "bordered" | "borderless" | "ghost" | "separated";

export interface AccordionItem {
  /** Benzersiz anahtar — `activeKey`/`onChange` bununla konuşur. */
  key: string;
  /** Başlık (düğmenin erişilebilir adı). */
  label: React.ReactNode;
  /** Açılınca görünen içerik. */
  children: React.ReactNode;
  /**
   * Başlığın sağında ek alan (sayaç, etiket, düğme). Açma düğmesinin DIŞINDA
   * çizilir — içine etkileşimli öğe koymak güvenlidir.
   */
  extra?: React.ReactNode;
  disabled?: boolean;
  /** Bu bölümde ok ikonunu gizler. */
  showArrow?: boolean;
  /** İçerik ilk açılıştan önce de DOM'da olsun (SEO, form alanı ölçümü). */
  forceRender?: boolean;
}

export interface AccordionProps extends SkeletonableProps {
  items: AccordionItem[];
  /** Açık bölüm(ler). Verilirse controlled çalışır. */
  activeKey?: string | string[];
  /** Uncontrolled modda ilk açık bölüm(ler). */
  defaultActiveKey?: string | string[];
  /** Açık bölümler değişince — her zaman dizi (tekli modda 0 ya da 1 eleman). */
  onChange?: (activeKeys: string[]) => void;
  /** Aynı anda yalnız bir bölüm açık (ant `accordion`). */
  single?: boolean;
  /** Varsayılan: `bordered`. */
  variant?: AccordionVariant;
  /** Başlık/gövde dolgusu: sm 8·12 / md 12·16 / lg 16·24px. Varsayılan: `md`. */
  size?: Size;
  /** Ok ikonunun yeri. Varsayılan: `start`. */
  iconPlacement?: "start" | "end";
  /** Özel ok ikonu. */
  expandIcon?: (open: boolean) => React.ReactNode;
  /**
   * Başlıkları saran `<hN>` seviyesi (APG: düğme bir başlığın içinde durur,
   * ekran okuyucu başlık menüsünde bölümleri listeler). Sayfanın başlık
   * hiyerarşisine uydurun. Varsayılan: `3`.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Kapanan bölümün içeriğini DOM'dan kaldırır (varsayılan: ilk açılıştan sonra tutulur). */
  destroyOnHidden?: boolean;
  className?: string;
}
