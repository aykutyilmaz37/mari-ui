"use client";

import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import { useTabs } from "../useTabs";
import { getTabsTriggerClassNames } from "../utils";
import type { TabsTriggerProps } from "../types";

export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({ children, value, cardTabs = false }, ref) => {
  const { activeTab, setActiveTab, color } = useTabs();
  const active = activeTab === value;

  return (
    <Button ref={ref} variant="ghost" className={cn(getTabsTriggerClassNames(active, cardTabs, color))} data-value={value} onClick={() => setActiveTab(value)}>
      {children}
    </Button>
  );
});

TabsTrigger.displayName = "TabsTrigger";
