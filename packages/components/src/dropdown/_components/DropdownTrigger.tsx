"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { DropdownTriggerProps } from "../types";
import { useDropdown } from "../useDropdown";
import { getTriggerClasses } from "../utils";

export function DropdownTrigger({ children, className, color, variant, onClick, "aria-label": ariaLabel }: DropdownTriggerProps) {
  const { visible, setVisible, triggerRef, panelId, focusPanelOnOpenRef } = useDropdown();

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={visible}
      aria-controls={visible ? panelId : undefined}
      className={cn("cursor-pointer", getTriggerClasses(color, variant), className)}
      onClick={(event) => {
        // `detail === 0`: click'i fare değil klavye (Enter/Boşluk) üretti.
        if (!visible && event.detail === 0) focusPanelOnOpenRef.current = true;
        setVisible(!visible);
        onClick?.(event);
      }}
    >
      {children}
    </button>
  );
}
