import clsx from "clsx";

export const statusColors: Record<string, string> = {
  success: "bg-green-100 text-green-800",
  processing: "bg-blue-100 text-blue-800",
  error: "bg-red-100 text-red-800",
  warning: "bg-yellow-100 text-yellow-800",
  default: "bg-gray-100 text-gray-800",
};

export const getTagStatuClass = (color?: string): string => {
  const isPreset = color && statusColors[color];
  if (isPreset) return statusColors[color as keyof typeof statusColors];
  if (color) return `bg-[${color}] text-white`;
  return "bg-gray-100 text-gray-800";
};

export const getTagClass = (
  baseColorClass?: string,
  bordered?: boolean,
  className?: string
): string => {
  const tagClass = clsx(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-sm font-medium",
    baseColorClass,
    bordered && "border",
    className
  );
  return tagClass;
};
