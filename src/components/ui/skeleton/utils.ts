import { SizeType } from "./types";

export const getSizeClassInput = (size: SizeType = "default") => {
  switch (size) {
    case "small":
      return "h-6 w-32";
    case "large":
      return "h-12 w-64";
    default:
      return "h-10 w-48";
  }
};

export const getSizeClassButton = (size: SizeType) => {
  switch (size) {
    case "small":
      return "h-6 w-16";
    case "large":
      return "h-12 w-32";
    default:
      return "h-10 w-24";
  }
};

export const getSizeClassSkeleton = (
  size: number | SizeType,
  prefix: string
) => {
  if (typeof size === "number") return `${prefix}-[${size}px]`;
  if (size === "small") return `${prefix}-8`;
  if (size === "large") return `${prefix}-16`;
  return `${prefix}-12`;
};
