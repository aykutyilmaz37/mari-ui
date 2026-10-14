"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@mari-ui/core";
import { MegaPanel } from "../_shared";
import type { MenuColorProps, MenuItemType } from "../types";
import { findActiveKeyByRoute } from "../utils";
import { NavBar, type NavBarBaseProps } from "../_shared/NavBar";
import { getFocusable, getRovingTarget } from "../../dropdown/utils";
import { MegaMenuItem } from "./_components/MegaMenuItem";

export type MegaMenuProps = NavBarBaseProps & MenuColorProps;

/*
 * Kullanıcı bulgusu: nav öğesinden panele inerken menü kapanıyordu. Öğenin
 * `onMouseLeave`i ANINDA kapatıyordu; navbar'ın `py-3` boşluğu ne öğeye ne
 * panele ait olduğundan fare oradan geçerken menü kapanıyor, kapanan panel
 * `pointer-events-none` olduğu için de fareyi bir daha HİÇ göremiyordu —
 * yani menüye ulaşmak imkânsızdı. `Dropdown`daki hover-intent deseninin
 * aynısı: kapatma gecikmeli planlanır, fare panele (veya başka bir üst
 * öğeye) varırsa iptal edilir.
 */
const HOVER_CLOSE_DELAY_MS = 200;
/** Panelin viewport'un alt kenarına yapışmaması için bırakılan pay. */
const VIEWPORT_EDGE_PX = 8;

/**
 * Odak paneldeyken: ↑/↓/Home/End/harf gezinmesi; panelin sonundan Tab
 * tetikleyiciden SONRAKİ üst öğeye (panel DOM'da body'nin sonunda), başından
 * Shift+Tab tetikleyiciye geçer ve paneli kapatır.
 */
function handlePanelKey(event: KeyboardEvent, panel: HTMLElement, bar: HTMLElement | null, trigger: HTMLElement | null, close: () => void) {
  const active = document.activeElement;
  const typing = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;
  const focusable = getFocusable(panel);
  if (!typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    const target = getRovingTarget(focusable, active, event.key);
    if (target) {
      event.preventDefault();
      target.focus();
      return;
    }
  }
  if (event.key !== "Tab") return;
  const leavingForward = !event.shiftKey && active === (focusable.at(-1) ?? null);
  const leavingBackward = event.shiftKey && active === (focusable[0] ?? null);
  if (!leavingForward && !leavingBackward) return;
  event.preventDefault();
  close();
  if (leavingBackward || !trigger) {
    trigger?.focus();
    return;
  }
  const barFocusable = getFocusable(bar);
  (barFocusable[barFocusable.indexOf(trigger) + 1] ?? trigger).focus();
}

/*
 * Faz 15.5 klavye modeli (APG disclosure navigation): çocuklu öğe
 * Enter/Boşluk/↓ ile açılır ve odak panelin ilk öğesine taşınır; panelde
 * ↑/↓/Home/End/harf gezinir, Escape kapatıp odağı tetikleyiciye döndürür,
 * panelin sonundan Tab bir sonraki üst öğeye, başından Shift+Tab
 * tetikleyiciye geçer. Odak menü dışına çıkınca / dışarı tıklanınca kapanır.
 * Kapalı panel `invisible` → içindeki linkler Tab sırasına girmez.
 * `currentPath`: üst öğe alt çizgisi + ray ön seçimi + link `aria-current`.
 */
/**
 * Alt panel tam genişlikte ve nav bar bandına (tek bir tetikleyici
 * dikdörtgenine değil) sabitlendiğinden `Dropdown` primitive'i kullanılmıyor;
 * çubuk kabuğu (logo, `<nav>`, `actions`, mobil çekmece, iskelet) BasicMenu
 * ile ortak `NavBar`da, panel içeriği (`MegaPanel`) Sidebar ile ortak.
 */
export function MegaMenu({ data, color = "primary", currentPath, onNavigate, menuItemJustify = "center", ...barProps }: MegaMenuProps) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  // Kapanış animasyonu sürerken içerik boşalmasın diye son açılan öğe tutulur.
  const [shownKey, setShownKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [panelBox, setPanelBox] = useState<{ top: number; left: number; width: number } | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const focusPanelOnOpenRef = useRef(false);
  const panelId = useId();
  const visible = openKey !== null;
  const shownItem = data.find((item) => item.key === shownKey);

  useEffect(() => {
    setActiveKey(findActiveKeyByRoute(data, currentPath));
  }, [data, currentPath]);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const close = useCallback(() => {
    cancelClose();
    setOpenKey(null);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => {
      // Klavye odağı paneldeyken fare çekilse bile panel kapanmaz.
      if (panelRef.current?.contains(document.activeElement)) return;
      setOpenKey(null);
    }, HOVER_CLOSE_DELAY_MS);
  }, [cancelClose]);

  const open = useCallback(
    (key: string) => {
      cancelClose();
      setOpenKey(key);
      setShownKey(key);
    },
    [cancelClose]
  );

  const triggerFor = (key: string | null) => (key ? barRef.current?.querySelector<HTMLElement>(`[data-mega-key="${CSS.escape(key)}"]`) : null);

  useEffect(() => cancelClose, [cancelClose]);

  // Kullanıcı bulgusu: `menuPosition="sticky"` (veya panelin `overflow`'lu bir
  // atası olduğu her durumda) panel KIRPILIYORDU. Çözüm `DropdownContent`teki
  // ile aynı: panel `document.body`'ye portal edilir ve navbar'ın gerçek
  // kutusuna göre `position: fixed` konumlanır; konum her karede tazelenir.
  useEffect(() => {
    if (!visible) return;
    let frameId: number;
    const update = () => {
      const bar = barRef.current;
      if (bar) {
        const rect = bar.getBoundingClientRect();
        setPanelBox((prev) =>
          prev && prev.top === rect.bottom && prev.left === rect.left && prev.width === rect.width ? prev : { top: rect.bottom, left: rect.left, width: rect.width }
        );
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [visible]);

  // Klavyeyle açıldıysa panel görünür olunca odak ilk öğeye.
  useEffect(() => {
    if (!visible || !panelBox || !focusPanelOnOpenRef.current) return;
    focusPanelOnOpenRef.current = false;
    // Seçili ray öğesine (aktif sayfanın kategorisi) — ilk öğeye odaklanmak rayı ona çevirip ön seçimi ezerdi.
    const panel = panelRef.current;
    (panel?.querySelector<HTMLElement>("[data-selected]") ?? getFocusable(panel)[0])?.focus();
  }, [visible, panelBox, openKey]);

  useEffect(() => {
    if (!visible) return;
    const inMenu = (node: Node | null) => !!node && (!!barRef.current?.contains(node) || !!panelRef.current?.contains(node));

    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      const trigger = triggerFor(openKey);
      const focusInPanel = !!panel && panel.contains(document.activeElement);

      if (event.key === "Escape") {
        close();
        if (focusInPanel || document.activeElement === (trigger ?? null)) trigger?.focus();
        return;
      }
      if (!focusInPanel || !panel) return;

      handlePanelKey(event, panel, barRef.current, trigger ?? null, close);
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!inMenu(event.target as Node)) close();
    };
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerFor(openKey)?.contains(target)) return;
      close();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [visible, openKey, close]);

  return (
    <NavBar
      {...barProps}
      data={data}
      color={color}
      currentPath={currentPath}
      onNavigate={onNavigate}
      menuItemJustify={menuItemJustify}
      activeKey={activeKey}
      onItemSelect={(item) => setActiveKey(item.key)}
      barRef={barRef}
      renderItem={(item: MenuItemType) => (
        <MegaMenuItem
          item={item}
          open={openKey === item.key}
          activeKey={activeKey}
          panelId={panelId}
          color={color}
          onNavigate={onNavigate}
          onHover={() => (item.children?.length ? open(item.key) : close())}
          onLeave={scheduleClose}
          onToggle={(source) => {
            const isOpen = openKey === item.key;
            if (isOpen && (source === "key" || source === "touch")) {
              close();
              return;
            }
            focusPanelOnOpenRef.current = source === "key" || source === "arrow";
            open(item.key);
          }}
        />
      )}
    >
      {shownItem?.children &&
        panelBox &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            aria-label={shownItem.title}
            role="region"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              top: panelBox.top,
              left: panelBox.left,
              width: panelBox.width,
              maxHeight: `calc(100vh - ${panelBox.top + VIEWPORT_EDGE_PX}px)`,
            }}
            className={cn(
              // `overscroll-contain`: panel kendi içinde sonuna geldiğinde kaydırma arkadaki sayfaya ZİNCİRLENMEZ.
              // Kapalıyken `invisible` (geçişin sonunda): linkler Tab sırasına ve ekran okuyucuya girmez.
              "fixed z-mari-dropdown origin-top overflow-y-auto overscroll-contain border-b border-mari-border bg-mari-surface shadow-mari-lg transition-[opacity,translate,visibility] duration-200",
              visible ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-1 opacity-0"
            )}
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
              <MegaPanel
                key={shownItem.key}
                items={shownItem.children}
                layout="full"
                orientation="horizontal"
                color={color}
                onNavigate={onNavigate}
                activeKey={activeKey}
                onItemClick={(item) => {
                  setActiveKey(item.key);
                  close();
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </NavBar>
  );
}
