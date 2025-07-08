import clsx from "clsx";

export const getBaseClass = (
  isHorizontal: boolean,
  size?: string,
  variant?: string,
  dashed?: boolean,
  className?: string
) =>
  clsx(
    "flex",
    isHorizontal ? "w-full items-center" : "h-full flex-col justify-center",
    {
      "text-xs": size === "small",
      "text-sm": size === "middle",
      "text-base": size === "large",
      "border-solid": variant === "solid",
      "border-dashed": variant === "dashed" || dashed,
      "border-dotted": variant === "dotted",
    },
    className
  );

export const getTitleClass = (
  plain?: boolean,
  orientation?: string,
  isHorizontal?: boolean
) =>
  clsx("px-2 whitespace-nowrap", {
    "text-gray-500": plain,
    "ml-auto": orientation === "end" && isHorizontal,
    "mr-auto": orientation === "start" && isHorizontal,
  });

export const getMarginStyle = (
  orientation?: string,
  orientationMargin?: string | number,
  isHorizontal?: boolean
): React.CSSProperties => {
  if (orientation === "center" || !orientationMargin || !isHorizontal) {
    return {};
  }
  const marginValue =
    typeof orientationMargin === "number"
      ? `${orientationMargin}px`
      : orientationMargin;

  return orientation === "start"
    ? { marginRight: marginValue }
    : { marginLeft: marginValue };
};
