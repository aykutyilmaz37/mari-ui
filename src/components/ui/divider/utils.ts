import clsx from "clsx";

export const getBaseClass = (
  isHorizontal: boolean,
  size: string | undefined,
  variant: string | undefined,
  dashed: boolean | undefined,
  className?: string
) =>
  clsx(
    "flex",
    isHorizontal ? "w-full items-center" : "h-full flex-col justify-center",
    {
      "text-xs": size === "small",
      "text-sm": size === "middle",
      "text-base": size === "large",
      "border-t": isHorizontal,
      "border-l": !isHorizontal,
      "border-solid": variant === "solid",
      "border-dashed": variant === "dashed" || dashed,
      "border-dotted": variant === "dotted",
    },
    className
  );

export const getTitleClass = (
  plain: boolean | undefined,
  orientation: string | undefined,
  isHorizontal: boolean
) =>
  clsx("px-2 whitespace-nowrap", {
    "text-gray-500": plain,
    "ml-auto": orientation === "end" && isHorizontal,
    "mr-auto": orientation === "start" && isHorizontal,
  });

export const getMarginStyle = (
  orientation: string | undefined,
  orientationMargin: string | number | undefined,
  isHorizontal: boolean
): React.CSSProperties =>
  orientation !== "center" && orientationMargin
    ? isHorizontal
      ? {
          [orientation === "start" ? "marginRight" : "marginLeft"]:
            typeof orientationMargin === "number"
              ? `${orientationMargin}px`
              : orientationMargin,
        }
      : {}
    : {};
