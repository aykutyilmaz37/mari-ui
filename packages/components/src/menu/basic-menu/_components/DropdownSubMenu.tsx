"use client";

import React from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../../dropdown";
import { useDropdown } from "../../../dropdown/useDropdown";
import type { MenuItemType, MenuNavigationProps } from "../../types";
import { getItemClass, isMenuItemActive, navigateTo } from "../../utils";
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
}

/** Yaprak satır: tıklanınca gider, aktif öğeyi günceller ve kendi panelini kapatır. */
function LeafRow({ item, activeKey, setActiveKey, color, onNavigate }: RowProps) {
  const { setVisible } = useDropdown();
  return (
    <button
      type="button"
      disabled={item.disabled}
      className={getSubMenuRowClass(item)}
      onClick={() => {
        if (item.disabled) return;
        setActiveKey(item.key);
        navigateTo(item.route, onNavigate);
        setVisible(false);
      }}
    >
      <SubMenuRowContent item={item} active={isMenuItemActive(item, activeKey)} color={color} />
    </button>
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
      {items.map((child) => (child.children?.length ? <FlyoutRow key={child.key} item={child} {...rest} /> : <LeafRow key={child.key} item={child} {...rest} />))}
    </>
  );
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
  const grouped = children.some((child) => child.children && child.children.length > 0);
  const twoColumn = !grouped && children.length > TWO_COLUMN_THRESHOLD;
  const rowProps = { activeKey, setActiveKey, color, onNavigate, currentPath };
  let panelWidth = "w-80";
  if (grouped) panelWidth = "w-max";
  else if (twoColumn) panelWidth = "w-[36rem]";

  return (
    <Dropdown hover>
      <DropdownTrigger
        className={cn(
          "group inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          getItemClass(item, activeKey, color)
        )}
      >
        {item.icon}
        {item.title}
        <ChevronDownIcon aria-hidden="true" size={14} className="opacity-60 transition-transform duration-200 group-aria-expanded:rotate-180" />
      </DropdownTrigger>
      <DropdownContent placement="bottom-start" offset={NAVBAR_OFFSET_PX} className={cn("max-w-[calc(100vw-2rem)] rounded-xl p-2", panelWidth)}>
        {grouped ? (
          // `flex-wrap`: grup sayısı viewport'a sığmıyorsa (panel `max-w`ye takılır) gruplar alt satıra iner.
          <div className="flex flex-wrap gap-2">
            {children.map((group) => (
              <div key={group.key} className="flex w-64 flex-col">
                <div className="px-2.5 pt-1.5 pb-1 text-xs font-semibold uppercase tracking-wide text-mari-muted">{group.title}</div>
                <RowList {...rowProps} items={group.children?.length ? group.children : [group]} />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(twoColumn && "grid grid-cols-2")}>
            <RowList {...rowProps} items={children} />
          </div>
        )}
      </DropdownContent>
    </Dropdown>
  );
}
