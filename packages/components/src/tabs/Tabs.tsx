import React from "react";
import type { TabsProps } from "./types";
import { TabsProvider } from "./useTabs";

export type { TabsProps };

export function Tabs({ defaultActiveTab, activeTab, onChange, color, children }: TabsProps) {
  return (
    <TabsProvider defaultActiveTab={defaultActiveTab} activeTab={activeTab} onChange={onChange} color={color}>
      <div className="min-w-full">{children}</div>
    </TabsProvider>
  );
}
