import {
  ButtonIconPosition,
  ButtonLoading,
  ButtonShape,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "./types";

export const getShapeClasses = (shape: ButtonShape): string => {
  return {
    circle: "rounded-full",
    round: "rounded-full px-4",
    default: "rounded-md",
  }[shape];
};

export const getSizeClasses = (size: ButtonSize): string => {
  return {
    large: "text-base py-2 px-4 h-10",
    middle: "text-sm py-1.5 px-3 h-8",
    small: "text-xs py-1 px-2 h-6",
  }[size];
};

export const getVariantClasses = (
  variant: ButtonVariant,
  type: ButtonType
): string => {
  const filled: Partial<Record<ButtonType, string>> = {
    text: "text-primary",
    link: "text-primary underline",
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    success: "bg-success text-white hover:bg-success/90",
    error: "bg-error text-white hover:bg-error/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    info: "bg-info text-white hover:bg-info/90",
  };

  const outlined: Partial<Record<ButtonType, string>> = {
    text: "text-primary",
    link: "text-primary underline",
    primary: "border border-primary text-primary bg-white hover:bg-primary/10",
    secondary:
      "border border-secondary text-secondary bg-white hover:bg-secondary/10",
    success: "border border-success text-success bg-white hover:bg-success/10",
    error: "border border-error text-error bg-white hover:bg-error/10",
    warning: "border border-warning text-warning bg-white hover:bg-warning/10",
    info: "border border-info text-info bg-white hover:bg-info/10",
  };

  if (variant === "filled") return filled[type] ?? "";
  if (variant === "outlined") return outlined[type] ?? "";
  return "";
};

export const resolveLoading = (
  loading: ButtonLoading
): {
  isLoading: boolean;
  loadingIcon: React.ReactNode | null;
  loadingIconPosition: ButtonIconPosition;
} => {
  const isLoading =
    typeof loading === "boolean"
      ? loading
      : Boolean(loading?.delay || loading?.icon);

  const loadingIcon =
    typeof loading === "object" && loading.icon ? loading.icon : null;

  const loadingIconPosition: ButtonIconPosition =
    typeof loading === "object" && loading.iconPosition
      ? loading.iconPosition
      : "start";

  return { isLoading, loadingIcon, loadingIconPosition };
};
