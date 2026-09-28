"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemJustify, MenuItemType, MenuNavigationProps, MenuPosition } from "../types";
import { getMenuItemJustify, getMenuPosition } from "../utils";
import { MobileNav } from "./MobileNav";
import { MenuLink } from "./MenuLink";
import { DESKTOP_ONLY_CLASS, MOBILE_ONLY_CLASS, type MenuMobileBreakpoint } from "./responsive";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import { skeletonFill, type SkeletonableProps } from "../../lib/skeleton";

/** BasicMenu ve MegaMenu'nün ortak çubuk prop'ları. */
export interface NavBarBaseProps extends MenuNavigationProps, SkeletonableProps {
  data: MenuItemType[];
  logo?: React.ReactNode;
  /** Verilirse logo bu adrese giden gerçek bir link olur (genelde `"/"`). `onNavigate` varsa ona devredilir. */
  logoHref?: string;
  /** Logo bir düğme olarak davranır (`logoHref` yoksa). İkisi de yoksa logo etkileşimsizdir. */
  onLogoClick?: () => void;
  /** Etkileşimli logonun erişilebilir adı. Varsayılan "Ana sayfa". */
  logoLabel?: string;
  menuItemJustify?: MenuItemJustify;
  menuPosition?: MenuPosition;
  /** Sağ tarafta gösterilecek keyfi içerik (örn. "Giriş Yap" düğmesi, sepet ikonu, arama). */
  actions?: React.ReactNode;
  /**
   * Bu genişliğin ALTINDA yatay öğeler gizlenir, yerine hamburger + soldan
   * kayan çekmece gelir (`actions` çubukta kalır). Varsayılan: `"lg"` (1024px).
   */
  mobileBreakpoint?: MenuMobileBreakpoint;
  /** Öğeleri saran `<nav>`ın erişilebilir adı. Varsayılan "Ana menü". */
  "aria-label"?: string;
}

interface NavBarProps extends NavBarBaseProps {
  color: ColorRole;
  activeKey: string | null;
  onItemSelect: (item: MenuItemType) => void;
  /** Her üst öğenin masaüstü render'ı (`<li>` içine konur). */
  renderItem: (item: MenuItemType) => React.ReactNode;
  /** Çubuğun kutusu — MegaMenu paneli tam genişlikte bu kutunun altına hizalar. */
  barRef?: React.Ref<HTMLDivElement>;
  /** Çubuğun yanına (portal panel vb.). */
  children?: React.ReactNode;
}

const placeholder = <span className={cn("block size-full min-h-[1lh] rounded-md", skeletonFill(true))} />;

/**
 * Faz 15.5 — BasicMenu/MegaMenu'nün ortak kabuğu (eskiden iki dosyada kopya):
 * logo solda sabit, öğeler `<nav aria-label><ul>` içinde, `actions` sağda
 * sabit; `mobileBreakpoint` altında hamburger + çekmece (CSS ile — SSR'da
 * sıçrama yok). Logo `logoHref` ile link, `onLogoClick` ile düğme, ikisi de
 * yoksa etkileşimsiz. `sticky`/`fixed` → `z-mari-sticky`. Gölge token'lı.
 * `skeleton`: hamburger, logo, her öğe ve `actions` kendi kutusunda yer tutucu.
 */
export function NavBar({
  data,
  logo,
  logoHref,
  onLogoClick,
  logoLabel = "Ana sayfa",
  menuItemJustify = "left",
  menuPosition = "default",
  color,
  onNavigate,
  currentPath,
  actions,
  mobileBreakpoint = "lg",
  skeleton = false,
  "aria-label": ariaLabel = "Ana menü",
  activeKey,
  onItemSelect,
  renderItem,
  barRef,
  children,
}: NavBarProps) {
  let logoNode: React.ReactNode = null;
  if (logo && logoHref) {
    logoNode = (
      <MenuLink route={logoHref} onNavigate={onNavigate} className="shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring">
        <span className="sr-only">{logoLabel}</span>
        <span aria-hidden="true">{logo}</span>
      </MenuLink>
    );
  } else if (logo && onLogoClick) {
    logoNode = (
      <button type="button" aria-label={logoLabel} className="shrink-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring" onClick={onLogoClick}>
        {logo}
      </button>
    );
  } else if (logo) {
    logoNode = <div className="shrink-0">{logo}</div>;
  }

  return (
    <div className={cn(getMenuPosition(menuPosition), menuPosition !== "default" && "z-mari-sticky")}>
      <div
        ref={barRef}
        aria-busy={skeleton || undefined}
        className="flex flex-row items-center justify-between gap-4 border-b border-mari-border bg-mari-surface px-4 py-3 shadow-mari-sm"
      >
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <SkeletonSlot on={skeleton} placeholder={placeholder} className={MOBILE_ONLY_CLASS[mobileBreakpoint]}>
            <MobileNav
              data={data}
              color={color}
              breakpoint={mobileBreakpoint}
              logo={logo}
              activeKey={activeKey}
              onItemSelect={onItemSelect}
              onNavigate={onNavigate}
              currentPath={currentPath}
            />
          </SkeletonSlot>
          {logoNode && (
            <SkeletonSlot on={skeleton} placeholder={placeholder} className="shrink-0">
              {logoNode}
            </SkeletonSlot>
          )}
        </div>

        <nav aria-label={ariaLabel} className={cn("min-w-0 flex-1", DESKTOP_ONLY_CLASS[mobileBreakpoint])}>
          <ul className={cn("flex w-full flex-row items-center gap-1 xl:gap-4", getMenuItemJustify(menuItemJustify))}>
            {data.map((item) => (
              <li key={item.key} className="flex">
                <SkeletonSlot on={skeleton} placeholder={placeholder}>
                  {renderItem(item)}
                </SkeletonSlot>
              </li>
            ))}
          </ul>
        </nav>

        {actions && (
          <SkeletonSlot on={skeleton} placeholder={placeholder} flow="flex" className="shrink-0">
            <div className="flex shrink-0 flex-row items-center gap-3">{actions}</div>
          </SkeletonSlot>
        )}
      </div>
      {children}
    </div>
  );
}
