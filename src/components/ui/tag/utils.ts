import clsx from "clsx";

export const statusColors: Record<string, string> = {
  success: "bg-success-light text-success-muted border-success",
  processing: "bg-info-light text-info-muted border-info",
  error: "bg-error-light text-error-muted border-error",
  warning: "bg-warning-light text-warning-muted border-warning",
  default: "bg-background-alt text-foreground",
};

export const getTagStatuClass = (color?: string): string => {
  const isPreset = color && statusColors[color];
  if (isPreset) return statusColors[color];
  if (color) return `bg-[${color}] text-white`; // Özel renk desteği korunuyor
  return "bg-background-alt text-foreground";
};

export const getTagClass = (
  baseColorClass?: string,
  bordered?: boolean,
  className?: string
): string => {
  return clsx(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium",
    baseColorClass,
    bordered && "border-border border",
    className
  );
};
