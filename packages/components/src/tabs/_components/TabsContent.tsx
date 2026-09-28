"use client";

import React, { useEffect } from "react";
import { cn } from "@mari-ui/core";
import { getTabId, useTabs } from "../useTabs";
import type { TabsContentProps } from "../types";
import { skeletonFill } from "../../lib/skeleton";

/**
 * Panel `tabIndex=0` taşır (WAI-ARIA: içinde odaklanabilir öğe olmayan bir
 * panel de klavyeyle erişilebilsin). Eskiden sabit `p-2` dolgu dayatıyordu —
 * artık sadece sekme çubuğundan ayıran üst boşluk (ant.design: 16px).
 */
export function TabsContent({ children, value, forceMount = false, className }: TabsContentProps) {
  const { activeTab, baseId, keepMounted, orientation, skeleton, registerPanel } = useTabs();
  const active = activeTab === value;
  const mounted = active || keepMounted || forceMount;
  useEffect(() => (mounted ? registerPanel(value) : undefined), [mounted, value, registerPanel]);
  if (!mounted) return null;

  // İskelet: gerçek içerik görünmez olarak akışta kalır ve paneli O boyar (yüklenince zıplamaz);
  // satır çubukları üstüne biner, sığmayanlar kırpılır. İçerik boşsa en az bir satırlık yer.
  const body = skeleton ? (
    <div aria-hidden className="relative min-h-5">
      <div className="invisible">{children}</div>
      <span className="absolute inset-0 flex flex-col gap-2.5 overflow-hidden pt-1">
        {["w-full", "w-11/12", "w-3/5"].map((width) => (
          <span key={width} className={cn("block h-3 shrink-0 rounded-sm", width, skeletonFill(true))} />
        ))}
      </span>
    </div>
  ) : (
    children
  );

  return (
    <div
      role="tabpanel"
      id={getTabId(baseId, value, "panel")}
      aria-labelledby={getTabId(baseId, value, "tab")}
      tabIndex={skeleton ? -1 : 0}
      hidden={!active}
      data-value={value}
      className={cn(
        "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        orientation === "vertical" ? "min-w-0 flex-1" : "pt-4",
        className
      )}
    >
      {body}
    </div>
  );
}
