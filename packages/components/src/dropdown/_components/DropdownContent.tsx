"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { DropdownContentProps } from "../types";
import { useDropdown } from "../useDropdown";
import { getPlacementClass } from "../utils";

export function DropdownContent({ placement = "bottom", children, className, customVisible }: DropdownContentProps) {
  const { visible } = useDropdown();
  return (
    <div className="p-1">
      <div
        className={cn(
          "absolute text-wrap z-mari-dropdown max-w-2xl text-sm transition-opacity duration-200 p-4 border border-mari-border bg-mari-surface shadow-2xl rounded-xl",
          getPlacementClass(placement),
          (customVisible === false || (!customVisible && !visible)) && "hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
