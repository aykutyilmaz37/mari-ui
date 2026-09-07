"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { useTabs } from "../useTabs";
import { calculateUnderlinePosition, cloneWithRef, getUnderlineClass } from "../utils";
import { TabsTrigger } from "./TabsTrigger";
import type { TabsListProps, TabsTriggerProps } from "../types";

export function TabsList({ children, cardTabs = false }: TabsListProps) {
  const { activeTab, color } = useTabs();
  const containerRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState({ width: 0, left: 0 });
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useLayoutEffect(() => {
    const childArray = React.Children.toArray(children);
    const idx = childArray.findIndex(
      (child): child is React.ReactElement<TabsTriggerProps> =>
        React.isValidElement<TabsTriggerProps>(child) && child.type === TabsTrigger && child.props.value === activeTab
    );
    const button = triggerRefs.current[idx];
    if (button && containerRef.current) {
      setUnderline(calculateUnderlinePosition(button, containerRef.current));
    } else {
      setUnderline({ width: 0, left: 0 });
    }
  }, [activeTab, children]);

  return (
    <div ref={containerRef} className="w-full flex gap-1 items-center justify-start relative">
      {React.Children.map(children, (child, idx) => {
        if (React.isValidElement<TabsTriggerProps>(child) && child.type === TabsTrigger) {
          return cloneWithRef(child, (el: HTMLButtonElement | null): void => {
            triggerRefs.current[idx] = el;
          });
        }
        return child;
      })}
      {/* Aktif tab göstergesi — lokal bir vurgu, sayfa genelindeki overlay
          katmanlarından (dropdown/modal/toast) bağımsız olduğu için `z-10`
          yeterli; `z-mari-*` namespace'i global katmanlar içindir. */}
      <div className={cn("absolute bottom-0 h-[1px] z-10 transition-all duration-300", getUnderlineClass(cardTabs, color))} style={{ width: `${underline.width}px`, left: `${underline.left}px` }} />
      <div className="absolute bottom-0 w-full h-[1px] bg-mari-border transition-all duration-300" />
    </div>
  );
}
