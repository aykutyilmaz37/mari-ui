import type React from "react";
import type { Size } from "@mari-ui/core";

export type SkeletonButtonShape = "circle" | "round" | "square" | "default";
export type SkeletonAvatarShape = "circle" | "square";

export interface SkeletonAvatarProps {
  active?: boolean;
  shape?: SkeletonAvatarShape;
  size?: number | Size;
}

export interface SkeletonTitleProps {
  width?: number | string;
}

export interface SkeletonParagraphProps {
  rows?: number;
  width?: number | string | Array<number | string>;
}

export interface SkeletonProps {
  active?: boolean;
  avatar?: boolean | SkeletonAvatarProps;
  loading?: boolean;
  paragraph?: boolean | SkeletonParagraphProps;
  round?: boolean;
  title?: boolean | SkeletonTitleProps;
  className?: string;
  children?: React.ReactNode;
}
