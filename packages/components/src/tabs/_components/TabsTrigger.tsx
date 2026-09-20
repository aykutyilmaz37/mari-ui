"use client";

import React, { forwardRef } from "react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import { useTabs } from "../useTabs";
import { getTabsTriggerClassNames } from "../utils";
import type { TabsTriggerProps } from "../types";

/**
 * Faz 13.5 kullanıcı bulgusu: hiçbir ARIA sekme semantiği (`role="tab"`,
 * `aria-selected`, `id`/`aria-controls` eşleşmesi) uygulanmıyordu — ekran
 * okuyucu kullanıcıları için bunlar sadece bir dizi düğme gibi görünüyordu,
 * "sekme" oldukları ve hangisinin aktif olduğu hiç anons edilmiyordu.
 * Tam WAI-ARIA Tabs deseni (ok tuşlarıyla roving-tabindex gezinme) kapsam
 * dışı bırakıldı — her tetikleyici zaten gerçek bir `<button>` olduğundan
 * Tab ile tek tek erişilebilir; sadece semantik roller/nitelikler eklendi.
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(({ children, value, cardTabs = false }, ref) => {
  const { activeTab, setActiveTab, color } = useTabs();
  const active = activeTab === value;

  return (
    <Button
      ref={ref}
      variant="ghost"
      role="tab"
      id={`tab-${value}`}
      aria-selected={active}
      aria-controls={`tabpanel-${value}`}
      className={cn(getTabsTriggerClassNames(active, cardTabs, color))}
      data-value={value}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </Button>
  );
});

TabsTrigger.displayName = "TabsTrigger";
