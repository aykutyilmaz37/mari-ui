import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";

export interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  footer?: ReactNode;
  /** Varsayılan: `true`. Web'deki `CardProps.bordered` ile aynı anlam. */
  bordered?: boolean;
  /**
   * Web'de `:hover` ile gölge/kenarlık değişimi tetikler. Native'de fare
   * imleci yok — `onPress` verilmişse bu, kartı bir `Pressable` olarak
   * render eder ve `pressed` durumunda aynı görsel değişimi uygular.
   */
  hoverable?: boolean;
  loading?: boolean;
  size?: Size;
  /** İç içe/gömülü kart görünümü — her zaman `surfaceAlt` arka plan + kenarlık. */
  inset?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  testID?: string;
}
