import type React from "react";
import type { ColorRole, ExtendedSize, SlotClassNames, Variant } from "@mari-ui/core";

export type ButtonIconPosition = "start" | "end";

/** İkon-only ve pill butonlar için — `radius` ekseninden ayrı, çünkü aspect-ratio da içerir. */
export type ButtonShape = "default" | "pill" | "circle" | "square";

export type ButtonSlot = "wrapper" | "icon" | "label";
export type ButtonClassNames = SlotClassNames<ButtonSlot>;

export type ButtonLoading =
  | boolean
  | {
      delay?: number;
      icon?: React.ReactNode;
      iconPosition?: ButtonIconPosition;
    };

/**
 * @deprecated Eski `type` prop'u — bir sürüm boyunca çalışmaya devam eder.
 * `resolveLegacyButtonProps` bunu yeni `color`/`variant` eksenine çevirir.
 * "secondary" -> `neutral`; "text"/"link" değerleri artık birer renk değil,
 * `variant` (ghost/link) anlamına geldiği için variant'ı da etkiler.
 */
export type LegacyButtonType = "primary" | "secondary" | "link" | "text" | "success" | "error" | "warning" | "info";

export interface LegacyButtonProps {
  /** @deprecated `color` kullanın (ve gerekirse `variant`). */
  type?: LegacyButtonType;
}

/**
 * `aria-*`, `id`, `data-*` gibi native attribute'lar — eskiden Button
 * bunları hiç desteklemiyordu (kapalı bir prop objesiydi), bu yüzden
 * `aria-label` gibi temel erişilebilirlik prop'ları bile geçirilemiyordu.
 * `<button>`'a özgü attribute'lar (`form`, `formAction` gibi) YOK — Button
 * `href` verildiğinde `<a>` render eder, ikisi için ortak olmayan
 * attribute'ları desteklemek gerekmiyor.
 */
type NativeCommonAttributes = React.AriaAttributes & {
  id?: string;
  role?: string;
  tabIndex?: number;
  [dataAttribute: `data-${string}`]: unknown;
};

export interface ButtonProps extends LegacyButtonProps, NativeCommonAttributes {
  /** Semantik renk. Varsayılan: `primary`. */
  color?: ColorRole;
  /**
   * Dolgu stili. Varsayılan: `solid`.
   * @remarks Eski `"outlined"`/`"filled"` değerleri de kabul edilir (deprecated) —
   * `"outlined"` -> `"outline"`, `"filled"` -> `"solid"`.
   */
  variant?: Variant | "outlined" | "filled";
  size?: ExtendedSize;
  shape?: ButtonShape;
  block?: boolean;
  classNames?: ButtonClassNames;
  className?: string;
  disabled?: boolean;
  href?: string;
  htmlType?: "submit" | "reset" | "button";
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  loading?: ButtonLoading;
  target?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLElement>) => void;
  children?: React.ReactNode;
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
}
