import type React from "react";
import type { ColorRole, SlotClassNames, Size, Variant } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/** @deprecated Eski `type` prop'unun değerleri. "secondary" -> `neutral`. */
export type LegacyRadioType = "primary" | "secondary";

export type RadioSlot = "wrapper" | "label" | "radio";
export type RadioClassNames = SlotClassNames<RadioSlot>;
export type RadioChangeEvent = React.ChangeEvent<HTMLInputElement>;

export interface RadioOption {
  label: React.ReactNode;
  value: string | number;
  disabled?: boolean;
  /** Etiketin altında soluk açıklama (ör. kargo seçeneğinin süresi). */
  description?: React.ReactNode;
}

export interface RadioProps extends SkeletonableProps {
  autoFocus?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  value?: string | number;
  onChange?: (e: RadioChangeEvent) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  classNames?: RadioClassNames;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: Size;
  id?: string;
  /** Varsayılan: `outline`. Sadece `solid`/`outline` anlamlı. */
  variant?: Extract<Variant, "solid" | "outline">;
  /** Semantik renk. Varsayılan: `primary`. `error`/`warning` doğrulama durumu olarak da işlev görür. */
  color?: ColorRole;
  /** @deprecated `color` kullanın. */
  status?: "error" | "warning";
  /** @deprecated `color` kullanın. */
  type?: LegacyRadioType;
  name?: string;
}

export interface RadioGroupProps extends SkeletonableProps {
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  options?: (string | number | RadioOption)[];
  onChange?: (value: string | number) => void;
  variant?: Extract<Variant, "solid" | "outline">;
  color?: ColorRole;
  /** @deprecated `color` kullanın. */
  type?: LegacyRadioType;
  size?: Size;
  block?: boolean;
  /** Yerleşim. Açıklamalı seçeneklerde `vertical` daha okunaklı. Varsayılan: `horizontal`. */
  orientation?: "horizontal" | "vertical";
  className?: string;
  /** Ekran okuyucu için grubun adı — görünür bir başlık varsa `aria-labelledby` tercih edin. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
}
