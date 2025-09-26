import { Placement, TriggerVariant } from "./types";

export function getPlacementClass(placement: Placement): string {
  switch (placement) {
    case "bottom":
      return "top-full left-1/2 -translate-x-1/2";
    case "top":
      return "bottom-full left-1/2 -translate-x-1/2";
    case "right":
      return "left-full top-0 -translate-y-10";
    case "left":
      return "right-full top-0 -translate-y-10";
    default:
      return "";
  }
}

export const getVariantClasses = (variant: TriggerVariant): string => {
  return {
    primary: "bg-primary text-white hover:bg-primary/90",
    secondary: "bg-secondary text-white hover:bg-secondary/90",
    success: "bg-success text-white hover:bg-success/90",
    error: "bg-error text-white hover:bg-error/90",
    warning: "bg-warning text-white hover:bg-warning/90",
    info: "bg-info text-white hover:bg-info/90",
    none: "",
  }[variant] ?? "";
};
