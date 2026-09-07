import React from "react";
import type { DividerProps } from "./types";
import { getBaseClass, getLabelClass, getLabelMarginStyle } from "./utils";

/**
 * Hook yok, browser API yok — saf sunum. Eski kodda gereksiz yere
 * `"use client"` taşıyordu (bkz. plan Faz 3 denetimi); kaldırıldı.
 */
export function Divider({
  children,
  className,
  lineStyle = "solid",
  orientation = "horizontal",
  labelAlign = "center",
  labelMargin,
  plain = true,
  style,
  size,
  height = "48px",
}: DividerProps) {
  const isHorizontal = orientation === "horizontal";
  const baseClass = getBaseClass(isHorizontal, size, lineStyle, className);
  const labelClass = getLabelClass(plain, labelAlign, isHorizontal);
  const marginStyle = getLabelMarginStyle(labelAlign, labelMargin, isHorizontal);

  return (
    <div className={baseClass} style={style}>
      {children && isHorizontal ? (
        <>
          <span className="flex-1 border-t border-inherit" />
          <span className={labelClass} style={marginStyle}>
            {children}
          </span>
          <span className="flex-1 border-t border-inherit" />
        </>
      ) : (
        <span
          className="inline-block border-l border-inherit"
          style={{ height: typeof height === "number" ? `${height}px` : height }}
        />
      )}
    </div>
  );
}
