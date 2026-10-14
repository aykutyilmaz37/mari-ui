"use client";

import React, { useEffect, useId, useState } from "react";
import { MenuIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import type { MenuItemType, MenuNavigationProps } from "../types";
import { NavDrawer } from "./NavDrawer";
import { MOBILE_BREAKPOINT_PX, MOBILE_ONLY_CLASS, type MenuMobileBreakpoint } from "./responsive";

export interface MobileNavProps extends MenuNavigationProps {
  data: MenuItemType[];
  color: ColorRole;
  /** Bu genişliğin altında hamburger görünür; üstüne çıkınca açık çekmece kendiliğinden kapanır. */
  breakpoint: MenuMobileBreakpoint;
  /** Çekmecenin başlığında gösterilir. */
  logo?: React.ReactNode;
  /** Host kendi aktif öğesini tutuyorsa (BasicMenu) onu geçer; verilmezse `currentPath`ten bulunur. */
  activeKey?: string | null;
  /** Yaprak öğe seçildiğinde (`navigateTo`dan önce) — host aktif öğesini güncelleyebilsin diye. */
  onItemSelect?: (item: MenuItemType) => void;
  /** Çekmecenin (dialog) erişilebilir adı. */
  label?: string;
}

/*
 * Navbar'ların (BasicMenu/MegaMenu) mobil hâli: hamburger düğmesi + soldan
 * kayan çekmece (`NavDrawer`). Kullanıcı bulgusu: iki navbar da hiç
 * responsive değildi — dar ekranda öğeler taşıyor, "Ana Sayfa" gibi
 * başlıklar iki satıra kırılıyor, mega panel/alt menüler hover'a dayalı
 * olduğu için dokunmatik cihazda fiilen kullanılamıyordu.
 */
/**
 * Viewport `breakpoint`in üstüne çıkarsa (hamburger CSS ile gizlenince) açık
 * çekmece kendiliğinden kapanır — yoksa kapatma düğmesi olmayan bir masaüstü
 * ekranında asılı kalırdı.
 */
export function MobileNav({ data, color, breakpoint, logo, activeKey, onItemSelect, onNavigate, currentPath, label }: Readonly<MobileNavProps>) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(`(min-width: ${MOBILE_BREAKPOINT_PX[breakpoint]}px)`);
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [open, breakpoint]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "-ml-2 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-foreground transition-colors hover:bg-mari-surface-alt focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          MOBILE_ONLY_CLASS[breakpoint]
        )}
      >
        <MenuIcon aria-hidden="true" size={22} />
      </button>

      <NavDrawer
        id={panelId}
        open={open}
        onClose={() => setOpen(false)}
        data={data}
        color={color}
        header={logo}
        activeKey={activeKey}
        onItemSelect={onItemSelect}
        onNavigate={onNavigate}
        currentPath={currentPath}
        label={label}
        className={MOBILE_ONLY_CLASS[breakpoint]}
      />
    </>
  );
}
