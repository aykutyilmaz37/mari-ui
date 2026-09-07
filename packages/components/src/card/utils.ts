import { cn, type Size } from "@mari-ui/core";
import { fontSizeClass } from "../lib/sizeClasses";

export interface CardBaseClassOptions {
  bordered?: boolean;
  hoverable?: boolean;
  size?: Size;
  inset?: boolean;
  className?: string;
}

export function getBaseClassname({ bordered = true, hoverable, size, inset, className }: CardBaseClassOptions): string {
  return cn(
    "relative rounded-lg bg-mari-surface",
    bordered && "border border-mari-border",
    hoverable && "hover:shadow-md transition-shadow",
    size && fontSizeClass[size],
    inset && "bg-mari-surface-alt border border-mari-border",
    className
  );
}
