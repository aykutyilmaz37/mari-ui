import type React from "react";
import type { ColorRole, SlotClassNames, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

/**
 * Eskiden `variant` (outlined|borderless|filled|underlined) Button'ın
 * `variant`'ından (outlined|filled) FARKLI bir eksendi — aynı isim, iki
 * farklı anlam. Artık aynı kelime dağarcığını kullanıyor: `outline`≈outlined,
 * `soft`≈filled (tonlanmış arka plan), `ghost`≈borderless. `underlined`
 * Input'a özgü tek geometri, ayrı bir eksen değil.
 */
export type InputVariant = "outline" | "soft" | "ghost" | "underlined";
export type InputShape = "default" | "pill" | "square";
export type InputSlot = "wrapper" | "input" | "icon" | "clear" | "count";
export type InputClassNames = SlotClassNames<InputSlot>;
export type TextareaAutoSize = boolean | { minRows?: number; maxRows?: number };

export interface InputCountConfig {
  formatter?: (info: { value: string; count: number; maxLength?: number }) => React.ReactNode;
}

/**
 * `aria-*`/`data-*` gibi native attribute'lar — eskiden Input bunları hiç
 * desteklemiyordu, bu yüzden bir `<label htmlFor>` dışında bir etikete
 * bağlamanın (`aria-labelledby`) veya `name`/`required` ile gerçek bir
 * native form'a katılmanın hiçbir yolu yoktu (bkz. Button'ın Faz 3'te aldığı
 * aynı düzeltme).
 */
export type InputNativeAttributes = React.AriaAttributes & {
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  role?: string;
  readOnly?: boolean;
  /** Mobil klavye türü (`numeric`, `email`, `tel`, `search`…). */
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  /** Mobil klavyedeki Enter tuşunun etiketi (`search`, `send`, `next`…). */
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>["enterKeyHint"];
  autoComplete?: string;
  pattern?: string;
  [dataAttribute: `data-${string}`]: unknown;
};

export interface InputProps extends InputNativeAttributes, SkeletonableProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FormEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FormEvent<HTMLInputElement>) => void;
  onInput?: (e: React.FormEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  /** Temizle butonunun erişilebilir adı. Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  disabled?: boolean;
  size?: Size;
  shape?: InputShape;
  /** @remarks Eski `"outlined"`/`"filled"`/`"borderless"` değerleri de kabul edilir (deprecated). */
  variant?: InputVariant | "outlined" | "filled" | "borderless";
  /** Semantik renk. Varsayılan: `primary`. `error`/`warning` doğrulama durumu olarak da işlev görür. */
  color?: ColorRole;
  /** @deprecated `color` kullanın — "error"/"warning" zaten birer ColorRole. */
  status?: "error" | "warning";
  maxLength?: number;
  showCount?: boolean;
  count?: InputCountConfig;
  type?: string;
  id?: string;
  classNames?: InputClassNames;
  className?: string;
  mask?: string;
  replacement?: Record<string, RegExp>;
  visibilityToggle?: boolean | { visible?: boolean };
  visibilityIconRender?: (visible: boolean) => React.ReactNode;
  max?: number;
  min?: number;
}
