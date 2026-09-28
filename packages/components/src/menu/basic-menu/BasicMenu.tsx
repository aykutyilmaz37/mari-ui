"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@mari-ui/core";
import type { MenuItemJustify, MenuItemType, MenuNavigationProps, MenuPosition, MenuColorProps } from "../types";
import { findActiveKeyByRoute, getMenuItemJustify, getMenuPosition } from "../utils";
import { MobileNav } from "../_shared/MobileNav";
import { MenuLink } from "../_shared/MenuLink";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import { skeletonFill, type SkeletonableProps } from "../../lib/skeleton";
import { DESKTOP_ONLY_CLASS, MOBILE_ONLY_CLASS, type MenuMobileBreakpoint } from "../_shared/responsive";
import { BasicMenuItem } from "./_components/BasicMenuItem";
import { DropdownSubMenu } from "./_components/DropdownSubMenu";

export interface BasicMenuProps extends MenuNavigationProps, MenuColorProps, SkeletonableProps {
  data: MenuItemType[];
  logo?: React.ReactNode;
  /** Verilirse logo bu adrese giden gerçek bir link olur (genelde `"/"`). `onNavigate` varsa ona devredilir. */
  logoHref?: string;
  /** Logo bir düğme olarak davranır (`logoHref` yoksa). İkisi de yoksa logo etkileşimsizdir. */
  onLogoClick?: () => void;
  /** Etkileşimli logonun erişilebilir adı. Varsayılan "Ana sayfa". */
  logoLabel?: string;
  /** Öğeleri saran `<nav>`ın erişilebilir adı. Varsayılan "Ana menü". */
  "aria-label"?: string;
  menuItemJustify?: MenuItemJustify;
  menuPosition?: MenuPosition;
  /** Sağ tarafta gösterilecek keyfi içerik (örn. "Giriş Yap" düğmesi, sepet ikonu, arama). */
  actions?: React.ReactNode;
  /**
   * Bu genişliğin ALTINDA yatay öğeler gizlenir, yerine hamburger + soldan
   * kayan çekmece gelir (`actions` çubukta kalır). Öğe sayısı fazlaysa
   * `"xl"` seçin. Varsayılan: `"lg"` (1024px).
   */
  mobileBreakpoint?: MenuMobileBreakpoint;
}

/**
 * `currentPath` eskiden kabul edilip hiç kullanılmıyordu — sayfa yenilendiğinde
 * (veya SSR'da) aktif öğe her zaman `data[0]`e düşüyordu, gerçek route ne
 * olursa olsun (Faz 13.5 bulgusu). Artık `findActiveKeyByRoute` ile
 * `currentPath`e karşılık gelen öğe varsa o başlangıçta aktif.
 *
 * 2026-09-22: `data[0]`e geri düşme davranışı KALDIRILDI — Sidebar hiçbir
 * zaman böyle bir varsayılan seçmiyordu (`findActiveKeyByRoute` eşleşmezse
 * `null` kalır) ve `currentPath` hiç eşleşmediğinde ilk öğeyi "aktif" göstermek
 * yanıltıcıydı (kullanıcı nav'da olmayan bir sayfadaysa bile ilk öğe vurgulanırdı).
 * BasicMenu artık Sidebar'la tutarlı: eşleşme yoksa hiçbir öğe aktif görünmez.
 *
 * Faz 13.5 kullanıcı bulgusu: logo ve öğeler eskiden TEK bir flex satırında,
 * yan yana render ediliyordu — "logo solda sabit, öğeler ortada/sağda, eylem
 * alanı (giriş/sepet) en sağda" gibi HERHANGİ BİR gerçek navbar düzeni
 * (bkz. e-ticaret/kurumsal siteler) kurulamıyordu; ayrıca konteynerde hiç
 * `padding` yoktu, öğeler kenara yapışıyordu. Artık logo/öğeler/`actions`
 * üç ayrı grup — `justify-between` ile logo sabit solda, `actions` sabit
 * sağda kalır, öğeler aradaki alanı `menuItemJustify`e göre kullanır.
 *
 * Responsive (kullanıcı bulgusu — hiç düşünülmemişti; dar ekranda öğeler
 * taşıyor ve başlıklar iki satıra kırılıyordu): `mobileBreakpoint` altında
 * öğeler CSS ile gizlenir, logonun soluna hamburger gelir (`MobileNav`).
 * JS ile değil CSS ile gizlendiği için SSR/hydration'da sıçrama yok.
 *
 * Faz 15.5: öğeler bir `<nav aria-label>` içinde `<ul>` listesi; route'u olan
 * öğeler gerçek link (`MenuLink`), geçerli sayfa `aria-current="page"`. Logo
 * `logoHref` ile link olur, ikisi de verilmezse etkileşimsiz (boş bir düğme
 * değil). `sticky`/`fixed` konumda `z-mari-sticky` (içerik çubuğun üstüne
 * binmesin). Gölge token'lı. `skeleton`: logo, öğeler ve `actions` yer tutucu.
 */
const placeholder = <span className={cn("block size-full min-h-[1lh] rounded-md", skeletonFill(true))} />;

export function BasicMenu({
  data,
  logo,
  logoHref,
  onLogoClick,
  logoLabel = "Ana sayfa",
  menuItemJustify = "left",
  menuPosition = "default",
  color = "primary",
  onNavigate,
  currentPath,
  actions,
  mobileBreakpoint = "lg",
  skeleton = false,
  "aria-label": ariaLabel = "Ana menü",
}: BasicMenuProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveKey(findActiveKeyByRoute(data, currentPath));
  }, [data, currentPath]);

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
    <div
      aria-busy={skeleton || undefined}
      className={cn(
        "flex flex-row items-center justify-between gap-4 border-b border-mari-border bg-mari-surface px-4 py-3 shadow-mari-sm",
        getMenuPosition(menuPosition),
        menuPosition !== "default" && "z-mari-sticky"
      )}
    >
      <div className="flex min-w-0 shrink-0 items-center gap-2">
        <SkeletonSlot on={skeleton} placeholder={placeholder} className={MOBILE_ONLY_CLASS[mobileBreakpoint]}>
          <MobileNav
            data={data}
            color={color}
            breakpoint={mobileBreakpoint}
            logo={logo}
            activeKey={activeKey}
            onItemSelect={(item) => setActiveKey(item.key)}
            onNavigate={onNavigate}
            currentPath={currentPath}
          />
        </SkeletonSlot>
        {logoNode && (
          <SkeletonSlot on={skeleton} placeholder={placeholder}>
            {logoNode}
          </SkeletonSlot>
        )}
      </div>

      <nav aria-label={ariaLabel} className={cn("min-w-0 flex-1", DESKTOP_ONLY_CLASS[mobileBreakpoint])}>
        <ul className={cn("flex w-full flex-row items-center gap-1 xl:gap-4", getMenuItemJustify(menuItemJustify))}>
          {data.map((item) => (
            <li key={item.key} className="flex">
              <SkeletonSlot on={skeleton} placeholder={placeholder}>
                {item.children ? (
                  <DropdownSubMenu item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} currentPath={currentPath} />
                ) : (
                  <BasicMenuItem item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />
                )}
              </SkeletonSlot>
            </li>
          ))}
        </ul>
      </nav>

      {actions && (
        <SkeletonSlot on={skeleton} placeholder={placeholder} flow="flex">
          <div className="flex shrink-0 flex-row items-center gap-3">{actions}</div>
        </SkeletonSlot>
      )}
    </div>
  );
}
