"use client";

import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import { getTabId, useTabs } from "../useTabs";
import { getCountClass, getTriggerClass } from "../utils";
import type { TabsTriggerProps } from "../types";
import { skeletonFill } from "../../lib/skeleton";

/** İskelette etiket: kendi metin kutusunda dolgu, harfler görünmez (genişlik korunur). */
const skeletonTextClass = cn("rounded-sm text-transparent", skeletonFill(true));

/**
 * Faz 13.6: artık `Button`'ı sarmalamıyor — Button'ın `h-8` sabit yüksekliği
 * ve kendi `px-*` dolgusu sekme ölçüleriyle çakışıyor, ikonla etiket ALT
 * ALTA düşüyordu. Yerel `<button role="tab">`:
 * - roving tabindex (yalnız aktif sekme Tab durağı; diğerlerine ok tuşları),
 * - `useId` tabanlı id'ler (iki Tabs aynı `value`'yu kullanınca çakışıyordu),
 * - `icon` / `count` / `disabled`.
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({ children, value, icon, count, disabled, className }, ref) => {
  const { activeTab, setActiveTab, baseId, color, variant, orientation, size, fill, skeleton, mountedPanels } = useTabs();
  const active = activeTab === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={getTabId(baseId, value, "tab")}
      aria-selected={active}
      aria-controls={mountedPanels.has(value) ? getTabId(baseId, value, "panel") : undefined}
      tabIndex={active && !skeleton ? 0 : -1}
      disabled={disabled}
      data-value={value}
      data-state={active ? "active" : "inactive"}
      onClick={() => !skeleton && setActiveTab(value)}
      // İskelette sekme kutusu (dolgu, kenarlık, kart zemini) aynı kalır; yalnız içerik yer tutucu olur.
      className={cn(getTriggerClass({ active, variant, orientation, size, color, fill }), skeleton && "pointer-events-none", className)}
    >
      {icon && (
        <span aria-hidden className={cn("inline-flex shrink-0 [&>svg]:size-4", skeleton && cn("rounded-sm [&>svg]:invisible", skeletonFill(true)))}>
          {icon}
        </span>
      )}
      <span className={cn(skeleton && skeletonTextClass)}>{children}</span>
      {count !== undefined && <span className={cn(getCountClass(active, color), skeleton && skeletonTextClass)}>{count}</span>}
    </button>
  );
});

TabsTrigger.displayName = "TabsTrigger";
