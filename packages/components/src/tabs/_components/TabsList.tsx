"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { TabsContext, useTabs } from "../useTabs";
import { getBarClass, getIndicatorClass, getListClass } from "../utils";
import type { TabsListProps } from "../types";

// SSR'da useLayoutEffect uyarı verir; tarayıcıda ölçümü boyamadan önce yap.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

const FADE = 24;

function getEnabledTabs(list: HTMLElement): HTMLButtonElement[] {
  return Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'));
}

function getActiveTab(list: HTMLElement): HTMLElement | null {
  return list.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
}

/** Ana eksen (offset/length) + çapraz eksen (pills zemini için). */
interface IndicatorRect {
  offset: number;
  length: number;
  crossOffset: number;
  cross: number;
}

function measureTab(tab: HTMLElement, vertical: boolean): IndicatorRect {
  if (vertical) return { offset: tab.offsetTop, length: tab.offsetHeight, crossOffset: tab.offsetLeft, cross: tab.offsetWidth };
  return { offset: tab.offsetLeft, length: tab.offsetWidth, crossOffset: tab.offsetTop, cross: tab.offsetHeight };
}

function getIndicatorStyle(rect: IndicatorRect | null, vertical: boolean, pills: boolean): React.CSSProperties | undefined {
  if (!rect) return undefined;
  const main = vertical ? { top: rect.offset, height: rect.length } : { left: rect.offset, width: rect.length };
  if (!pills) return main;
  const cross = vertical ? { left: rect.crossOffset, width: rect.cross } : { top: rect.crossOffset, height: rect.cross };
  return { ...main, ...cross };
}

/** Kaydırılabilir yönlerde kenarı soldurur. */
function getMaskImage(fade: { start: boolean; end: boolean }): string | undefined {
  if (!fade.start && !fade.end) return undefined;
  const from = fade.start ? "transparent" : "#000";
  const to = fade.end ? "transparent" : "#000";
  return `linear-gradient(to right, ${from}, #000 ${FADE}px, #000 calc(100% - ${FADE}px), ${to})`;
}

/** Şeridi (sayfayı değil) aktif sekme görünecek kadar kaydırır. */
function scrollIntoStrip(scroller: HTMLElement, tab: HTMLElement) {
  const start = tab.offsetLeft - FADE;
  const end = tab.offsetLeft + tab.offsetWidth + FADE;
  if (start < scroller.scrollLeft) scroller.scrollLeft = start;
  else if (end > scroller.scrollLeft + scroller.clientWidth) scroller.scrollLeft = end - scroller.clientWidth;
}

const navKeys = {
  horizontal: { prev: "ArrowLeft", next: "ArrowRight" },
  vertical: { prev: "ArrowUp", next: "ArrowDown" },
} as const;

/** Klavye tuşuna göre odaklanacak sekme (döngüsel). */
function getKeyTarget(key: string, tabs: HTMLButtonElement[], index: number, vertical: boolean): HTMLButtonElement | undefined {
  const keys = navKeys[vertical ? "vertical" : "horizontal"];
  switch (key) {
    case keys.prev:
      return tabs[(index - 1 + tabs.length) % tabs.length];
    case keys.next:
      return tabs[(index + 1) % tabs.length];
    case "Home":
      return tabs[0];
    case "End":
      return tabs[tabs.length - 1];
    default:
      return undefined;
  }
}

/**
 * Eski sürümdeki sorunlar (Faz 13.6'da giderildi):
 * - Gösterge sadece `activeTab` değişince ölçülüyordu — pencere/yazı tipi
 *   yüklenince yanlış yerde kalıyordu. Artık ResizeObserver ile.
 * - Taşan sekmeler sayfayı yatayda taşırıyordu (mobilde son sekme kartın
 *   dışına çıkıyordu). Artık kaydırılabilir şerit + kenar solması, aktif
 *   sekme görünür alana kaydırılıyor.
 * - Ok tuşu gezinmesi yoktu; her sekme ayrı bir Tab durağıydı. Artık
 *   WAI-ARIA Tabs deseni: roving tabindex, ←/→ (dikeyde ↑/↓), Home/End.
 * - `cloneElement` + ref dizisi ile sekme bulunuyordu (sarmalanmış bir
 *   TabsTrigger'ı kaçırıyordu). Artık DOM'dan `[aria-selected=true]`.
 */
export function TabsList({ children, extra, className, cardTabs, "aria-label": ariaLabel }: TabsListProps) {
  const context = useTabs();
  // Eski `cardTabs` prop'u: bu listenin altındaki sekmeler için varyantı
  // `card`'a çevirir (geriye uyumluluk).
  const ctx = useMemo(() => (cardTabs ? { ...context, variant: "card" as const } : context), [context, cardTabs]);
  const { activeTab, setActiveTab, isControlled, variant, orientation, size, fill, align, color, activationMode, skeleton } = ctx;
  const vertical = orientation === "vertical";

  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<IndicatorRect | null>(null);
  const [animate, setAnimate] = useState(false);
  const [fade, setFade] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const list = listRef.current;
    const scroller = scrollerRef.current;
    if (!list || !scroller) return;

    const active = getActiveTab(list);
    setIndicator(active ? measureTab(active, vertical) : null);

    if (!vertical) {
      const { scrollLeft, scrollWidth, clientWidth } = scroller;
      setFade({ start: scrollLeft > 1, end: scrollLeft + clientWidth < scrollWidth - 1 });
    }
  }, [vertical]);

  // Aktif sekme değişince: ölç + görünür alana kaydır (sayfayı değil, sadece şeridi).
  useIsomorphicLayoutEffect(() => {
    measure();
    const active = listRef.current && getActiveTab(listRef.current);
    if (!vertical && scrollerRef.current && active) scrollIntoStrip(scrollerRef.current, active);
  }, [activeTab, measure, variant, size, children]);

  // Yön/varyant değişince (ör. dikey Tabs dar ekranda yataya döndü) geçişi
  // kapat: gösterge dikey çubuktan yatay çizgiye 300ms boyunca MORFLANIYOR,
  // ekranda bir leke gibi görünüyordu. Yeni yerine anında otursun.
  const layoutKey = `${orientation}:${variant}`;
  const prevLayoutKey = useRef(layoutKey);
  useIsomorphicLayoutEffect(() => {
    if (prevLayoutKey.current !== layoutKey) {
      prevLayoutKey.current = layoutKey;
      setAnimate(false);
    }
  }, [layoutKey]);

  // İlk ölçümden SONRA geçişi aç — gösterge 0'dan kayarak gelmesin.
  useEffect(() => {
    if (indicator && !animate) {
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }
  }, [indicator, animate]);

  // Kapsayıcı/sekme boyutu değişince (pencere, yazı tipi yüklemesi) yeniden ölç.
  useEffect(() => {
    const list = listRef.current;
    const scroller = scrollerRef.current;
    if (!list || !scroller || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(list);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [measure]);

  // Uncontrolled ve hiçbir sekme aktif değilse (ör. defaultActiveTab
  // verilmemiş) ilk etkin sekmeyi seç — ant.design ile aynı. Controlled
  // modda tüketicinin değerine dokunmuyoruz.
  useIsomorphicLayoutEffect(() => {
    const list = listRef.current;
    if (!list || isControlled || getActiveTab(list)) return;
    const first = getEnabledTabs(list)[0];
    if (first?.dataset.value) setActiveTab(first.dataset.value);
  }, [activeTab, isControlled]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const list = listRef.current;
    if (!list) return;
    const tabs = getEnabledTabs(list);
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index === -1) return;

    const target = getKeyTarget(event.key, tabs, index, vertical);
    if (!target) return;

    event.preventDefault();
    target.focus();
    if (activationMode === "automatic" && target.dataset.value) setActiveTab(target.dataset.value);
  };

  const maskImage = getMaskImage(fade);
  const indicatorStyle = getIndicatorStyle(indicator, vertical, variant === "pills");

  return (
    <TabsContext.Provider value={ctx}>
      <div aria-hidden={skeleton || undefined} className={cn("flex min-w-0", vertical ? "shrink-0 flex-col" : "items-end", getBarClass(variant, orientation), className)}>
        <div
          ref={scrollerRef}
          onScroll={measure}
          className={cn(
            "flex min-w-0",
            vertical ? "flex-col" : "flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            variant === "pills" && !vertical && "py-0.5"
          )}
          style={maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined}
        >
          {/* Odak tablist'te değil, içindeki role="tab" düğmelerinde (roving
              tabindex); ok tuşu olayları buraya kabarcıklanır. */}
          {/* eslint-disable-next-line jsx-a11y/interactive-supports-focus */}
          <div
            ref={listRef}
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation={orientation}
            onKeyDown={handleKeyDown}
            className={cn(getListClass(variant, orientation, size, fill), align === "center" && !vertical && "mx-auto")}
          >
            {children}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute",
                getIndicatorClass(variant, orientation, color),
                animate && "transition-[left,top,width,height] duration-300 ease-out motion-reduce:transition-none",
                // İskelette aktif sekme henüz anlamlı değil — gösterge gizli.
                (!indicator || skeleton) && "opacity-0"
              )}
              style={indicatorStyle}
            />
          </div>
        </div>
        {extra && <div className={cn("shrink-0", vertical ? "mt-4" : "ml-4 self-center")}>{extra}</div>}
      </div>
    </TabsContext.Provider>
  );
}
