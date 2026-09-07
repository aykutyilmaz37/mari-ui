"use client";

import React from "react";
import { useTabs } from "@/components/ui/tabs/useTabs";

type TabsContentProps = {
  children: React.ReactNode;
  value: string;
};

export const TabsContent: React.FC<TabsContentProps> = ({
  children,
  value,
}) => {
  const { activeTab } = useTabs();

  return (
    activeTab === value && (
      <div className="p-2" data-value={value}>
        {children}
      </div>
    )
  );
};
