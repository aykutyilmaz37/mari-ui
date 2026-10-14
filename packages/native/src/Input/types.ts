import type { SkeletonableProps } from "../lib/Skeleton";
import type { ReactNode } from "react";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";

export type InputVariant = "outline" | "soft" | "ghost" | "underlined";
export type InputShape = "default" | "pill" | "square";

/**
 * Web `type` ile aynı sözlük — native'de klavye / otomatik doldurma / gizli
 * giriş ayarlarına çevrilir (`password` → gizli + göster/gizle düğmesi).
 */
export type InputType = "text" | "password" | "email" | "number" | "tel" | "url" | "search";

export interface InputCountConfig {
  formatter?: (info: { value: string; count: number; maxLength?: number }) => ReactNode;
}

export interface InputProps extends SkeletonableProps {
  value?: string;
  defaultValue?: string;
  /** Web `onChange`in karşılığı — doğrudan metin. */
  onChangeText?: (value: string) => void;
  /** Klavyenin "gönder / bitti" tuşu (web `onPressEnter`). */
  onPressEnter?: (value: string) => void;
  placeholder?: string;
  type?: InputType;
  disabled?: boolean;
  /** Yalnız okunur: seçilebilir, düzenlenemez. */
  readOnly?: boolean;
  size?: Size;
  shape?: InputShape;
  variant?: InputVariant;
  /**
   * Doğrulama rengi. Verilmezse dinlenme kenarlığı nötr gri, odakta `primary`
   * (web ile aynı). `status` kısayolu: `error` / `warning`.
   */
  color?: ColorRole;
  status?: "error" | "warning";
  /** İkon (soluk renkte). `size` / `color` verilmezse 16px ve soluk renk verilir. */
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  /** Doluyken temizle düğmesi. `{ clearIcon }` ile kendi ikonunuz. */
  allowClear?: boolean | { clearIcon?: ReactNode };
  /** Temizle düğmesinin ekran okuyucu adı. Varsayılan: "Temizle". */
  clearLabel?: string;
  onClear?: () => void;
  maxLength?: number;
  /** Karakter sayacı ("12 / 50"). */
  showCount?: boolean;
  count?: InputCountConfig;
  /** `type="password"`de göster/gizle düğmesi. Varsayılan: `true`. */
  visibilityToggle?: boolean;
  visibilityIconRender?: (visible: boolean) => ReactNode;
  /** Biçim maskesi (ör. `"0(5__) ___ __ __"`); `_` yerine rakam yazılır. */
  mask?: string;
  replacement?: Record<string, RegExp>;
  autoFocus?: boolean;
  autoComplete?: Exclude<TextInputProps["autoComplete"], undefined>;
  /** Klavyedeki eylem tuşu (web `enterKeyHint`). */
  returnKeyType?: Exclude<TextInputProps["returnKeyType"], undefined>;
  onFocus?: Exclude<TextInputProps["onFocus"], undefined>;
  onBlur?: Exclude<TextInputProps["onBlur"], undefined>;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
