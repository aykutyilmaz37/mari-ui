import React from "react";
import clsx from "clsx";
import { SizeType } from "./types";
import { getSizeClassInput } from "./utils";

interface SkeletonInputProps {
  active?: boolean;
  size?: SizeType;
  className?: string;
}

export const SkeletonInput: React.FC<SkeletonInputProps> = ({
  active = false,
  size = "default",
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-gray-300 rounded transition-colors duration-300",
        active && "animate-pulse",
        getSizeClassInput(size),
        className
      )}
    />
  );
};
