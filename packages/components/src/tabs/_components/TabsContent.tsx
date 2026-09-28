"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import { getTabId, useTabs } from "../useTabs";
import type { TabsContentProps } from "../types";

/**
 * Panel `tabIndex=0` taşır (WAI-ARIA: içinde odaklanabilir öğe olmayan bir
 * panel de klavyeyle erişilebilsin). Eskiden sabit `p-2` dolgu dayatıyordu —
 * artık sadece sekme çubuğundan ayıran üst boşluk (ant.design: 16px).
 */
export function TabsContent({ children, value, forceMount = false, className }: TabsContentProps) {
  const { activeTab, baseId, keepMounted, orientation } = useTabs();
  const active = activeTab === value;
  if (!active && !keepMounted && !forceMount) return null;

  return (
    <div
      role="tabpanel"
      id={getTabId(baseId, value, "panel")}
      aria-labelledby={getTabId(baseId, value, "tab")}
      tabIndex={0}
      hidden={!active}
      data-value={value}
      className={cn(
        "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        orientation === "vertical" ? "min-w-0 flex-1" : "pt-4",
        className
      )}
    >
      {children}
    </div>
  );
}
