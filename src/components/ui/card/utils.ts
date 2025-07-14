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
    "relative rounded-lg bg-background",
    variant === "outlined" && "border border-border",
    variant === "borderless" && "border-none",
    hoverable && "hover:shadow-md transition-shadow",
    size === "small" && "text-sm",
    size === "middle" && "text-base",
    size === "large" && "text-lg",
    type === "inner" && "bg-background-alt border border-border",
    className
  );
};
