import React from "react";
import { Button } from "../button";
import { twMerge } from "tailwind-merge";
import { ButtonType } from "../button/types";
import { Placement } from "./types";
import { getPlacementClass } from "./utils";

type DropdownProps = {
  trigger: React.ReactNode;
  children: React.ReactNode;
  triggerClassName?: string;
  hover?: boolean;
  triggerVariant?: ButtonType;
  placement?: Placement;
  className?: string;
};
export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  triggerClassName,
  hover = false,
  triggerVariant = "primary",
  placement = "bottom",
  className,
}) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={hover ? () => setVisible(true) : undefined}
      onMouseLeave={hover ? () => setVisible(false) : undefined}
    >
      <Button
        type={triggerVariant}
        className={twMerge(triggerClassName)}
        onClick={!hover ? () => setVisible(!visible) : undefined}
      >
        {trigger}
      </Button>
      <div className="p-1">
        <div
          className={twMerge(
            "absolute text-wrap z-50 max-w-2xl text-sm transition-opacity duration-200 p-4 border border-secondary-light shadow-2xl rounded-xl",
            getPlacementClass(placement),
            !visible && "hidden",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
