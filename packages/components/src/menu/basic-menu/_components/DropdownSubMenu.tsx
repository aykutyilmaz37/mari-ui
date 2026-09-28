"use client";

import React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../../dropdown";
import { useDropdown } from "../../../dropdown/useDropdown";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass, isMenuItemActive } from "../../utils";
import { touchTargetClass } from "../../../lib/sizeClasses";
import { MenuLink } from "../../_shared/MenuLink";
import { BasicMenuItem } from "./BasicMenuItem";
import { SubMenuRowContent, getSubMenuRowClass } from "./SubMenuRow";

export interface DropdownSubMenuProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
}

/** Navbar'ın `py-3` iç boşluğu kadar ek mesafe: panel, çubuğun ÜSTÜNE binmeden hemen altından açılır. */
const NAVBAR_OFFSET_PX = 12;
/** Düz listede bu sayıdan fazla öğe varsa panel iki kolona geçer. */
const TWO_COLUMN_THRESHOLD = 4;

interface RowProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  /** Yaprak seçildikten sonra — host kendi panelini kapatır. */
  onAfterSelect?: () => void;
}

/** Yaprak satır: gerçek bir link (`MenuLink`); tıklanınca aktif öğeyi günceller ve paneli kapatır. */
function LeafRow({ item, activeKey, setActiveKey, color, onNavigate, onAfterSelect }: RowProps) {
  return (
    <MenuLink
      route={item.route}
      onNavigate={onNavigate}
      disabled={item.disabled}
      current={item.key === activeKey}
      className={getSubMenuRowClass(item)}
      onSelect={() => {
        setActiveKey(item.key);
        onAfterSelect?.();
      }}
    >
      <SubMenuRowContent item={item} active={isMenuItemActive(item, activeKey)} color={color} />
    </MenuLink>
  );
}

/** İç içe alt menü: satırın kendisi tetikleyici, paneli sağa doğru açılır. */
function FlyoutRow(props: RowProps) {
  const { item, activeKey, color } = props;
  return (
    <Dropdown hover className="block self-auto">
      <DropdownTrigger className={getSubMenuRowClass(item)}>
        <SubMenuRowContent item={item} active={isMenuItemActive(item, activeKey)} color={color} trailing={<ChevronRightIcon aria-hidden="true" size={16} className="mt-0.5 shrink-0 self-center text-mari-muted" />} />
      </DropdownTrigger>
      <DropdownContent placement="right-start" offset={6} className="w-72 rounded-xl p-2">
        <RowList {...props} items={item.children ?? []} />
      </DropdownContent>
    </Dropdown>
  );
}

function RowList({ items, ...rest }: Omit<RowProps, "item"> & { items: MenuItemType[] }) {
  return (
    <>
      {/* `item` spread'den SONRA: `FlyoutRow` kendi prop'larını (kendi `item`i dahil) buraya geçiriyor —
          önce yazıldığında iç içe panel çocukları değil üst öğeyi tekrar tekrar gösteriyordu. */}
      {items.map((child) => (child.children?.length ? <FlyoutRow key={child.key} {...rest} item={child} /> : <LeafRow key={child.key} {...rest} item={child} />))}
    </>
  );
}

export type SubMenuPanelBodyProps = Omit<RowProps, "item"> & { items: MenuItemType[] };

/**
 * Gruplu (başlıklı kolonlar) görünüm yalnızca HER çocuk bir grupsa. Eskiden
 * tek bir çocuğun alt öğesi olması yetiyordu: karışık veride düz öğeler de
 * "grup" sayılıp kendi başlıklarıyla tekrar ediliyordu ("ÜRÜN LİSTESİ →
 * Ürün Listesi") ve panel gereksizce genişleyip viewport'tan taşıyordu.
 * Karışık veri düz satırlar olarak kalır; alt öğesi olan satır kendi flyout'unu açar.
 */
function isGrouped(items: MenuItemType[]): boolean {
  return items.length > 0 && items.every((child) => child.children && child.children.length > 0);
}

/** Panelin genişlik sınıfı — veri şekline göre (düz / iki kolon / gruplu). */
export function getSubMenuPanelWidthClass(items: MenuItemType[]): string {
  if (isGrouped(items)) return "w-max";
  return items.length > TWO_COLUMN_THRESHOLD ? "w-[36rem]" : "w-80";
}

/**
 * Alt menü panelinin gövdesi (BasicMenu'nün dropdown'ı ve Sidebar'ın
 * `dropdown` modu aynı paneli kullanıyor). Veri şekline göre:
 * - Düz (tek seviye) → ikon karosu + başlık + açıklama satırları; öğe sayısı
 *   `TWO_COLUMN_THRESHOLD`i geçerse iki kolon.
 * - Gruplu (çocukların kendi çocukları varsa) → her grup küçük bir başlık +
 *   altında satırlar, gruplar yan yana kolonlar.
 */
export function SubMenuPanelBody({ items, ...rowProps }: SubMenuPanelBodyProps) {
  if (isGrouped(items)) {
    return (
      // `flex-wrap`: grup sayısı viewport'a sığmıyorsa (panel `max-w`ye takılır) gruplar alt satıra iner.
      <div className="flex flex-wrap gap-2">
        {items.map((group) => (
          <div key={group.key} className="flex w-64 flex-col">
            <div className="px-2.5 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wide text-mari-muted">{group.title}</div>
            <RowList {...rowProps} items={group.children?.length ? group.children : [group]} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className={cn(items.length > TWO_COLUMN_THRESHOLD && "grid grid-cols-2")}>
      <RowList {...rowProps} items={items} />
    </div>
  );
}

/** `DropdownContent`in içinde: yaprak seçilince en dıştaki dropdown'ı kapatır. */
function DropdownPanelBody(props: SubMenuPanelBodyProps) {
  const { setVisible } = useDropdown();
  return <SubMenuPanelBody {...props} onAfterSelect={() => setVisible(false)} />;
}

/**
 * Üst navbar'daki alt menüsü olan öğe. Panel içeriği veri şekline göre:
 * - Düz (tek seviye) → ikon karosu + başlık + açıklama satırları; öğe sayısı
 *   `TWO_COLUMN_THRESHOLD`i geçerse iki kolon.
 * - Gruplu (çocukların kendi çocukları varsa) → her grup küçük bir başlık +
 *   altında satırlar, gruplar yan yana kolonlar. Ray + promosyon içeren tam
 *   genişlik mega panel BasicMenu'nün değil `MegaMenu`nün işi.
 * Tetikleyici hem hover hem tıklama/klavye ile açılır (DropdownTrigger).
 */
export function DropdownSubMenu({ item, activeKey, setActiveKey, color, onNavigate, currentPath }: DropdownSubMenuProps) {
  if (!item.children) {
    return <BasicMenuItem item={item} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} />;
  }

  const children = item.children;
  const rowProps = { activeKey, setActiveKey, color, onNavigate, currentPath };

  return (
    <Dropdown hover>
      <DropdownTrigger
        className={cn(
          "group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          touchTargetClass.md,
          getItemClass(item, activeKey, color)
        )}
      >
        {item.icon}
        {item.title}
        <ChevronDownIcon aria-hidden="true" size={14} className="opacity-60 transition-transform duration-200 group-aria-expanded:rotate-180" />
      </DropdownTrigger>
      <DropdownContent placement="bottom-start" offset={NAVBAR_OFFSET_PX} className={cn("max-w-[calc(100vw-2rem)] rounded-xl p-2", getSubMenuPanelWidthClass(children))}>
        <DropdownPanelBody {...rowProps} items={children} />
      </DropdownContent>
    </Dropdown>
  );
}
