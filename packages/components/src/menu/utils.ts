"use client";

import { cn, type ColorRole } from "@mari-ui/core";
import { bgSubtleClass, textClass, textHoverClass } from "../lib/colorClasses";
import type { MenuItemJustify, MenuItemType, MenuPosition, SidebarVariant } from "./types";

export function getMenuItemJustify(justify: MenuItemJustify): string {
  return { left: "justify-start", right: "justify-end", center: "justify-center" }[justify];
}

/**
 * Eskiden `onNavigate ?? window.location.href` düşüşü 6 farklı dosyada
 * birbirinden bağımsız kopyalanmıştı (BasicMenuItem, DropdownSubMenu,
 * MegaMenuItem, MegaSubMenu, SidebarItem, MegaSub) — tek bir yerde.
 */
export function navigateTo(route: string | undefined, onNavigate?: (route: string) => void): void {
  if (!route) return;
  if (onNavigate) onNavigate(route);
  else window.location.href = route;
}

export function getMenuPosition(position: MenuPosition): string {
  return { default: "", sticky: "sticky top-0", fixed: "fixed top-0 w-full" }[position];
}

export function isMenuItemActive(item: MenuItemType, activeKey: string | null): boolean {
  if (!activeKey) return false;
  if (item.key === activeKey) return true;
  if (item.children) return item.children.some((child) => isMenuItemActive(child, activeKey));
  return false;
}

/**
 * Yatay nav öğesinin alt göstergesi. Eskiden öğenin kendi `border-b-2`'siydi —
 * öğe `rounded-md` bir `Button` olduğundan çizginin uçları köşe yuvarlaklığıyla
 * bükülüyordu, ve rengi açık `-border` tonuydu (primary DEĞİL). Artık kutunun
 * altına oturan ayrı, düz bir `::after` çubuğu: rengi rol renginin kendisi
 * (`--mari-color-primary` — açık temada koyu, KOYU temada açık ton; `-solid`
 * her iki temada da koyu kaldığı için koyu zeminde kayboluyordu),
 * hover'da ortadan iki yana açılır (`scale-x`), aktif/açıkken tam görünür.
 * Kutu boyutunu hiç etkilemediği için jitter yok; yazı kalınlığı da sabit.
 */
const INDICATOR_COLOR_CLASS: Record<ColorRole, string> = {
  primary: "after:bg-mari-primary",
  accent: "after:bg-mari-accent",
  success: "after:bg-mari-success",
  error: "after:bg-mari-error",
  warning: "after:bg-mari-warning",
  info: "after:bg-mari-info",
  neutral: "after:bg-mari-neutral",
};

/** Alt menüsü AÇIK tetikleyici (`aria-expanded="true"`) aktif gibi görünsün. Literal — Tailwind birleştirilmiş string'i taramaz. */
const EXPANDED_TEXT_CLASS: Record<ColorRole, string> = {
  primary: "aria-expanded:text-mari-primary",
  accent: "aria-expanded:text-mari-accent",
  success: "aria-expanded:text-mari-success",
  error: "aria-expanded:text-mari-error",
  warning: "aria-expanded:text-mari-warning",
  info: "aria-expanded:text-mari-info",
  neutral: "aria-expanded:text-mari-neutral",
};

export function getItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  const isActive = isMenuItemActive(item, activeKey);
  return cn(
    "relative font-medium transition-colors duration-150",
    "after:pointer-events-none after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:transition-transform after:duration-200 after:ease-out after:content-['']",
    INDICATOR_COLOR_CLASS[color],
    isActive
      ? cn(textClass[color], "after:scale-x-100")
      : cn("text-mari-foreground/80", textHoverClass[color], "after:scale-x-0 hover:after:scale-x-100 aria-expanded:after:scale-x-100", EXPANDED_TEXT_CLASS[color])
  );
}

/**
 * Faz 13.5 kullanıcı bulgusu: aktif öğe eskiden sadece metin rengiyle
 * ayırt ediliyordu — Button'ın kendi varsayılan `solid`/`primary` dolgusu
 * yüzünden zaten HER öğe koyu mavi bir buton gibi göründüğünden bu incelik
 * hiç fark edilmiyordu. `SidebarItem`/`BasicMenuItem`/`MegaMenuItem` artık
 * `variant="ghost" color="neutral"` (düz metin görünümü) kullanıyor; aktif
 * öğe gerçek modern sidebar'lardaki gibi (GitHub, Linear vb.) yumuşak bir
 * arka plan + vurgu rengiyle ayrışıyor. Eskiden bu iki çağrı sitesi
 * (dropdown/mega panel satırları ve Sidebar satırları) neredeyse birebir
 * aynı iki ayrı fonksiyondu (`getMenuListItemClass`/`getSidebarItemClass`)
 * — tek fonksiyonda birleştirildi, `MegaPanel`in ray/kolon satırları da
 * aynısını kullanıyor.
 */
export function getMenuVerticalItemClass(item: MenuItemType, activeKey: string | null, color: ColorRole): string {
  const isActive = isMenuItemActive(item, activeKey);
  return isActive ? cn(textClass[color], bgSubtleClass[color], "font-medium") : cn(textHoverClass[color], "hover:bg-mari-surface-alt font-normal");
}

/** Eskiden `w-2xs`/`w-6xl`/`w-12` gibi bir karışım kullanıyordu — `2xs`/`6xl`
 * Tailwind'in `w-*` (width) skalasında GERÇEKTEN YOK (Slider'daki
 * `w-lg`/`w-md` hatasının aynısı, bkz. plan). Gerçek genişliklerle düzeltildi. */
export function getSidebarWidthClass(variant: SidebarVariant, visible: boolean): string {
  if (variant === "hover") return visible ? "w-64" : "w-12";
  return visible ? "w-64" : "w-0";
}

export function findActiveKeyByRoute(items: MenuItemType[], route: string | undefined): string | null {
  if (!route) return null;
  for (const item of items) {
    if (item.route === route) return item.key;
    if (item.children) {
      const found = findActiveKeyByRoute(item.children, route);
      if (found) return found;
    }
  }
  return null;
}
