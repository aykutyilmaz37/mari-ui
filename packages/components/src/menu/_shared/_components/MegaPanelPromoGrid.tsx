"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { MenuNavigationProps, MenuPromoTile } from "../../types";
import { navigateTo } from "../../utils";

export interface MegaPanelPromoGridProps extends MenuNavigationProps {
  tiles: MenuPromoTile[];
  /** Karta tıklanınca `navigateTo`dan ÖNCE çağrılır — host kendi panelini/çekmecesini kapatabilsin diye. */
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

export function MegaPanelPromoGrid({ tiles, onNavigate, onTileClick, className }: MegaPanelPromoGridProps) {
  return (
    <div className={cn("grid w-64 shrink-0 grid-cols-2 gap-3 self-start", className)}>
      {tiles.map((tile) => (
        <button
          key={tile.title}
          type="button"
          onClick={() => {
            onTileClick?.(tile);
            navigateTo(tile.href, onNavigate);
          }}
          className={cn(
            "group relative cursor-pointer overflow-hidden rounded-lg border border-mari-border transition-shadow hover:shadow-mari-sm",
            SPAN_CLASS[tile.span ?? "sm"]
          )}
        >
          <img src={tile.image} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5 text-start text-xs font-semibold text-white">{tile.title}</span>
        </button>
      ))}
    </div>
  );
}
