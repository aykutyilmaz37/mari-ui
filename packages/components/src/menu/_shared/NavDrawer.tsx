"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass, textSolidContrastClass } from "../../lib/colorClasses";
import { useModalBehavior, usePresence } from "../../lib/overlay";
import type { MenuItemType, MenuNavigationProps } from "../types";
import { findActiveKeyByRoute, navigateTo } from "../utils";
import { MegaPanelPromoGrid } from "./_components/MegaPanelPromoGrid";
import { MobileNavLevel } from "./_components/MobileNavLevel";

/** Kapanış animasyonu bitene kadar çekmece DOM'da kalır. */
const CLOSE_ANIMATION_MS = 250;

export interface NavDrawerProps extends MenuNavigationProps {
  /** Dialog'un `id`si — tetikleyicinin `aria-controls`u için. Verilmezse üretilir. */
  id?: string;
  open: boolean;
  onClose: () => void;
  data: MenuItemType[];
  color: ColorRole;
  /** Çekmecenin başlık şeridi (logo ya da Amazon tarzı "Merhaba, …" bloğu). Kapatma düğmesi her zaman yanında. */
  header?: React.ReactNode;
  /** Başlık şeridini rol renginin dolgusuyla vurgular (Amazon'daki koyu karşılama bandının yapısı). */
  emphasizedHeader?: boolean;
  /** Çekmecenin açıldığı kenar. Varsayılan `"left"`. */
  side?: "left" | "right";
  /** Host kendi aktif öğesini tutuyorsa onu geçer; verilmezse `currentPath`ten bulunur. */
  activeKey?: string | null;
  /** Yaprak öğe seçildiğinde (`navigateTo`dan önce). */
  onItemSelect?: (item: MenuItemType) => void;
  /** Çekmecenin (dialog) erişilebilir adı. */
  label?: string;
  /** Portal sarmalayıcısına eklenecek sınıf — örn. mobil navbar'ın `lg:hidden`ı. */
  className?: string;
}

/**
 * Kenardan kayan, kademeli (drill-down) gezinme çekmecesi. İki yerde
 * kullanılıyor: navbar'ların mobil hâli (`MobileNav`) ve Sidebar'ın
 * `variant="drawer"`ı (Amazon'un hamburger menüsünün yapısı).
 *
 * - `document.body`'ye portal edilir (sticky/overflow'lu atalar kırpamasın),
 *   `role="dialog"` + `aria-modal`.
 * - Açıkken: sayfa kaydırması kilitlenir, odak çekmeceye taşınır ve içinde
 *   döner (Tab tuzağı), Escape/scrim kapatır, kapanınca odak açılıştan önce
 *   odaklı olan öğeye (genelde tetikleyici) geri döner.
 * - Seviye değişince odak: içeri girildiyse "geri" düğmesine, geri
 *   çıkıldıysa girilen satıra — klavye kullanıcısı yerini kaybetmez.
 */
export function NavDrawer({
  id,
  open,
  onClose,
  data,
  color,
  header,
  emphasizedHeader = false,
  side = "left",
  activeKey,
  onItemSelect,
  onNavigate,
  currentPath,
  label = "Ana menü",
  className,
}: NavDrawerProps) {
  const [trail, setTrail] = useState<MenuItemType[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  // Portal/kaydırma kilidi/odak tuzağı/Escape — Drawer ile ortak (lib/overlay).
  const mounted = usePresence(open, CLOSE_ANIMATION_MS);
  useModalBehavior(open, panelRef, onClose);
  /** Bir seviye geri dönüldüğünde odağın döneceği satırın anahtarı. */
  const returnKeyRef = useRef<string | null>(null);
  const generatedId = useId();
  const panelId = id ?? generatedId;

  const resolvedActiveKey = activeKey !== undefined ? activeKey : findActiveKeyByRoute(data, currentPath);

  // Kapanış animasyonu bitip unmount olunca kök seviyeye dön.
  useEffect(() => {
    if (!mounted) setTrail([]);
  }, [mounted]);

  useEffect(() => {
    if (!open) return;
    const returnKey = returnKeyRef.current;
    if (returnKey) {
      returnKeyRef.current = null;
      const rows = panelRef.current?.querySelectorAll<HTMLElement>("[data-menu-key]") ?? [];
      Array.from(rows)
        .find((row) => row.dataset.menuKey === returnKey)
        ?.focus();
    } else if (trail.length > 0) {
      backRef.current?.focus();
    }
    panelRef.current?.querySelector("[data-nav-drawer-body]")?.scrollTo?.({ top: 0 });
  }, [trail, open]);

  const handleSelect = (item: MenuItemType) => {
    onItemSelect?.(item);
    onClose();
    navigateTo(item.route, onNavigate);
  };

  const handleBack = () => {
    returnKeyRef.current = trail[trail.length - 1]?.key ?? null;
    setTrail((prev) => prev.slice(0, -1));
  };

  if (!mounted || typeof document === "undefined") return null;

  const parent = trail[trail.length - 1];
  const items = parent ? (parent.children ?? []) : data;
  const isLeft = side === "left";
  const hiddenTranslate = isLeft ? "-translate-x-full" : "translate-x-full";

  return createPortal(
    <div className={cn("fixed inset-0 z-mari-drawer", className, !open && "pointer-events-none")}>
      <div aria-hidden="true" onClick={onClose} className={cn("absolute inset-0 bg-mari-scrim transition-opacity duration-250 starting:opacity-0", open ? "opacity-100" : "opacity-0")} />
      <div
        ref={panelRef}
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "absolute inset-y-0 flex w-[min(22rem,85vw)] flex-col border-mari-border bg-mari-surface text-mari-foreground shadow-mari-lg transition-transform duration-250 ease-out",
          isLeft ? "left-0 border-r starting:-translate-x-full" : "right-0 border-l starting:translate-x-full",
          open ? "translate-x-0" : hiddenTranslate
        )}
      >
        <div
          className={cn(
            "flex min-h-14 shrink-0 items-center justify-between gap-3 px-4",
            emphasizedHeader ? cn(bgSolidClass[color], textSolidContrastClass[color]) : "border-b border-mari-border"
          )}
        >
          <div className="min-w-0 flex-1 truncate">{header}</div>
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={onClose}
            className={cn(
              "-mr-2 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
              emphasizedHeader ? "hover:bg-current/15" : "text-mari-muted hover:bg-mari-surface-alt hover:text-mari-foreground"
            )}
          >
            <XIcon aria-hidden="true" size={20} />
          </button>
        </div>

        <div data-nav-drawer-body className="flex-1 overflow-y-auto overscroll-contain">
          <MobileNavLevel
            key={parent?.key ?? "root"}
            items={items}
            trail={trail}
            activeKey={resolvedActiveKey}
            color={color}
            backRef={backRef}
            onDrill={(item) => setTrail((prev) => [...prev, item])}
            onBack={handleBack}
            onSelect={handleSelect}
          />
          {parent?.promoTiles && parent.promoTiles.length > 0 && (
            <MegaPanelPromoGrid tiles={parent.promoTiles} onNavigate={onNavigate} onTileClick={onClose} className="w-full px-4 pb-6" />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
