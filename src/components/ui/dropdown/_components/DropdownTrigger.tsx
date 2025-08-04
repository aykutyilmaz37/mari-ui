import React from "react";
import { twMerge } from "tailwind-merge";
import { TriggerVariant } from "../types";
import { getVariantClasses } from "../utils";

type DropdownTriggerProps = {
  children: React.ReactNode;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  variant?: TriggerVariant;
};

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  visible,
  setVisible,
  className,
  variant = "none",
}) => {
  const handleTrigger = () => setVisible(!visible);

  return (
    <button
      type="button"
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
