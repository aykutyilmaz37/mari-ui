import type React from "react";
import type { Size } from "@mari-ui/core";

export type DrawerPosition = "top" | "bottom" | "left" | "right";
export type DrawerSize = Size;
export type DrawerCloseButtonPosition = "left" | "right";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Açıldığı kenar. Varsayılan: `"right"`. */
  position?: DrawerPosition;
  /**
   * Yan çekmecede genişlik (sm 320 / md 400 / lg 640px), üst/alt çekmecede
   * yükseklik. Dar ekranda yan çekmece ekran genişliğini aşmaz. Varsayılan: `md`.
   */
  size?: DrawerSize;
  /** `size` yerine özel genişlik (yan) / yükseklik (üst-alt), ör. `480` veya `"60vw"`. */
  width?: number | string;
  height?: number | string;
  /** Başlık — dialog'un erişilebilir adı da budur. */
  title?: React.ReactNode;
  /** Başlığın altında soluk açıklama. */
  description?: React.ReactNode;
  /** Başlık şeridinin sağında ek aksiyonlar (ör. "Tümünü okundu say"). */
  extra?: React.ReactNode;
  /**
   * @deprecated `title` / `description` / `extra` kullanın. Verilirse
   * başlık şeridinin içeriğini tamamen bu node belirler.
   */
  header?: React.ReactNode;
  /** Altta sabit eylem çubuğu (ör. İptal / Kaydet). */
  footer?: React.ReactNode;
  children?: React.ReactNode;
  /** Varsayılan: `true`. */
  showCloseButton?: boolean;
  /** Varsayılan: `"right"`. */
  closeButtonPosition?: DrawerCloseButtonPosition;
  /** Gövde yerine iskelet gösterir. */
  loading?: boolean;
  /** Arka plan örtüsü (scrim). Varsayılan: `true`. */
  mask?: boolean;
  /** Örtüye tıklayınca kapansın. Varsayılan: `true`. */
  maskClosable?: boolean;
  /** Escape kapatsın. Varsayılan: `true`. */
  keyboard?: boolean;
  /** Başlık yoksa dialog'un erişilebilir adı. */
  "aria-label"?: string;
  className?: string;
  /** Gövde (kaydırılan alan) için ek sınıf — ör. dolguyu kaldırmak için `p-0`. */
  bodyClassName?: string;
}
