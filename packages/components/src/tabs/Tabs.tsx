"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import type { TabsProps } from "./types";
import { TabsProvider } from "./useTabs";

export type { TabsProps };

/** Kapsayıcı genişliği — dikey Tabs'ın dar ekranda yataya dönmesi için. SSR'da `undefined`. */
function useContainerWidth(enabled: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled]);
  return [ref, width] as const;
}

/**
 * Compound API: `<Tabs><TabsList><TabsTrigger/></TabsList><TabsContent/></Tabs>`.
 *
 * Faz 13.6 — yapı ant.design Tabs'tan, görünüm kendi token'larımızdan:
 * `line` / `card` / `pills`, üç boyut, dikey yön (dar kapsayıcıda yataya
 * döner), `fill`, `align`, `keepMounted`, WAI-ARIA ok tuşu gezinmesi, taşan
 * sekmelerde yatay kaydırma. Bkz. `_components/TabsList.tsx`.
 */
export function Tabs({ className, children, orientation = "horizontal", responsive = 640, ...providerProps }: TabsProps) {
  const watch = orientation === "vertical" && responsive !== false;
  const [rootRef, width] = useContainerWidth(watch);
  const narrow = watch && width !== undefined && width < (responsive as number);
  const effective = narrow ? "horizontal" : orientation;
  const vertical = effective === "vertical";

  return (
    <TabsProvider {...providerProps} orientation={effective}>
      <div
        ref={rootRef}
        aria-busy={providerProps.skeleton || undefined}
        data-orientation={effective}
        className={cn("flex min-w-0", vertical ? "flex-row gap-6" : "flex-col", className)}
      >
        {children}
      </div>
    </TabsProvider>
  );
}
