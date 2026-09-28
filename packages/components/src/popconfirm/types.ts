import type React from "react";
import type { ColorRole, Placement } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface PopconfirmProps extends SkeletonableProps {
  /** Soru: "Bu görevi sil?" — dialog'un adı. */
  title: React.ReactNode;
  /** Sonucu açıklayan kısa metin: "Alt görevler de silinir." */
  description?: React.ReactNode;
  /** Tetikleyici: tek bir odaklanabilir öğe (genelde Button). */
  children: React.ReactElement;
  /**
   * Onaylanınca. Promise dönerse çözülene kadar onay düğmesi yükleniyor ve
   * panel açık kalır; reddedilirse de açık kalır (kullanıcı tekrar deneyebilir).
   */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Varsayılan: `"Evet"`. */
  okText?: string;
  /** Varsayılan: `"Vazgeç"`. */
  cancelText?: string;
  /**
   * Varsayılan: `warning`. `error`/`warning` yıkıcı sayılır: onay düğmesi bu
   * renkte ve ilk odak "Vazgeç"te (yanlışlıkla Enter ile onaylanmasın).
   */
  color?: ColorRole;
  /** Durum ikonu; `false` gizler. */
  icon?: boolean | React.ReactNode;
  placement?: Placement;
  /** Açılmasın (ör. yetki yok) — tetikleyici yine çalışır, doğrudan `onConfirm` çağrılmaz. */
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}
