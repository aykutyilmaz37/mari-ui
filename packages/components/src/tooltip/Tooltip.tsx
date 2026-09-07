"use client";

import * as React from "react";
import clsx from "clsx";
import { Placement, TooltipVariant } from "./types";
import { getArrowClasses, getVariantClasses } from "./utils";
import { Play } from "lucide-react";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";

interface TooltipProps {
  content: React.ReactNode;
  trigger: React.ReactNode;
  placement?: Placement;
  variant?: TooltipVariant;
  className?: string;
  triggerClassName?: string;
  style?: React.CSSProperties;
  alwaysVisible?: boolean;
  disabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  trigger,
  placement = "top",
  variant = "default",
  className,
  style,
  alwaysVisible,
  disabled = false,
  triggerClassName,
}) => {
  const [visible, setVisible] = React.useState(alwaysVisible || false);

  const variantClasses = getVariantClasses(variant);
  const arrowClasses = getArrowClasses(variant);
  return (
    <div className="relative inline-block">
      <Button
        className={twMerge(triggerClassName)}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => !alwaysVisible && setVisible(false)}
      >
        {trigger}
      </Button>
      {visible && (
        <div
          className={clsx(
            "absolute text-wrap z-50 p-2 max-w-2xl rounded text-sm transition-opacity duration-200",
            {
              "top-full left-1/2 -translate-x-1/2 mt-2": placement === "bottom",
              "bottom-full left-1/2 -translate-x-1/2 mb-2": placement === "top",
              "left-full top-1/2 -translate-y-1/2 ml-2": placement === "right",
              "right-full top-1/2 -translate-y-1/2 mr-2": placement === "left",
            },
            disabled && "hidden",
            variantClasses,
            className
          )}
          style={{ ...style }}
        >
          {content}
          <Play
            size={12}
            className={clsx(
              "absolute",
              {
                "top-[2.5px] left-1/2 -translate-x-1/2 -translate-y-full -rotate-90":
                  placement === "bottom",
                "bottom-[2.5px] left-1/2 -translate-x-1/2 translate-y-full rotate-90":
                  placement === "top",
                "left-[2.5px] top-1/2 -translate-y-1/2 -translate-x-full rotate-180":
                  placement === "right",
                "right-[2.5px] top-1/2 -translate-y-1/2 translate-x-full":
                  placement === "left",
              },
              arrowClasses
            )}
          />
        </div>
      )}
    </div>
  );
};
