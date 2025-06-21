export type AvatarSize =
  | number
  | "large"
  | "small"
  | "default"
  | {
      sm?: number;
      md?: number;
      lg?: number;
    };

export type AvatarShape = "circle" | "square";
