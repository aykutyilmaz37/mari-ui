"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { MenuNavigationProps, MenuPromoTile } from "../../types";
import { MenuLink } from "../MenuLink";
import { NewTabHint } from "../../../lib/linkBehavior";

export interface MegaPanelPromoGridProps extends MenuNavigationProps {
  tiles: MenuPromoTile[];
  /** Karta tıklanınca (gezinmeden ÖNCE) çağrılır — host kendi panelini/çekmecesini kapatabilsin diye. */
  onTileClick?: (tile: MenuPromoTile) => void;
  /** Varsayılan genişlik (`w-64`) masaüstü paneli için; mobil çekmece tam genişlik ister. */
  className?: string;
}

/**
 * Referans sitelerdeki karma boyutlu kart ızgarasının YAPISI alındı (küçük
 * kareler + birkaç geniş banner), pixel-exact boyutlar değil. `span` sadece
 * bu 2 kolonluk ızgara İÇİNDE ne kadar yer kapladığını belirler — tüm
 * panelin genişliğine yayılan tam-genişlik banner (referansın en alttaki
 * yazıcı reklamı gibi) bu turun kapsamı dışında bırakıldı.
 *
 * `Card` KASITLI OLARAK kullanılmadı: onun DOM'u (cover'a sabit `mb-4`, ayrı
 * padded bir `body` div'i) "görsel kutuyu tamamen doldur, altına gradient'li
 * başlık bindir" düzenine uymuyor — Card'ı zorlamak yerine üç token'ı
 * (`border-mari-border`, `elevationClass.sm`) doğrudan kullanan hafif bir
 * kutu yeterli.
 */
const SPAN_CLASS: Record<NonNullable<MenuPromoTile["span"]>, string> = {
  sm: "col-span-1 aspect-square",
  wide: "col-span-2 aspect-[21/9]",
  full: "col-span-2 aspect-[16/9]",
};

export function MegaPanelPromoGrid({ tiles, onNavigate, onTileClick, className }: Readonly<MegaPanelPromoGridProps>) {
  return (
    <div className={cn("grid w-64 shrink-0 grid-cols-2 gap-3 self-start", className)}>
      {tiles.map((tile) => (
        <MenuLink
          key={tile.title}
          route={tile.href}
          target={tile.target}
          reloadDocument={tile.reloadDocument}
          onNavigate={onNavigate}
          onSelect={() => onTileClick?.(tile)}
          className={cn(
            "group relative block cursor-pointer overflow-hidden rounded-lg border border-mari-border transition-shadow hover:shadow-mari-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
            SPAN_CLASS[tile.span ?? "sm"]
          )}
        >
          <img src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute inset-x-0 bottom-0 flex items-center gap-1 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-start text-xs font-semibold text-white">
            {tile.title}
            <NewTabHint target={tile.target} />
          </span>
        </MenuLink>
      ))}
    </div>
  );
}
