import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type AvatarSize = number | Size;
export type AvatarShape = "circle" | "square";

export interface AvatarProps extends SkeletonableProps {
  /** Görselin alt metni; görsel yoksa baş harfler ve erişilebilir ad buradan türetilir. */
  alt?: string;
  icon?: React.ReactNode;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string | React.ReactNode;
  /** Görsel yokken (baş harf / ikon) zemin rengi — soft ton. Varsayılan: nötr yüzey. */
  color?: ColorRole;
  onError?: () => boolean;
  className?: string;
}

export interface AvatarGroupProps {
  children: React.ReactNode;
  /** Bu sayıdan fazlası tek bir "+N" avatarında toplanır. */
  max?: number;
  /** Gruptaki tüm avatarların boyutu (tek tek verilen `size`'ı ezmez). Varsayılan: `md`. */
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
  /** Gruptaki tüm avatarlar (ve "+N") iskelet çizer. */
  skeleton?: boolean;
}
