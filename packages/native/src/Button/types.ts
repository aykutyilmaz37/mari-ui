import type { SkeletonableProps } from "../lib/Skeleton";
import type { ReactNode } from "react";
import type { GestureResponderEvent, StyleProp, ViewStyle } from "react-native";
import type { ColorRole, ExtendedSize, Variant } from "@mari-ui/core";

/** İkon-only ve pill butonlar için — web'deki `ButtonShape` ile aynı. */
export type ButtonShape = "default" | "pill" | "circle" | "square";
export type ButtonIconPosition = "start" | "end";

/** Web'deki `ButtonLoading` ile aynı sözleşme. */
export type ButtonLoading =
  | boolean
  | {
      /** ms — gösterge ancak bu süre dolunca belirir (kısa işlemlerde titreme olmasın). Buton yine HEMEN devre dışı olur. */
      delay?: number;
      /** Varsayılan dönen gösterge yerine kendi ikonunuz. */
      icon?: ReactNode;
      iconPosition?: ButtonIconPosition;
    };

export interface ButtonProps extends SkeletonableProps {
  /** Semantik renk. Varsayılan: `primary`. */
  color?: ColorRole;
  /** Dolgu stili. Varsayılan: `solid`. Web ile aynı sözlük; `link` web'deki gibi alt çizgisiz, dolgusuz. */
  variant?: Variant;
  /** Native ölçek: xs 32 · sm 36 · md 44 · lg 50 · xl 56 (web 20–48). Varsayılan: `md`. */
  size?: ExtendedSize;
  shape?: ButtonShape;
  /** Tam genişlik. */
  block?: boolean;
  disabled?: boolean;
  /** Süren eylem: buton devre dışı + dönen gösterge. Nesne ile gecikme / özel ikon. */
  loading?: ButtonLoading;
  /**
   * İkon (ör. lucide-react-native). `size` / `color` verilmezse butonun
   * boyutuna (12–20px) ve yazı rengine göre verilir — web'deki gibi.
   */
  icon?: ReactNode;
  iconPosition?: ButtonIconPosition;
  onPress?: (event: GestureResponderEvent) => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  /** Metin ya da öğe. Metin tek satırda kalır, sığmazsa "…" ile kesilir (web `truncate`). */
  children?: ReactNode;
  /** Kök `Pressable`e ek stil — web'deki `className`in native karşılığı. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** Yalnız ikonlu butonda ZORUNLU (ekran okuyucu adı). */
  accessibilityLabel?: string;
  accessibilityHint?: string;
}
