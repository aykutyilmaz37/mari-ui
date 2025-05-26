import type {
  CheckboxStatus,
  CheckboxSize,
  CheckboxVariant,
  CheckboxShape,
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

export const getVariantClasses = (
  variant: CheckboxVariant = "primary"
): string => {
  const map: Record<CheckboxVariant, string> = {
    primary:
      "text-primary border-primary bg-white checked:bg-primary checked:text-white focus:ring-primary-hover",
    secondary:
      "text-secondary border-secondary bg-white checked:bg-secondary checked:text-white focus:ring-secondary-hover",
    neutral:
      "text-gray-600 border-gray-300 bg-white checked:bg-gray-600 checked:text-white focus:ring-gray-400",
  };
  return map[variant];
};

export const getShapeClasses = (shape: CheckboxShape): string => {
  return {
    square: "rounded-none",
    round: "rounded-full px-4",
    default: "rounded-md",
  }[shape];
};
