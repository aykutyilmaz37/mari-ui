"use client";

import React, { createContext, useCallback, useContext, useId, useMemo, useState } from "react";
import { useControllableState } from "@mari-ui/core";
import type { TabsContextType, TabsProps } from "./types";

export const TabsContext = /* @__PURE__ */ createContext<TabsContextType | null>(null);

type TabsProviderProps = Omit<TabsProps, "className" | "responsive">;

export function TabsProvider({
  defaultActiveTab = "",
  activeTab,
  onChange,
  color = "primary",
  variant = "line",
  size = "md",
  orientation = "horizontal",
  fill = false,
  align = "start",
  keepMounted = false,
  activationMode = "automatic",
  skeleton = false,
  children,
}: Readonly<TabsProviderProps>) {
  const [resolvedActiveTab, setActiveTab] = useControllableState<string>({
    value: activeTab,
    defaultValue: defaultActiveTab,
    onChange,
  });
  const baseId = useId();
  const isControlled = activeTab !== undefined;

  // `aria-controls` var olmayan bir id'yi gösteremez (axe aria-valid-attr-value):
  // Tabs yalnız filtre çubuğu olarak (paneli olmadan) kullanılabilir, pasif
  // paneller de `keepMounted` yoksa DOM'da değildir.
  const [mountedPanels, setMountedPanels] = useState<ReadonlySet<string>>(() => new Set());
  const registerPanel = useCallback((panel: string) => {
    setMountedPanels((prev) => (prev.has(panel) ? prev : new Set(prev).add(panel)));
    return () =>
      setMountedPanels((prev) => {
        const next = new Set(prev);
        next.delete(panel);
        return next;
      });
  }, []);

  const value = useMemo<TabsContextType>(
    () => ({
      activeTab: resolvedActiveTab,
      setActiveTab,
      isControlled,
      baseId,
      color,
      variant,
      size,
      orientation,
      fill,
      align,
      keepMounted,
      activationMode,
      skeleton,
      mountedPanels,
      registerPanel,
    }),
    [resolvedActiveTab, setActiveTab, isControlled, baseId, color, variant, size, orientation, fill, align, keepMounted, activationMode, skeleton, mountedPanels, registerPanel]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs(): TabsContextType {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs, <Tabs> içinde kullanılmalı.");
  }
  return context;
}

/** `value` → DOM id. Değerdeki boşluk vb. id'yi bozmasın. */
export function getTabId(baseId: string, value: string, kind: "tab" | "panel"): string {
  return `${baseId}-${kind}-${value.replace(/\s+/g, "-")}`;
}
