import { InputShape, InputSize, InputStatus, InputVariant } from "./types";

export const getSizeClasses = (size: InputSize = "middle"): string => {
  return {
    large: "text-base px-4 py-2 h-10",
    middle: "text-sm px-3 py-1.5 h-8",
    small: "text-xs px-2 py-1 h-6",
  }[size];
};

export const getTextareaSizeClasses = (size: InputSize = "middle"): string => {
  return {
    large: "text-base px-4 py-2",
    middle: "text-sm px-3 py-1.5",
    small: "text-xs px-2 py-1",
  }[size];
};

export const getVariantClasses = (
  variant: InputVariant = "outlined"
): string => {
  return {
    outlined:
      "border border-border bg-background text-foreground focus-within:border-primary",
    filled:
      "bg-background-alt border border-border text-foreground border focus-within:border-primary",
    borderless: "border-none bg-transparent",
    underlined:
      "border-border border-b bg-transparent rounded-none focus-within:border-primary",
  }[variant];
};

export const getStatusClasses = (status?: InputStatus): string => {
  const map: Record<InputStatus, string> = {
    error: "border-error text-error focus-within:border-error-hover",
    warning: "border-warning text-warning focus-within:border-warning-hover",
  };
  return status ? map[status] : "";
};

export const getShapeClasses = (shape: InputShape): string => {
  return {
    square: "rounded-none",
    round: "rounded-full px-4",
    default: "rounded-md",
  }[shape];
};

export const isClearable = (
  allowClear: boolean | { clearIcon?: React.ReactNode } | undefined
): boolean => {
  return typeof allowClear === "boolean" ? allowClear : !!allowClear;
};
