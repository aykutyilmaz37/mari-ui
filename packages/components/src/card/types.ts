import type { CSSProperties, ReactNode } from "react";
import type { SlotClassNames, Size } from "@mari-ui/core";

export type CardSlot = "header" | "body" | "footer" | "cover" | "actions";
export type CardClassNames = SlotClassNames<CardSlot>;

export interface CardProps {
  children?: ReactNode;
  title?: ReactNode;
  /** Başlığın sağında (ör. bir link, menü düğmesi, Switch). */
  extra?: ReactNode;
  /** Kartın en üstünde kenardan kenara kapak (genelde görsel). */
  cover?: ReactNode;
  footer?: ReactNode;
  /**
   * Kartın en altında eşit bölünmüş aksiyon çubuğu (ant.design `actions`):
   * her öğe bir düğme/link olmalı. Ör. `[<Button …>Düzenle</Button>, …]`.
   */
  actions?: ReactNode[];
  /** Varsayılan: `true`. */
  bordered?: boolean;
  /** Üzerine gelince gölge + hafif yükselme. `href` verildiğinde varsayılan olarak açık. */
  hoverable?: boolean;
  /** İçerik yerine iskelet gösterir (kapak ve başlık korunur). */
  loading?: boolean;
  /** `sm`: kompakt (12px), `md`: 24px, `lg`: 32px dolgu. Varsayılan: `md`. */
  size?: Size;
  /** İç içe/gömülü kart görünümü — tonlu zemin, gölge yok. */
  inset?: boolean;
  /**
   * Verilirse kartın TAMAMI bir `<a>` olur (klavye + orta tık + yeni sekmede
   * aç çalışır). Kartın içinde başka düğme/link varsa `href` yerine başlığa
   * link koyun — iç içe etkileşimli öğe geçersizdir.
   */
  href?: string;
  target?: string;
  /**
   * Kartın tamamını tıklanabilir yapar (`role="button"`). Gezinme için `href`
   * tercih edin; içinde başka düğme olan kartta kullanmayın.
   */
  onClick?: () => void;
  className?: string;
  classNames?: CardClassNames;
  /** @deprecated Hiçbir zaman uygulanmıyordu. Stil için `classNames` kullanın. */
  styles?: Partial<Record<CardSlot, CSSProperties>>;
}

export interface CardMetaProps {
  /** Solda — genelde `Avatar` veya ikon kutusu. */
  avatar?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}
