"use client";

import { twMerge } from "tailwind-merge";
import { getPlacementClass } from "../utils";
import { Placement } from "../types";
import React from "react";
import { useDropdown } from "../useDropdown";

type DropdownContentProps = {
  placement?: Placement;
  className?: string;
  children: React.ReactNode;
  customVisible?: boolean;
};
export const DropdownContent: React.FC<DropdownContentProps> = ({
  placement = "bottom",
  children,
  className,
  customVisible,
}) => {
  const { visible } = useDropdown();
  return (
    <div className="p-1">
      <div
        className={twMerge(
          "absolute text-wrap z-[999] max-w-2xl text-sm transition-opacity duration-200 p-4 border border-secondary-light shadow-2xl rounded-xl",
          getPlacementClass(placement),
          (customVisible === false || (!customVisible && !visible)) && "hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
