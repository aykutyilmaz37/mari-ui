"use client";

import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import { getTabId, useTabs } from "../useTabs";
import { getCountClass, getTriggerClass } from "../utils";
import type { TabsTriggerProps } from "../types";

/**
 * Faz 13.6: artık `Button`'ı sarmalamıyor — Button'ın `h-8` sabit yüksekliği
 * ve kendi `px-*` dolgusu sekme ölçüleriyle çakışıyor, ikonla etiket ALT
 * ALTA düşüyordu. Yerel `<button role="tab">`:
 * - roving tabindex (yalnız aktif sekme Tab durağı; diğerlerine ok tuşları),
 * - `useId` tabanlı id'ler (iki Tabs aynı `value`'yu kullanınca çakışıyordu),
 * - `icon` / `count` / `disabled`.
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({ children, value, icon, count, disabled, className }, ref) => {
  const { activeTab, setActiveTab, baseId, color, variant, orientation, size, fill } = useTabs();
  const active = activeTab === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={getTabId(baseId, value, "tab")}
      aria-selected={active}
      aria-controls={getTabId(baseId, value, "panel")}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={active ? "active" : "inactive"}
      onClick={() => setActiveTab(value)}
      className={cn(getTriggerClass({ active, variant, orientation, size, color, fill }), className)}
    >
      {icon && (
        <span aria-hidden className="inline-flex shrink-0 [&>svg]:size-4">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {count !== undefined && <span className={getCountClass(active, color)}>{count}</span>}
    </button>
  );
});

TabsTrigger.displayName = "TabsTrigger";
