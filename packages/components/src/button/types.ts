export type ButtonIconPosition = "start" | "end";

export type ButtonSize = "large" | "middle" | "small";

export type ButtonShape = "default" | "circle" | "round" | "square";

export type ButtonVariant = "outlined" | "filled";

export type ButtonType =
  | "primary"
  | "secondary"
  | "link"
  | "text"
  | "success"
  | "error"
  | "warning"
  | "info";

export type ButtonSemanticDOM = "wrapper" | "icon" | "label";

export type ButtonClassNames = Partial<Record<ButtonSemanticDOM, string>>;

export type ButtonLoading =
  | boolean
  | {
      delay?: number;
      icon?: React.ReactNode;
      iconPosition?: ButtonIconPosition;
    };
