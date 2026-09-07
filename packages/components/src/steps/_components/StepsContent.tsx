import React from "react";
import { cn } from "@mari-ui/core";

export interface StepsContentProps {
  value: number;
  currentSteps: number;
  children: React.ReactNode;
  className?: string;
}

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function StepsContent({ value, currentSteps, children, className }: StepsContentProps) {
  return (
    currentSteps === value && (
      <div className={cn("w-fit p-2 border border-dashed border-mari-primary-border bg-mari-primary-subtle rounded", className)} data-value={value}>
        {children}
      </div>
    )
  );
}
