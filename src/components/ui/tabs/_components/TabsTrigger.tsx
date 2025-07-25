import React, { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { useTabs } from "@/components/ui/tabs/useTabs";
import clsx from "clsx";
import { getTabsTriggerClassNames } from "../utils";

export type TriggerProps = {
  children: React.ReactNode;
  value: string;
  cardTabs?: boolean;
};

const TabsTriggerComponent = forwardRef<HTMLButtonElement, TriggerProps>(
  ({ children, value, cardTabs = false }, ref) => {
    const { activeTab, setActiveTab } = useTabs();
    const active = activeTab === value;
    const handleTrigger = (value: string) => setActiveTab(value);

    return (
      <Button
        ref={ref}
        className={clsx(getTabsTriggerClassNames(active, cardTabs))}
        data-value={value}
        onClick={() => handleTrigger(value)}
      >
        {children}
      </Button>
    );
  }
);
TabsTriggerComponent.displayName = "TabsTrigger";

export const TabsTrigger = TabsTriggerComponent;
