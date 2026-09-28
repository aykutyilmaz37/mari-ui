"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { NavDrawer } from "../_shared/NavDrawer";
import { useHoverIntent } from "../_shared/useHoverIntent";
import type { MenuColorProps, MenuItemType, MenuNavigationProps, SidebarPosition, SidebarVariant } from "../types";
import { findActiveKeyByRoute, getSidebarWidthClass, navigateTo } from "../utils";
import { SidebarButton } from "./_components/SidebarButton";
import { SidebarMegaPanel } from "./_components/SidebarMegaPanel";
import { SidebarMenu } from "./_components/SidebarMenu";
import type { SidebarSubMode } from "./_components/SidebarItem";

export interface SidebarProps extends MenuNavigationProps, MenuColorProps {
  data: MenuItemType[];
  /**
   * - `"hover"`: 64px ikon rayı, üzerine gelince (veya klavyeyle odaklanınca) 256px'e genişler.
   * - `"click"`: kenardaki sekmeyle açılıp kapanır.
   * - `"drawer"`: Amazon'un hamburger menüsü gibi kenardan kayan, kademeli (drill-down)
   *   bir çekmece — `open`/`onOpenChange` ile kontrol edilir, tetikleyiciyi tüketici koyar.
   */
  variant?: SidebarVariant;
  position?: SidebarPosition;
  /** Sidebar her zaman ikon rayı olarak kalır; alt menüler rayın yanında açılır (dropdown). */
  onlyIcon?: boolean;
  /** Alt öğeler akordeon yerine satırın yanında açılan bir panelde (BasicMenu'nün alt menü paneli). */
  dropdown?: boolean;
  /** Alt öğeler sidebar'ın yanında tam yükseklikte bir mega panelde. */
  mega?: boolean;
  /** Eskiden varsayılan değeri hardcoded `/images/fb.png` idi — bir
   * kütüphanenin varsayılanı olarak marka varlığı barındırmak yanlıştı
   * (bkz. plan denetimi). Artık verilmezse hiç logo render edilmez. */
  logo?: React.ReactNode;
  onLogoClick?: () => void;
  /**
   * Menünün üstünde render edilen keyfi içerik. `variant="drawer"`da Amazon'daki
   * "Merhaba, {isim}" bandı olur (rol renginin dolgusuyla). Sidebar tüketicinin
   * auth/kullanıcı durumundan habersiz kalır; tüketici kendi `Avatar`ını + metnini geçer.
   */
  header?: React.ReactNode;
  /** `variant="drawer"`: çekmece açık mı. */
  open?: boolean;
  /** `variant="drawer"`: kapatma isteği (Escape, scrim, kapatma düğmesi, öğe seçimi). */
  onOpenChange?: (open: boolean) => void;
  /** Gezinme bölgesinin erişilebilir adı. Varsayılan: "Ana menü". */
  label?: string;
}

const RAIL_OPEN_DELAY_MS = 80;
const RAIL_CLOSE_DELAY_MS = 250;
const MEGA_CLOSE_DELAY_MS = 200;

/**
 * Dikey gezinme menüsü.
 *
 * Kullanıcı bulguları (2026-09-25) ve karşılıkları:
 * - Daraltılmış rayda etiketler yarım harf olarak kesiliyordu → etiketler
 *   soluyor, ikonlar 64px rayda ortalı; ikonu olmayan öğe baş harfiyle.
 * - Hover genişlemesi fare üzerinden geçer geçmez tetikleniyor ve 500ms
 *   sürüyordu → kısa bir açılma gecikmesi + gecikmeli kapanma (hover-intent),
 *   200ms geçiş; klavye odağı da rayı genişletiyor (eskiden Tab'la gezen
 *   kullanıcı kesik bir ray görüyordu).
 * - `dropdown` paneli hover edilen satıra hizalı değildi → satırın kendisi
 *   tetikleyici. `mega` 2 seviyeli veride anlamsız bir "chip" şeridi
 *   gösteriyordu → düz veride açıklamalı satırlar, 3 seviyede ray + kolonlar.
 * - Amazon örneği → `variant="drawer"` (bkz. `NavDrawer`).
 */
export function Sidebar({
  data,
  variant = "hover",
  position = "left",
  onlyIcon = false,
  dropdown = false,
  mega = false,
  logo,
  onLogoClick,
  header,
  open = false,
  onOpenChange,
  label = "Ana menü",
  color = "primary",
  onNavigate,
  currentPath,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [megaKey, setMegaKey] = useState<string | null>(null);
  const megaPanelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const railIntent = useHoverIntent();
  const megaIntent = useHoverIntent();
  const asideId = useId();

  useEffect(() => {
    setActiveKey(findActiveKeyByRoute(data, currentPath));
  }, [data, currentPath]);

  const railCapable = variant === "hover" && !onlyIcon;
  const collapsed = onlyIcon || (railCapable && !expanded);
  let subMode: SidebarSubMode = "accordion";
  if (mega) subMode = "mega";
  else if (dropdown || onlyIcon) subMode = "dropdown";

  const openMega = useCallback(
    (item: MenuItemType) => {
      megaIntent.cancel();
      setMegaKey(item.key);
    },
    [megaIntent]
  );
  const closeMega = useCallback(() => megaIntent.schedule(() => setMegaKey(null), MEGA_CLOSE_DELAY_MS), [megaIntent]);

  const megaItem = megaKey ? data.find((item) => item.key === megaKey) : undefined;

  // Mega satırında klavyeyle Enter/Boşluk: panel (odakla zaten açılmıştı) render olunca odak ilk öğesine geçer.
  const [megaFocusRequest, setMegaFocusRequest] = useState(0);
  useEffect(() => {
    if (megaFocusRequest === 0) return;
    megaPanelRef.current?.querySelector<HTMLElement>("button:not([disabled]), a[href]")?.focus();
  }, [megaFocusRequest]);

  // Mega panel açıkken Escape kapatır; odak paneldeyse kendi kök satırına döner.
  useEffect(() => {
    if (!megaKey) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const focusInPanel = !!megaPanelRef.current?.contains(document.activeElement);
      setMegaKey(null);
      if (focusInPanel) {
        const rows = wrapperRef.current?.querySelectorAll<HTMLElement>("[data-sidebar-key]") ?? [];
        Array.from(rows)
          .find((row) => row.dataset.sidebarKey === megaKey)
          ?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [megaKey]);

  const handleSelect = (item: MenuItemType) => {
    setActiveKey(item.key);
    setMegaKey(null);
    navigateTo(item.route, onNavigate);
  };

  if (variant === "drawer") {
    return (
      <NavDrawer
        open={open}
        onClose={() => onOpenChange?.(false)}
        data={data}
        color={color}
        header={header ?? logo}
        emphasizedHeader={!!header}
        side={position}
        activeKey={activeKey}
        onItemSelect={(item) => setActiveKey(item.key)}
        onNavigate={onNavigate}
        currentPath={currentPath}
        label={label}
      />
    );
  }

  const collapseAll = () => {
    setExpanded(false);
    setMegaKey(null);
  };

  const wrapperHandlers = {
    onMouseEnter: () => {
      if (railCapable) railIntent.schedule(() => setExpanded(true), RAIL_OPEN_DELAY_MS);
    },
    onMouseLeave: () => {
      if (railCapable) railIntent.schedule(collapseAll, RAIL_CLOSE_DELAY_MS);
      else closeMega();
    },
    onFocus: () => {
      if (!railCapable) return;
      railIntent.cancel();
      setExpanded(true);
    },
    onBlur: (event: React.FocusEvent<HTMLDivElement>) => {
      // Odak portal'daki bir panele geçtiyse React'in `onFocus`u (fiber ağacında
      // kabarcıklanır) bu zamanlayıcıyı hemen iptal eder.
      if (railCapable && !event.currentTarget.contains(event.relatedTarget as Node | null)) railIntent.schedule(collapseAll, RAIL_CLOSE_DELAY_MS);
    },
  };

  return (
    <div
      ref={wrapperRef}
      {...wrapperHandlers}
      className={cn("fixed top-0 z-mari-drawer flex h-full", position === "right" ? "right-0 flex-row-reverse" : "left-0")}
    >
      <aside
        id={asideId}
        className={cn(
          "flex h-full shrink-0 flex-col overflow-hidden border-mari-border bg-mari-surface transition-[width,box-shadow] duration-200 ease-out",
          position === "right" ? "border-l" : "border-r",
          getSidebarWidthClass(variant, expanded, onlyIcon)
        )}
      >
        {header && <div className="shrink-0 overflow-hidden border-b border-mari-border px-2 py-2 whitespace-nowrap">{header}</div>}
        {logo && (
          <div className="flex h-14 shrink-0 items-center overflow-hidden border-b border-mari-border px-4">
            <button type="button" className="flex shrink-0 cursor-pointer items-center" onClick={onLogoClick}>
              {logo}
            </button>
          </div>
        )}
        <nav aria-label={label} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          <SidebarMenu
            data={data}
            level={0}
            activeKey={activeKey}
            onSelect={handleSelect}
            setActiveKey={setActiveKey}
            color={color}
            subMode={subMode}
            collapsed={collapsed}
            showMonogram={railCapable || onlyIcon}
            tabbable
            position={position}
            megaKey={megaKey}
            onMegaOpen={(item, fromKeyboard) => {
              openMega(item);
              if (fromKeyboard) setMegaFocusRequest((count) => count + 1);
            }}
            onMegaClose={closeMega}
            onNavigate={onNavigate}
            currentPath={currentPath}
          />
        </nav>
      </aside>

      {megaItem?.children && (
        <SidebarMegaPanel
          ref={megaPanelRef}
          item={megaItem}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          color={color}
          position={position}
          onClose={() => setMegaKey(null)}
          onMouseEnter={megaIntent.cancel}
          onMouseLeave={closeMega}
          onNavigate={onNavigate}
          currentPath={currentPath}
        />
      )}

      {variant === "click" && !onlyIcon && <SidebarButton visible={expanded} setVisible={setExpanded} position={position} controlsId={asideId} />}
    </div>
  );
}
