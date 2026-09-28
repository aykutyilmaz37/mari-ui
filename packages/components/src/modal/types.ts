import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";

export type ButtonPositionType = "left" | "right";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Başlık — dialog'un erişilebilir adı. */
  title?: React.ReactNode;
  /** Başlığın altında açıklama — `aria-describedby` olur. */
  description?: React.ReactNode;
  icon?: React.ReactNode;
  /**
   * Durum rengi. Verilirse başlığın solunda tonlu bir ikon dairesi gösterilir
   * (ant.design confirm düzeni) ve onay düğmesi bu renkte olur. `error` /
   * `warning` ile onay düğmesi olan modal `role="alertdialog"` olur ve ilk
   * odak "Vazgeç"e gider (yanlışlıkla Enter ile yıkıcı işlem yapılmasın).
   */
  color?: ColorRole;
  children?: React.ReactNode;
  /** Varsayılan: `true`. */
  showCloseButton?: boolean;
  closeButtonPosition?: ButtonPositionType;
  /**
   * Özel alt çubuk. Verilirse `confirmButtonText`/`cancelButtonText`
   * düğmeleri yerine bu render edilir; `null` alt çubuğu tamamen kaldırır.
   */
  footer?: React.ReactNode;
  /** Varsayılan: `"right"` (eskiden `left`). */
  footerButtonPosition?: ButtonPositionType;
  confirmButtonText?: string;
  cancelButtonText?: string;
  /** Promise dönerse çözülene kadar onay düğmesi "yükleniyor" olur. */
  onConfirm?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Onay düğmesini dışarıdan yükleniyor yapar. */
  confirmLoading?: boolean;
  /** Onay düğmesini devre dışı bırakır (ör. doğrulama geçene kadar). */
  confirmDisabled?: boolean;
  /**
   * Açılışta odaklanacak düğme. Varsayılan: yıkıcı onayda (`error`/`warning`)
   * `"cancel"`, diğerlerinde gövdedeki ilk alan. "Vazgeç" düğmesinin kendisi
   * yıkıcıysa (ör. "Çıkış yap") `"confirm"` verin.
   */
  initialFocus?: "cancel" | "confirm";
  /** sm 400 / md 520 / lg 720px. Varsayılan: `md`. */
  size?: Size;
  /** `size` yerine özel genişlik, ör. `640` veya `"80vw"`. */
  width?: number | string;
  /** Örtüye tıklayınca kapansın. Varsayılan: `true`. */
  maskClosable?: boolean;
  /** Escape kapatsın. Varsayılan: `true`. */
  keyboard?: boolean;
  /** Başlık yoksa erişilebilir ad. */
  "aria-label"?: string;
  className?: string;
  bodyClassName?: string;
}
