import clsx from "clsx";
import { ClassName } from "./types";

export const getBaseClassname = ({
  variant,
  hoverable,
  size,
  type,
  className,
}: ClassName): string => {
  return clsx(
    "relative rounded-lg bg-white",
    variant === "outlined" && "border border-gray-200",
    variant === "borderless" && "border-none",
    hoverable && "hover:shadow-md transition-shadow",
    size === "small" && "text-sm",
    size === "middle" && "text-base",
    size === "big" && "text-lg",
    type === "inner" && "bg-gray-50 border border-gray-200",
    className
  );
};
