import type React from "react";
import { cn, type Size } from "@mari-ui/core";
import { fontSizeClass } from "../lib/sizeClasses";
import type { DividerLabelAlign, DividerLineStyle } from "./types";

export function getBaseClass(
  isHorizontal: boolean,
  size: Size | undefined,
  lineStyle: DividerLineStyle | undefined,
  className?: string
): string {
  return cn(
    "flex",
    isHorizontal ? "w-full items-center" : "h-full flex-col justify-center",
    size && fontSizeClass[size],
    lineStyle === "solid" && "border-solid",
    lineStyle === "dashed" && "border-dashed",
    lineStyle === "dotted" && "border-dotted",
    className
  );
}

export function getLabelClass(plain: boolean | undefined, labelAlign: DividerLabelAlign | undefined, isHorizontal: boolean): string {
  return cn(
    "px-2 whitespace-nowrap",
    // "text-muted-500" -> gerçek bir token değildi (tema'da hiç yoktu, sessizce
    // no-op'tu). Nötr rolün `text` slotu bunun yerine geçiyor.
    plain && "text-mari-neutral",
    labelAlign === "end" && isHorizontal && "ml-auto",
    labelAlign === "start" && isHorizontal && "mr-auto"
  );
}

export function getLabelMarginStyle(
  labelAlign: DividerLabelAlign | undefined,
  labelMargin: string | number | undefined,
  isHorizontal: boolean
): React.CSSProperties {
  if (labelAlign === "center" || !labelMargin || !isHorizontal) return {};
  const marginValue = typeof labelMargin === "number" ? `${labelMargin}px` : labelMargin;
  return labelAlign === "start" ? { marginRight: marginValue } : { marginLeft: marginValue };
}
