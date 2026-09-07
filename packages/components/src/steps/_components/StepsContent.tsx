import React from "react";
import { twMerge } from "tailwind-merge";

type StepsContentProps = {
  value: number;
  currentSteps: number;
  children: React.ReactNode;
  className?: string;
};
export const StepsContent: React.FC<StepsContentProps> = ({
  value,
  currentSteps,
  children,
  className,
}) => {
  return (
    currentSteps === value && (
      <div
        className={twMerge(
          "w-fit p-2 border border-dashed border-primary bg-secondary-light rounded",
          className
        )}
        data-value={value}
      >
        {children}
      </div>
    )
  );
};
