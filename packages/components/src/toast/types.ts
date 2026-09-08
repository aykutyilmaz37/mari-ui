import type { ColorRole } from "@mari-ui/core";

export type ToastPosition = "top" | "bottom" | "topRight" | "topLeft" | "bottomLeft" | "bottomRight";
/**
 * @deprecated `ToastPosition` kullanın — isim değişti, değerler aynı.
 * Kasıtlı geriye dönük uyumluluk shim'i (Faz 3'ün deprecated-alias
 * stratejisi) — SonarJS'in "gereksiz" dediği bu değil; silinirse eski
 * adı kullanan tüketici kodu derlenmez.
 */
// eslint-disable-next-line sonarjs/redundant-type-aliases
export type PositionType = ToastPosition;

/** `success`/`info`/`error`/`warning` zaten birer ColorRole; `"none"` = ikon/renk vurgusu yok. */
export type ToastType = ColorRole | "none";

export interface ToastData {
  /** `crypto.randomUUID()` ile üretilir — eskiden `Date.now() + Math.random()` idi. */
  id: string;
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
