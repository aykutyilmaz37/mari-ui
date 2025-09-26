import React from "react";
import { twMerge } from "tailwind-merge";
import { TriggerVariant } from "../types";
import { getVariantClasses } from "../utils";
import { useDropdown } from "../useDropdown";

type DropdownTriggerProps = {
  children: React.ReactNode;
  className?: string;
  variant?: TriggerVariant;
};

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  className,
  variant = "none",
}) => {
  const { visible, setVisible } = useDropdown();

  const handleTrigger = () => setVisible(!visible);

  return (
    <button
      className={twMerge(
        "cursor-pointer",
        className,
        getVariantClasses(variant)
      )}
      onClick={handleTrigger}
    >
      {children}
    </button>
  );
};
