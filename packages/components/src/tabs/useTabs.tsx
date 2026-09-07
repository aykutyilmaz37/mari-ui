"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useControllableState } from "@mari-ui/core";
import type { TabsContextType } from "./types";

const TabsContext = createContext<TabsContextType | null>(null);

export function TabsProvider({
  defaultActiveTab = "",
  activeTab,
  onChange,
  color = "primary",
  children,
}: {
  defaultActiveTab?: string;
  activeTab?: string;
  onChange?: (value: string) => void;
  color?: TabsContextType["color"];
  children: React.ReactNode;
}) {
  // Artık controlled mod da destekleniyor (activeTab + onChange) — eskiden
  // sadece defaultActiveTab ile uncontrolled kullanılabiliyordu.
  const [resolvedActiveTab, setActiveTab] = useControllableState<string>({
    value: activeTab,
    defaultValue: defaultActiveTab,
    onChange,
  });

  const value = useMemo<TabsContextType>(
    () => ({ activeTab: resolvedActiveTab, setActiveTab, color }),
    [resolvedActiveTab, setActiveTab, color]
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
