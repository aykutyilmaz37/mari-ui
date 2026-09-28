"use client";

import React, { useState } from "react";
import { cn } from "@mari-ui/core";
import type { MegaPanelProps } from "./types";
import { MegaPanelColumn } from "./_components/MegaPanelColumn";
import { MegaPanelPromoGrid } from "./_components/MegaPanelPromoGrid";
import { MegaPanelRail } from "./_components/MegaPanelRail";
import { isMenuItemActive } from "../utils";

export type { MegaPanelProps };

/**
 * "Ray + kolonlar + opsiyonel promosyon" — üç menü bileşeninin (MegaMenu,
 * BasicMenu'nün zengin dropdown'ı, Sidebar'ın dropdown/mega modları) ortak
 * içerik gövdesi. Konumlama/tetikleme host'a ait — bu bileşen `position`,
 * portal, elevation UYGULAMAZ; sadece düz bir `<div>` render eder (bkz.
 * plan: MegaMenu tam genişlikte kendi sarmalayıcısını kullanır, BasicMenu/
 * Sidebar `DropdownContent`in İÇİNDE render eder).
 *
 * Klavye: Tab sırası + host'un ok tuşu gezinmesi (MegaMenu ve Dropdown
 * panelleri ↑/↓/Home/End/harf ile gezer — `getRovingTarget`) + Escape.
 * Ray, kolon ve promosyon öğeleri gerçek linklerdir (`MenuLink`).
 *
 * Geçerli sayfa `activeKey` ile gelir (host `currentPath`ten bulur): ray
 * başlangıçta onu içeren kategoriyi seçer, link vurgulanır.
 */
export function MegaPanel({ items, color, layout, orientation = "horizontal", onNavigate, onItemClick, activeKey = null, className }: MegaPanelProps) {
  // Geçerli sayfa bu paneldeyse ray onu içeren kategoriyle açılır (kullanıcı nerede olduğunu görür).
  const [selectedKey, setSelectedKey] = useState<string | null>(() => items.find((item) => isMenuItemActive(item, activeKey))?.key ?? items[0]?.key ?? null);
  const selected = items.find((item) => item.key === selectedKey) ?? items[0];
  if (!selected) return null;

  const columns = selected.children ?? [];
  // Kolon SAYISI daralır, veri kırpılmaz — eskiden `compact` modda gruplar
  // `slice(0, 2)` ile sessizce atılıyordu (kullanıcı menüsünde eksik kategori).
  const visibleColumns = columns;
  const promoTiles = layout === "full" ? selected.promoTiles : undefined;
  const hasContent = visibleColumns.length > 0 || !!promoTiles?.length;
  // 3 kolon + promosyon ancak `xl`de sığıyor; 1024px'te başlıklar kırılıyordu.
  let columnsClass = "columns-2 gap-8 xl:columns-3";
  if (orientation === "vertical") columnsClass = "columns-1";
  else if (layout === "compact") columnsClass = "columns-2 gap-8";

  return (
    <div className={cn("flex gap-6", orientation === "vertical" ? "flex-col" : "flex-row", className)}>
      <MegaPanelRail items={items} selectedKey={selected.key} onSelect={setSelectedKey} color={color} orientation={orientation} onNavigate={onNavigate} onItemClick={onItemClick} activeKey={activeKey} />

      {hasContent && (
        <div className={cn("flex min-w-0 flex-1", orientation === "vertical" ? "flex-col gap-4" : "gap-8")}>
          {visibleColumns.length > 0 && (
            // Gruplar TEK TEK kolon değil, çok kolonlu bir metin akışına giriyor:
            // referans menülerdeki gibi kısa gruplar aynı kolonda alt alta
            // dizilir, kolonlar eşit dolar (`break-inside-avoid` bir grubu
            // ikiye bölmeyi engeller). Sabit `grid-cols-N` bunu yapamaz.
            <div className={cn("min-w-0 flex-1", columnsClass)}>
              {visibleColumns.map((group) => (
                <MegaPanelColumn key={group.key} group={group} color={color} onNavigate={onNavigate} onItemClick={onItemClick} activeKey={activeKey} />
              ))}
            </div>
          )}
          {promoTiles && promoTiles.length > 0 && <MegaPanelPromoGrid tiles={promoTiles} onNavigate={onNavigate} onTileClick={() => onItemClick?.(selected)} className="hidden xl:grid" />}
        </div>
      )}
    </div>
  );
}
