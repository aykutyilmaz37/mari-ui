import type React from "react";
import type { Size } from "@mari-ui/core";

export type AvatarSize = number | Size;
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  alt?: string;
  icon?: React.ReactNode;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string | React.ReactNode;
  onError?: () => boolean;
}
