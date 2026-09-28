import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface AlertProps extends SkeletonableProps {
  /** Başlık (kısa, kalın). */
  title?: React.ReactNode;
  /** Açıklama — başlığın altında ya da başlık yoksa tek başına. */
  description?: React.ReactNode;
  /** Varsayılan: `info`. `success`/`info`/`warning`/`error` durum ikonunu da seçer. */
  color?: ColorRole;
  /** Durum ikonu. `false` gizler, bir node özel ikon verir. Varsayılan: `true`. */
  icon?: boolean | React.ReactNode;
  /** Sağda (dar ekranda altta) eylem(ler), ör. "Yeniden dene". */
  action?: React.ReactNode;
  /** Kapat düğmesi; kapanınca `onClose`, çıkış animasyonundan sonra DOM'dan kalkar. */
  closable?: boolean;
  onClose?: () => void;
  /** Kapat düğmesinin erişilebilir adı. Varsayılan: `"Uyarıyı kapat"`. */
  closeLabel?: string;
  /**
   * Sayfanın/kartın üstünde tam genişlik şerit: köşesiz, yalnız alt kenarlık
   * (ör. "Deneme sürenizin bitmesine 3 gün kaldı").
   */
  banner?: boolean;
  /**
   * Varsayılan: `error`/`warning` → `"alert"` (hemen okunur), diğerleri
   * `"status"` (sırası gelince). Sayfa yüklenirken zaten duran bir uyarıda
   * duyuru gerekmiyorsa `"none"`.
   */
  role?: "alert" | "status" | "none";
  className?: string;
}
