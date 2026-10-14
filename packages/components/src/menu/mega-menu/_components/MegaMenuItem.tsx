"use client";

import React, { useRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { getItemClass, isMenuItemActive } from "../../utils";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { MenuLink } from "../../_shared/MenuLink";
import { touchTargetClass } from "../../../lib/sizeClasses";
import { NewTabHint } from "../../../lib/linkBehavior";

export type MegaToggleSource = "key" | "arrow" | "mouse" | "touch";

export interface MegaMenuItemProps extends MenuNavigationProps {
  item: MenuItemType;
  /** Bu öğenin paneli şu an açık mı. */
  open: boolean;
  /** Geçerli sayfanın öğe anahtarı (alt çizgi + `aria-current`). */
  activeKey: string | null;
  panelId: string;
  /** Fare ile üzerine gelince (hover-intent) — paneli açar ya da (çocuksuz öğede) kapatır. */
  onHover: () => void;
  /** Fare ayrılınca / odak çıkınca — kapatma GECİKMELİ planlanır. */
  onLeave: () => void;
  /**
   * Tetikleyici etkinleşti. `"key"` (Enter/Boşluk) aç-kapat + odak panele;
   * `"arrow"` (↓) her zaman açar + odak panele; `"mouse"` açık tutar (hover
   * zaten açtı — toggle etse menü gözün önünde kapanırdı); `"touch"` aç-kapat.
   */
  onToggle: (source: MegaToggleSource) => void;
  color: ColorRole;
  className?: string;
}

/**
 * Faz 15.5: çocuklu öğe bir açma düğmesidir (APG "disclosure navigation"):
 * `aria-expanded` + `aria-controls`, tıklama/Enter/Boşluk/↓ paneli açar ve
 * klavyeden açıldıysa odağı panelin ilk öğesine taşır. Eskiden panel ODAKLA
 * açılıyordu (Tab ile gezerken her öğede panel patlıyordu) ve body'nin sonuna
 * portal edildiği için klavyeyle İÇİNE hiç girilemiyordu. Fare için hover
 * açma korunur. Çocuksuz öğe gerçek bir link (`MenuLink`).
 *
 * Kullanıcı bulgusu (2026-09-22): öğe eskiden `Button variant="ghost"` idi;
 * hover dolgusu alt göstergeden geniş bir şerit yaratıyordu. BasicMenuItem'ın
 * aynısı: arka plan yok, yalnızca metin rengi + alt gösterge.
 */
export function MegaMenuItem({ item, open, activeKey, panelId, onHover, onLeave, onToggle, color, onNavigate, className }: Readonly<MegaMenuItemProps>) {
  const hasChildren = !!item.children?.length;
  const pointerTypeRef = useRef<string>("mouse");
  // Paneli açık öğe ya da geçerli sayfayı içeren öğe "aktif" görünür.
  const highlightKey = open || isMenuItemActive(item, activeKey) ? item.key : null;
  const baseClass = cn(
    "relative inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
    touchTargetClass.md,
    item.disabled ? "cursor-not-allowed opacity-50" : cn("cursor-pointer", getItemClass(item, highlightKey, color)),
    className
  );

  return (
    <div className="flex h-full items-center" onMouseEnter={item.disabled ? undefined : onHover} onMouseLeave={onLeave}>
      {hasChildren ? (
        <button
          type="button"
          data-mega-key={item.key}
          disabled={item.disabled}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          onPointerDown={(event) => {
            pointerTypeRef.current = event.pointerType;
          }}
          onClick={(event) => {
            // `detail === 0`: tıklamayı klavye (Enter/Boşluk) üretti.
            if (event.detail === 0) onToggle("key");
            else onToggle(pointerTypeRef.current === "mouse" ? "mouse" : "touch");
          }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowDown") return;
            event.preventDefault();
            onToggle("arrow");
          }}
          className={cn("group", baseClass)}
        >
          {item.icon}
          {item.title}
          <ChevronDownIcon aria-hidden="true" size={14} className="opacity-60 transition-transform duration-200 group-aria-expanded:rotate-180" />
        </button>
      ) : (
        <MenuLink
          route={item.route}
          target={item.target}
          reloadDocument={item.reloadDocument}
          onNavigate={onNavigate}
          disabled={item.disabled}
          current={item.key === activeKey}
          className={baseClass}
        >
          {item.icon}
          {item.title}
          <NewTabHint target={item.target} />
        </MenuLink>
      )}
    </div>
  );
}
