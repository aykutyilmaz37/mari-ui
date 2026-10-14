import type React from "react";
import type { ColorRole } from "@mari-ui/core";

export type ToastPosition = "top" | "bottom" | "topRight" | "topLeft" | "bottomLeft" | "bottomRight";

/** `success`/`info`/`error`/`warning` bir ColorRole; `"none"` = ikon/renk vurgusu yok. */
export type ToastType = ColorRole | "none";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  title: string;
  description?: React.ReactNode;
  type?: ToastType;
  position?: ToastPosition;
  /** Kapat düğmesi. Varsayılan: `true`. */
  closeIcon?: boolean;
  /**
   * Otomatik kapanma (ms). `0` = kendiliğinden kapanmaz. Varsayılan: 5000
   * (aksiyon düğmesi varsa 8000). Üzerine gelince/odaklanınca SAYAÇ DURUR.
   */
  duration?: number;
  /** Toast içinde tek bir aksiyon — ör. "Geri al". Tıklanınca toast kapanır. */
  action?: ToastAction;
  /** Toast kapandığında (otomatik ya da kullanıcı). */
  onClose?: () => void;
  /**
   * Veri gelene kadar ikon, başlık, açıklama ve aksiyon içeriğin kendi
   * şeklinde iskelet; Kapat çalışır. İskeletteyken otomatik kapanma sayacı
   * işlemez ve ekran okuyucuya duyurulmaz — `update(id, { skeleton: false, … })`
   * ile veri geldiğinde duyurulur ve sayaç başlar.
   */
  skeleton?: boolean;
}

export interface ToastData extends ToastOptions {
  /** `crypto.randomUUID()` ile üretilir. */
  id: string;
}

export interface ToastProps extends Omit<ToastOptions, "position" | "onClose"> {
  onClose?: () => void;
  /** Çıkış animasyonu oynuyor. */
  exiting?: boolean;
}
