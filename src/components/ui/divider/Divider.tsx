"use client";

import React from "react";
import {
  DividerOrientation,
  DividerSize,
  DividerType,
  DividerVariant,
} from "./types";
import { getBaseClass, getTitleClass, getMarginStyle } from "./utils";

export type DividerProps = {
  children?: React.ReactNode;
  className?: string;
  dashed?: boolean;
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  orientationMargin?: string | number;
  plain?: boolean;
  style?: React.CSSProperties;
  size?: DividerSize;
  type?: DividerType;
  height?: string | number;
};

export const Divider: React.FC<DividerProps> = ({
  children,
  className,
  dashed,
  variant = "solid",
  orientation = "center",
  orientationMargin,
  plain = true,
  style,
  size,
  type = "horizontal",
  height = "48px",
}) => {
  const isHorizontal = type === "horizontal";
  const baseClass = getBaseClass(
    isHorizontal,
    size,
    variant,
    dashed,
    className
  );
  const titleClass = getTitleClass(plain, orientation, isHorizontal);
  const marginStyle = getMarginStyle(
    orientation,
    orientationMargin,
    isHorizontal
  );

  return (
    <div className={baseClass} style={style}>
      {children && isHorizontal ? (
        <>
          <span className="flex-1 border-t border-inherit" />
          <span className={titleClass} style={marginStyle}>
            {children}
          </span>
          <span className="flex-1 border-t border-inherit" />
        </>
      ) : (
        <span
          className="inline-block border-l border-inherit"
          style={{
            height: typeof height === "number" ? `${height}px` : height,
          }}
        />
      )}
    </div>
  );
};

export default Divider;
