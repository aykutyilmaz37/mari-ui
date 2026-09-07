"use client";

import React from "react";
import { useTabs } from "../useTabs";
import type { TabsContentProps } from "../types";

export function TabsContent({ children, value }: TabsContentProps) {
  const { activeTab } = useTabs();
  return (
    activeTab === value && (
      <div className="p-2" data-value={value}>
        {children}
      </div>
    )
  );
}
