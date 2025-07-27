"use client";
import React, { createContext, useContext, useState, useMemo } from "react";

type TabsContextType = {
  activeTab: string;
  setActiveTab: (val: string) => void;
};

const TabsContext = createContext<TabsContextType | null>(null);

export const TabsProvider = ({
  defaultActiveTab = "",
  children,
}: {
  defaultActiveTab?: string;
  children: React.ReactNode;
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const value = useMemo(() => ({ activeTab, setActiveTab }), [activeTab]);

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
};

export const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabs must be used inside a <TabsProvider>");
  }
  return context;
};
