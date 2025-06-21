export type CardVariant = "outlined" | "borderless";
export type CardSize = "default" | "small" | "middle" | "big";
export type CardType = "inner" | undefined;
export type SemanticDOM = "header" | "body" | "footer" | string;

export type ClassName = {
  variant?: string;
  hoverable?: boolean;
  size?: string;
  type?: string;
  className?: string;
};
