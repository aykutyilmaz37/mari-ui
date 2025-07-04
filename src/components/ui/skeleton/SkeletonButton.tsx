import React from "react";
import clsx from "clsx";
import { ButtonShape, SizeType } from "./types";
import { getSizeClassInput } from "./utils";

interface SkeletonButtonProps {
  active?: boolean;
  block?: boolean;
  shape?: ButtonShape;
  size?: SizeType;
  className?: string;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({
  active = false,
  block = false,
  shape = "default",
  size = "default",
  className,
}) => {
  return (
    <div
      className={clsx(
        "bg-gray-300 transition-colors duration-300",
        active && "animate-pulse",
        getSizeClassInput(size),
        {
          "rounded-full": shape === "circle",
          "rounded-lg": shape === "round",
          "rounded-none": shape === "square",
          "rounded-md": shape === "default",
          "w-full": block,
        },
        className
      )}
    />
  );
};
