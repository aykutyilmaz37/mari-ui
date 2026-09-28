import type { ReactNode } from "react";
import type { StyleProp, TextInputProps, TextStyle, ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";

/**
 * Web'in `InputVariant`iyle (bkz. `components/src/input/types.ts`) BİREBİR
 * aynı sözlük — `"outlined"/"filled"/"borderless"` gibi eski deprecated
 * alias'lar burada yok, çünkü native'in web gibi bir "geçmişi" yok; sıfırdan
 * güncel isimlerle başlıyor.
 */
export type InputVariant = "outline" | "soft" | "ghost" | "underlined";
export type InputShape = "default" | "pill" | "square";

export interface InputProps {
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: Size;
  shape?: InputShape;
  variant?: InputVariant;
  /** Verilmezse nötr sınır, odakta primary. `error`/`warning` kalıcı doğrulama rengidir. */
  color?: ColorRole;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  /** Doluyken bir temizleme (X) düğmesi gösterir ve `onChangeText("")` çağırır. */
  allowClear?: boolean;
  maxLength?: number;
  secureTextEntry?: boolean;
  onFocus?: TextInputProps["onFocus"];
  onBlur?: TextInputProps["onBlur"];
  onSubmitEditing?: TextInputProps["onSubmitEditing"];
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  testID?: string;
  accessibilityLabel?: string;
}
