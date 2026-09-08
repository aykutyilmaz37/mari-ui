import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { ColorRole, ExtendedSize, Variant } from "@mari-ui/core";

/** İkon-only ve pill butonlar için — web'deki `ButtonShape`in native karşılığı. `circle` hariç aynı. */
export type ButtonShape = "default" | "pill" | "circle" | "square";
export type ButtonIconPosition = "start" | "end";

export interface ButtonProps {
  /** Semantik renk. Varsayılan: `primary`. */
  color?: ColorRole;
  /**
   * Dolgu stili. Varsayılan: `solid`. Web'deki `ButtonProps.variant` ile aynı
   * sözlük — `"link"` native'de görsel olarak alt çizili metne düşer (href/
   * anchor kavramı native'de yok) ama API tutarlılığı için kabul edilir.
   */
  variant?: Variant;
  size?: ExtendedSize;
  shape?: ButtonShape;
  block?: boolean;
  disabled?: boolean;
  /** Web'deki `ButtonLoading` objesinin (delay/icon) aksine burada sade bir boolean — native'de gecikmeli-loading ihtiyacı çıkarsa genişletilir. */
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  onPress?: () => void;
  children?: ReactNode;
  /** Kök `Pressable`e ek stil — web'deki `className`in native karşılığı. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}
