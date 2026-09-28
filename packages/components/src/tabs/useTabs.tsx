"use client";

import React, { createContext, useContext, useId, useMemo } from "react";
import { useControllableState } from "@mari-ui/core";
import type { TabsContextType, TabsProps } from "./types";

export const TabsContext = createContext<TabsContextType | null>(null);

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
}: TabsProviderProps) {
  const [resolvedActiveTab, setActiveTab] = useControllableState<string>({
    value: activeTab,
    defaultValue: defaultActiveTab,
    onChange,
  });
  const baseId = useId();
  const isControlled = activeTab !== undefined;

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
    }),
    [resolvedActiveTab, setActiveTab, isControlled, baseId, color, variant, size, orientation, fill, align, keepMounted, activationMode, skeleton]
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
