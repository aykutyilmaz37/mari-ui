import type { ColorRole } from "@mari-ui/core";

export type ToastPosition = "top" | "bottom" | "topRight" | "topLeft" | "bottomLeft" | "bottomRight";
/** @deprecated `ToastPosition` kullanın — isim değişti, değerler aynı. */
export type PositionType = ToastPosition;

/** `success`/`info`/`error`/`warning` zaten birer ColorRole; `"none"` = ikon/renk vurgusu yok. */
export type ToastType = ColorRole | "none";

export interface ToastData {
  id: number;
  title: string;
  description?: string;
  type?: ToastType;
  position?: ToastPosition;
  closeIcon?: boolean;
}

export interface ToastProps {
  title: string;
  description?: string;
  closeIcon?: boolean;
  type?: ToastType;
  onClose?: () => void;
}
