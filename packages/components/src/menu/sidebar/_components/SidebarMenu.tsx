"use client";

import React from "react";
import { cn } from "@mari-ui/core";
import type { MenuItemType } from "../../types";
import { SidebarItem, type SidebarItemProps } from "./SidebarItem";

export interface SidebarMenuProps extends Omit<SidebarItemProps, "item" | "reserveIconSlot"> {
  data: MenuItemType[];
  className?: string;
}

/*
 * Aktif anahtar artık `Sidebar`da TEK yerde tutuluyor: eskiden her iç içe
 * `SidebarMenu` kendi `activeKey` state'ini tutuyordu, iç seviyede bir öğeye
 * tıklamak üst öğenin "aktif grup" rengini hiç güncellemiyordu.
 */
/**
 * Bir seviyenin listesi. `heading: true` öğeler etkileşimsiz bölüm
 * etiketleri — ray daraltılmışken yazı yerine ince bir ayraç olurlar.
 */
export function SidebarMenu({ data, className, ...itemProps }: Readonly<SidebarMenuProps>) {
  const reserveIconSlot = data.some((item) => item.icon && !item.heading);

  return (
    <ul className={cn("flex flex-col gap-0.5", className)}>
      {data.map((item) =>
        item.heading ? (
          <li key={item.key} className="px-3.5 pt-4 pb-1 first:pt-1">
            {/* Daraltılmış rayda yazı yerine ince bir ayraç — metin ekran okuyucu için DOM'da kalır. */}
            {itemProps.collapsed && <span aria-hidden="true" className="block h-px w-full bg-mari-border" />}
            <span className={cn("block truncate text-xs font-semibold tracking-wide text-mari-muted uppercase", itemProps.collapsed && "sr-only")}>{item.title}</span>
          </li>
        ) : (
          <SidebarItem key={item.key} {...itemProps} item={item} reserveIconSlot={reserveIconSlot} />
        )
      )}
    </ul>
  );
}
