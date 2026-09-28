"use client";

import React, { useEffect, useState } from "react";
import type { MenuColorProps } from "../types";
import { findActiveKeyByRoute } from "../utils";
import { NavBar, type NavBarBaseProps } from "../_shared/NavBar";
import { BasicMenuItem } from "./_components/BasicMenuItem";
import { DropdownSubMenu } from "./_components/DropdownSubMenu";

export type BasicMenuProps = NavBarBaseProps & MenuColorProps;

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
 * Faz 15.5: çubuk kabuğu (logo, `<nav><ul>`, `actions`, mobil çekmece,
 * sticky, iskelet) MegaMenu ile ortak `NavBar`da. Route'u olan öğeler gerçek
 * link (`MenuLink`), geçerli sayfa `aria-current="page"`.
 */
export function BasicMenu({ data, color = "primary", currentPath, onNavigate, ...barProps }: BasicMenuProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveKey(findActiveKeyByRoute(data, currentPath));
  }, [data, currentPath]);

  return (
    <NavBar
      {...barProps}
      data={data}
      color={color}
      currentPath={currentPath}
      onNavigate={onNavigate}
      activeKey={activeKey}
      onItemSelect={(item) => setActiveKey(item.key)}
      renderItem={(item) =>
        item.children ? (
          <DropdownSubMenu item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} currentPath={currentPath} />
        ) : (
          <BasicMenuItem item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />
        )
      }
    />
  );
}
