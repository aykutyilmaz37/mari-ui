import { twMerge } from "tailwind-merge";
import { getPlacementClass } from "../utils";
import { Placement } from "../types";
import React from "react";

type DropdownContentProps = {
  placement?: Placement;
  visible: boolean;
  className?: string;
  children: React.ReactNode;
};
export const DropdownContent: React.FC<DropdownContentProps> = ({
  placement = 'bottom',
  visible,
  children,
  className,
}) => {
  return (
    <div className="p-1">
      <div
        className={twMerge(
          "absolute text-wrap z-[999] max-w-2xl text-sm transition-opacity duration-200 p-4 border border-secondary-light shadow-2xl rounded-xl",
          getPlacementClass(placement),
          !visible && "hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
