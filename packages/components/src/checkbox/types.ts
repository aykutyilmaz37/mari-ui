import type React from "react";
import type { ColorRole, SlotClassNames, Size, Variant } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type CheckboxChangeEvent = React.ChangeEvent<HTMLInputElement>;
export type CheckboxSlot = "wrapper" | "checkbox" | "label";
export type CheckboxClassNames = SlotClassNames<CheckboxSlot>;
export type CheckboxShape = "default" | "pill" | "square";

export interface CheckboxProps extends SkeletonableProps {
  autoFocus?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (e: CheckboxChangeEvent) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  classNames?: CheckboxClassNames;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: Size;
  shape?: CheckboxShape;
  id?: string;
  name?: string;
  value?: string;
  required?: boolean;
  /** Varsayılan: `outline`. Sadece `solid`/`outline` anlamlı. */
  variant?: Extract<Variant, "solid" | "outline">;
  /**
   * Semantik renk. Varsayılan: `primary`.
   * @remarks `error`/`warning` verilirse doğrulama durumu olarak da işlev görür.
   */
  color?: ColorRole;
}
