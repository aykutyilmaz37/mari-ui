"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { TooltipProps } from "./types";
import { getArrowClasses, getVariantClasses, toBaseDirection } from "./utils";

export type { TooltipProps };

/**
 * Eskiden HER trigger `<Button>` içine sarılıyordu — bir ikon veya link'e
 * tooltip eklendiğinde iç içe buton render ediliyordu (bkz. plan Faz 3
 * denetimi, somut a11y/DOM bug'ı). Artık trigger düz bir `<span>` içinde;
 * kendi bir buton/link ise davranışı korunur.
 */
export function Tooltip({
  content,
  trigger,
  placement = "top",
  color = "neutral",
  className,
  style,
  alwaysVisible,
  disabled = false,
  triggerClassName,
}: TooltipProps) {
  const [visible, setVisible] = useState(alwaysVisible ?? false);
  const direction = toBaseDirection(placement);

  return (
    <span
      className={cn("relative inline-block", triggerClassName)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => !alwaysVisible && setVisible(false)}
    >
      {trigger}
      {visible && (
        <span
          className={cn(
            "absolute text-wrap z-mari-tooltip p-2 max-w-2xl rounded text-sm transition-opacity duration-200",
            direction === "bottom" && "top-full left-1/2 -translate-x-1/2 mt-2",
            direction === "top" && "bottom-full left-1/2 -translate-x-1/2 mb-2",
            direction === "right" && "left-full top-1/2 -translate-y-1/2 ml-2",
            direction === "left" && "right-full top-1/2 -translate-y-1/2 mr-2",
            disabled && "hidden",
            getVariantClasses(color),
            className
          )}
          style={style}
        >
          {content}
          <Play
            size={12}
            className={cn(
              "absolute",
              direction === "bottom" && "top-[2.5px] left-1/2 -translate-x-1/2 -translate-y-full -rotate-90",
              direction === "top" && "bottom-[2.5px] left-1/2 -translate-x-1/2 translate-y-full rotate-90",
              direction === "right" && "left-[2.5px] top-1/2 -translate-y-1/2 -translate-x-full rotate-180",
              direction === "left" && "right-[2.5px] top-1/2 -translate-y-1/2 translate-x-full",
              getArrowClasses(color)
            )}
          />
        </span>
      )}
    </span>
  );
}
