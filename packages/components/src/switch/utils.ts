import clsx from "clsx";
import { SwitchSize } from "./types";

export const getSizeClasses = (size: SwitchSize): string => {
  return {
    large: "text-base py-2 px-4 h-8 w-24",
    middle: "text-sm py-1.5 px-3 h-7 w-16",
    small: "text-xs py-1 px-2 h-6 w-12",
  }[size];
};
export const getSizeBallClasses = (
  size: SwitchSize,
  checked: boolean
): string => {
  return {
    large: clsx(
      "h-7 w-7 top-0.5",
      checked ? "left-[calc(100%-2.25rem)]" : "left-1"
    ),
    middle: clsx(
      "h-6 w-6 top-0.5",
      checked ? "left-[calc(100%-1.75rem)]" : "left-1"
    ),
    small: clsx(
      "h-5 w-5 top-0.5",
      checked ? "left-[calc(100%-1.5rem)]" : "left-1"
    ),
  }[size];
};
