"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@mari-ui/core";
import type { MenuItemJustify, MenuItemType, MenuNavigationProps, MenuPosition, MenuColorProps } from "../types";
import { findActiveKeyByRoute, getMenuItemJustify, getMenuPosition } from "../utils";
import { MobileNav } from "../_shared/MobileNav";
import { DESKTOP_ONLY_CLASS, type MenuMobileBreakpoint } from "../_shared/responsive";
import { BasicMenuItem } from "./_components/BasicMenuItem";
import { DropdownSubMenu } from "./_components/DropdownSubMenu";

export interface BasicMenuProps extends MenuNavigationProps, MenuColorProps {
  data: MenuItemType[];
  logo?: React.ReactNode;
  onLogoClick?: () => void;
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
 */
export function BasicMenu({ data, logo, onLogoClick, menuItemJustify = "left", menuPosition = "default", color = "primary", onNavigate, currentPath, actions, mobileBreakpoint = "lg" }: BasicMenuProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveKey(findActiveKeyByRoute(data, currentPath));
  }, [data, currentPath]);

  return (
    <div className={cn("flex flex-row items-center justify-between gap-4 bg-mari-surface px-4 py-3 shadow-md", getMenuPosition(menuPosition))}>
      <div className="flex min-w-0 shrink-0 items-center gap-2">
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
        {logo && (
          <button type="button" className="shrink-0 cursor-pointer" onClick={onLogoClick}>
            {logo}
          </button>
        )}
      </div>

      <div className={cn("min-w-0 flex-1 flex-row items-center gap-1 xl:gap-4", DESKTOP_ONLY_CLASS[mobileBreakpoint], getMenuItemJustify(menuItemJustify))}>
        {data.map((item) =>
          item.children ? (
            <DropdownSubMenu key={item.key} item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} currentPath={currentPath} />
          ) : (
            <BasicMenuItem key={item.key} item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />
          )
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-row items-center gap-3">{actions}</div>}
    </div>
  );
}
