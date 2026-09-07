export type SizeType = "small" | "default" | "large";

export type ButtonShape = "circle" | "round" | "square" | "default";

export type AvatarShape = "circle" | "square";

export interface SkeletonAvatarProps {
  active?: boolean;
  shape?: AvatarShape;
  size?: number | SizeType;
}

export interface SkeletonTitleProps {
  width?: number | string;
}

export interface SkeletonParagraphProps {
  rows?: number;
  width?: number | string | Array<number | string>;
}
