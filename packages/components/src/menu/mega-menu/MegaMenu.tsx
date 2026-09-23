"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@mari-ui/core";
import { MegaPanel } from "../_shared";
import type { MenuColorProps, MenuItemJustify, MenuItemType, MenuNavigationProps, MenuPosition } from "../types";
import { getMenuItemJustify, getMenuPosition } from "../utils";
import { MegaMenuItem } from "./_components/MegaMenuItem";

export interface MegaMenuProps extends MenuNavigationProps, MenuColorProps {
  data: MenuItemType[];
  logo?: React.ReactNode;
  onLogoClick?: () => void;
  menuItemJustify?: MenuItemJustify;
  menuPosition?: MenuPosition;
  /** Sağ tarafta gösterilecek keyfi içerik (örn. "Giriş Yap" düğmesi, sepet ikonu, arama). */
  actions?: React.ReactNode;
}

/**
 * Faz 13.5 kullanıcı bulgusu: BasicMenu'deki aynı yapısal sorun — logo ve
 * öğeler tek bir flex satırında yan yanaydı, hiç `padding` yoktu, "logo sol
 * sabit + eylem alanı sağ sabit" gibi bir gerçek navbar düzeni kurulamıyordu.
 *
 * Alt panel tam genişlikte ve nav bar bandına (tek bir tetikleyici
 * dikdörtgenine değil) sabitlendiğinden `Dropdown` primitive'i (tek-çıpa
 * konumlama) kullanılmıyor — görünürlük/Escape burada, bespoke olarak
 * kalıyor; içerik (`MegaPanel`, `layout="full"`) BasicMenu/Sidebar'la
 * paylaşılıyor.
 */
/**
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

export function MegaMenu({ data, logo, onLogoClick, menuItemJustify = "center", menuPosition = "default", color = "primary", onNavigate, actions }: MegaMenuProps) {
  const [visible, setVisible] = useState(false);
  const [subItem, setSubItem] = useState<MenuItemType[] | undefined>();
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const [panelBox, setPanelBox] = useState<{ top: number; left: number; width: number } | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setVisible(false), HOVER_CLOSE_DELAY_MS);
  }, [cancelClose]);

  const openSubmenu = useCallback(
    (children: MenuItemType[] | undefined) => {
      cancelClose();
      setVisible(true);
      setSubItem(children && children.length > 0 ? children : undefined);
    },
    [cancelClose]
  );

  useEffect(() => cancelClose, [cancelClose]);

  // Kullanıcı bulgusu: `menuPosition="sticky"` (veya panelin `overflow`'lu bir
  // atası olduğu her durumda) panel KIRPILIYORDU — içerik yarıda kesiliyor,
  // kaydırma da mümkün olmuyordu. Çözüm `DropdownContent`teki ile aynı: panel
  // `document.body`'ye portal edilir ve navbar'ın gerçek kutusuna göre
  // `position: fixed` konumlanır; böylece hiçbir ata onu kırpamaz ve
  // `max-height` gerçek viewport'a göre hesaplanır. Konum her karede
  // tazelenir (sticky/scroll sırasında navbar yer değiştiriyor).
  useEffect(() => {
    if (!visible) return;
    let frameId: number;
    const update = () => {
      const nav = navRef.current;
      if (nav) {
        const rect = nav.getBoundingClientRect();
        setPanelBox((prev) =>
          prev && prev.top === rect.bottom && prev.left === rect.left && prev.width === rect.width
            ? prev
            : { top: rect.bottom, left: rect.left, width: rect.width }
        );
      }
      frameId = requestAnimationFrame(update);
    };
    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setVisible(false);
        setSubItem(undefined);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  return (
    <div className={cn("relative", getMenuPosition(menuPosition))}>
      <div ref={navRef} className="flex flex-row items-center justify-between gap-4 bg-mari-surface px-4 py-3 shadow-md">
        {logo ? (
          <button type="button" className="shrink-0 cursor-pointer" onClick={onLogoClick}>
            {logo}
          </button>
        ) : (
          <span />
        )}

        <div className={cn("flex flex-1 flex-row items-center", getMenuItemJustify(menuItemJustify))}>
          {data.map((menu) => (
            <MegaMenuItem key={menu.key} item={menu} visible={visible} subKey={subItem?.[0]?.key} onOpen={openSubmenu} onClose={scheduleClose} color={color} onNavigate={onNavigate} />
          ))}
        </div>

        {actions && <div className="flex shrink-0 flex-row items-center gap-3">{actions}</div>}
      </div>
      {subItem &&
        panelBox &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            onFocus={cancelClose}
            onBlur={scheduleClose}
            style={{
              top: panelBox.top,
              left: panelBox.left,
              width: panelBox.width,
              maxHeight: `calc(100vh - ${panelBox.top + VIEWPORT_EDGE_PX}px)`,
            }}
            className={cn(
              // `overscroll-contain`: panel kendi içinde sonuna geldiğinde
              // kaydırma arkadaki sayfaya ZİNCİRLENMEZ.
              "fixed z-mari-dropdown origin-top overflow-y-auto overscroll-contain border-t border-mari-border bg-mari-surface shadow-mari-lg transition-[opacity,transform] duration-200",
              visible ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
            )}
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-6">
              <MegaPanel items={subItem} layout="full" orientation="horizontal" color={color} onNavigate={onNavigate} onItemClick={() => setVisible(false)} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
