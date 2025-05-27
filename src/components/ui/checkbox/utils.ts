import type {
  CheckboxStatus,
  CheckboxSize,
  CheckboxVariant,
  CheckboxShape,
  CheckboxType,
} from "./types";

export const getStatusClasses = (status?: CheckboxStatus): string => {
  const map: Record<CheckboxStatus, string> = {
    error: "border-error text-error focus:ring-error-hover",
    warning: "border-warning text-warning focus:ring-warning-hover",
  };
  return status ? map[status] : "";
};

export const getSizeClasses = (size: CheckboxSize = "middle"): string => {
  return {
    small: "h-3 w-3 text-xs",
    middle: "h-4 w-4 text-sm",
    large: "h-5 w-5 text-base",
  }[size];
};

export const getSizeIndeterminateClasses = (
  size: CheckboxSize = "middle"
): string => {
  return {
    small: "h-1.5 w-1.5",
    middle: "h-2.5 w-2.5",
    large: "h-3 w-3",
  }[size];
};

export const getVariantClasses = (
  variant: CheckboxVariant = "outline",
  type: CheckboxType = "primary"
): string => {
  const map: Record<CheckboxVariant, Record<CheckboxType, string>> = {
    outline: {
      primary:
        "bg-white border-primary text-primary checked:bg-primary checked:text-white focus:ring-primary-hover",
      secondary:
        "bg-white border-secondary text-secondary checked:bg-secondary checked:text-white focus:ring-secondary-hover",
    },
    solid: {
      primary:
        "bg-primary border-primary text-white checked:bg-primary-dark focus:ring-primary-hover",
      secondary:
        "bg-secondary border-secondary text-white checked:bg-secondary-dark focus:ring-secondary-hover",
    },
  };

  return map[variant]?.[type] ?? "";
};

export const getVariantIndeterminateClasses = (
  variant: CheckboxVariant = "outline",
  type: CheckboxType = "primary"
): string => {
  const map: Record<CheckboxVariant, Record<CheckboxType, string>> = {
    outline: {
      primary: "bg-primary",
      secondary: "bg-secondary",
    },
    solid: {
      primary: "bg-primary-dark",
      secondary: "bg-secondary-dark",
    },
  };

  return map[variant]?.[type] ?? "";
};

export const getShapeClasses = (shape: CheckboxShape): string => {
  return {
    square: "rounded-none",
    round: "rounded-full px-4",
    default: "rounded-md",
  }[shape];
};
