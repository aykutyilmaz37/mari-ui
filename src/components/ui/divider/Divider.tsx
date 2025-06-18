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
    <div className={baseClass} role="separator" style={style}>
      {children && isHorizontal ? (
        <>
          <span className="flex-1 border-t border-inherit" />
          <span className={titleClass} style={marginStyle}>
            {children}
          </span>
          <span className="flex-1 border-t border-inherit" />
        </>
      ) : (
        <span className="border-l border-inherit h-full" />
      )}
    </div>
  );
};

export default Divider;
