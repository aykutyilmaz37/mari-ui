import type { TooltipVariant } from "./types";

export function getVariantClasses(variant: TooltipVariant): string {
  switch (variant) {
    case "primary":
      return "bg-primary text-white";
    case "success":
      return "bg-success text-white";
    case "warning":
      return "bg-warning text-black";
    case "secondary":
      return "bg-secondary text-white";
    case "info":
      return "bg-info text-white";
    case "error":
      return "bg-error text-white";
    case "default":
      return "bg-white text-black shadow-md border border-gray-100";
    default:
      return "";
  }
}
export function getArrowClasses(variant: TooltipVariant): string {
  switch (variant) {
    case "primary":
      return "fill-primary stroke-primary";
    case "success":
      return "fill-success stroke-success";
    case "warning":
      return "fill-warning stroke-warning";
    case "secondary":
      return "fill-secondary stroke-secondary";
    case "info":
      return "fill-info stroke-info";
    case "error":
      return "fill-error stroke-error";
    case "default":
      return "fill-white stroke-gray-100";
    default:
      return "";
  }
}
