import type { RadioSize, RadioVariant, RadioStatus, RadioType } from "./types";

export const getSizeClasses = (size: RadioSize = "middle") => {
  return {
    small: "w-3 h-3 text-sm",
    middle: "w-4 h-4 text-base",
    large: "w-5 h-5 text-lg",
  }[size];
};

export const getSizeDotClasses = (size: RadioSize = "middle") => {
  return {
    small: "w-1 h-1",
    middle: "w-2 h-2",
    large: "w-2.5 h-2.5",
  }[size];
};

export const getVariantClasses = (
  variant: RadioVariant = "outline",
  type: RadioType = "primary"
): string => {
  const map: Record<RadioVariant, Record<RadioType, string>> = {
    outline: {
      primary: "border border-primary text-primary hover:border-primary-hover",
      secondary:
        "border border-secondary text-secondary hover:border-secondary-hover",
    },
    solid: {
      primary: "bg-primary text-white hover:bg-primary-hover",
      secondary: "bg-secondary text-white hover:bg-secondary-hover",
    },
  };

  return map[variant]?.[type] ?? "";
};

export const getVariantDotClasses = (
  variant: RadioVariant = "outline",
  type: RadioType = "primary"
): string => {
  const map: Record<RadioVariant, Record<RadioType, string>> = {
    outline: {
      primary: "bg-primary",
      secondary: "bg-secondary",
    },
    solid: {
      primary: "bg-white",
      secondary: "bg-white",
    },
  };

  return map[variant]?.[type] ?? "";
};

export const getStatusClasses = (status?: RadioStatus) => {
  const map: Record<RadioStatus, string> = {
    error: "border-error text-error focus:ring-error-hover",
    warning: "border-warning text-warning focus:ring-warning-hover",
  };
  return status ? map[status] : "";
};

export const getOptionTypeClasses = (
  optionType: "default" | "button" = "default"
) => {
  if (optionType === "button") {
    return "rounded-md px-3 py-1 bg-white hover:bg-gray-100 border transition";
  }
  return "rounded-full";
};
