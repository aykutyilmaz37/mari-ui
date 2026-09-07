"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { DropdownTriggerProps } from "../types";
import { useDropdown } from "../useDropdown";
import { getTriggerClasses } from "../utils";

export function DropdownTrigger({ children, className, color, variant }: DropdownTriggerProps) {
  const { visible, setVisible } = useDropdown();

  return (
    <button type="button" className={cn("cursor-pointer", getTriggerClasses(color, variant), className)} onClick={() => setVisible(!visible)}>
      {children}
    </button>
  );
}
