"use client";

import React, { useEffect, useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSubtleClass, textClass } from "../../../lib/colorClasses";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../../dropdown";
import { SubMenuPanelBody, getSubMenuPanelWidthClass } from "../../basic-menu/_components/DropdownSubMenu";
import type { MenuItemType, MenuNavigationProps, SidebarPosition } from "../../types";
import { isMenuItemActive } from "../../utils";
import { SidebarMenu } from "./SidebarMenu";

/** Alt öğelerin nasıl açıldığı — `Sidebar` prop'larından türetilir. */
export type SidebarSubMode = "accordion" | "dropdown" | "mega";

export interface SidebarItemProps extends MenuNavigationProps {
  item: MenuItemType;
  /** 0 = kök seviye. İç seviyeler her zaman akordeon + girintili. */
  level: number;
  activeKey: string | null;
  /** Yaprak seçildi: aktif öğeyi günceller + `navigateTo`. */
  onSelect: (item: MenuItemType) => void;
  /** Sadece aktif anahtarı günceller — kendi navigasyonunu yapan paneller (dropdown) için. */
  setActiveKey: (key: string) => void;
  color: ColorRole;
  subMode: SidebarSubMode;
  /** Ray daraltılmış: sadece ikon görünür, etiket/chevron solar. */
  collapsed: boolean;
  /** İkonsuz kök öğe rayda baş harfiyle gösterilsin mi (ray daralabiliyorsa). */
  showMonogram: boolean;
  /** Seviyede ikonlu bir kardeş var — ikonsuz satırlar da aynı yeri ayırır. */
  reserveIconSlot: boolean;
  /** Kapalı akordeonun içindeki satırlar Tab sırasından çıkar. */
  tabbable: boolean;
  position: SidebarPosition;
  /** `mega` modunda paneli açık olan kök öğenin anahtarı. */
  megaKey: string | null;
  /** `fromKeyboard`: Enter/Boşluk ile açıldı — odak panele taşınsın. */
  onMegaOpen: (item: MenuItemType, fromKeyboard?: boolean) => void;
  onMegaClose: () => void;
}

/** Kök altındaki kılavuz çizgisi ikonun ortasından (24px), daha derin seviyeler üst satırın metin başından (12px) iner. */
const NESTED_INDENT_CLASS: Record<SidebarPosition, { root: string; deep: string }> = {
  left: { root: "ml-6", deep: "ml-3" },
  right: { root: "mr-6", deep: "mr-3" },
};

const FOCUS_RING = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring";

function ItemIcon({ item, showMonogram, reserveIconSlot }: Pick<SidebarItemProps, "item" | "showMonogram" | "reserveIconSlot">) {
  if (item.icon) {
    return (
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center [&_svg]:size-[1.125rem]">
        {item.icon}
      </span>
    );
  }
  // İkonu olmayan öğeye uydurma bir ikon koymak yerine rayda baş harfi.
  if (showMonogram) {
    return (
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center rounded-sm bg-mari-surface-alt text-[0.6875rem] font-semibold uppercase">
        {item.title.charAt(0)}
      </span>
    );
  }
  return reserveIconSlot ? <span aria-hidden="true" className="size-5 shrink-0" /> : null;
}

interface RowStateOptions {
  level: number;
  collapsed?: boolean;
  disabled?: boolean;
  /** Dolgu + renk: aktif yaprak, ya da daraltılmış rayda aktif grubu / açık mega paneli temsil eden kök. */
  highlighted: boolean;
  /** Sadece renk: aktif yaprağı içeren (açık) grup. */
  containsActive: boolean;
  color: ColorRole;
}

function getRowStateClass({ disabled, highlighted, containsActive, color }: RowStateOptions): string {
  if (disabled) return "cursor-not-allowed opacity-50";
  if (highlighted) return cn("cursor-pointer font-medium", bgSubtleClass[color], textClass[color]);
  if (containsActive) return cn("cursor-pointer font-medium hover:bg-mari-surface-alt", textClass[color]);
  return "cursor-pointer text-mari-foreground/80 hover:bg-mari-surface-alt hover:text-mari-foreground";
}

function getRowClass(options: RowStateOptions): string {
  return cn(
    "relative flex w-full items-center rounded-lg text-start text-sm transition-colors duration-150",
    // Daraltılmış rayda satır tam ikon genişliğinde: boşluk + chevron kalsaydı içerik satırı
    // taşırıyor, `nav` yatayda kayıyor ve ikonlar sola kaçıyordu.
    options.collapsed ? "gap-0" : "gap-3",
    options.level === 0 ? "h-10 px-3.5" : "h-9 px-3",
    FOCUS_RING,
    getRowStateClass(options)
  );
}

interface RowContentProps extends Pick<SidebarItemProps, "item" | "collapsed" | "reserveIconSlot" | "position"> {
  showMonogram: boolean;
  /** `accordion`: aşağı chevron (açıkken döner); `flyout`: panel yönünü gösteren yan chevron. */
  chevron?: "accordion" | "flyout";
  open?: boolean;
}

function RowContent({ item, collapsed, reserveIconSlot, position, showMonogram, chevron, open }: RowContentProps) {
  const FlyoutChevron = position === "left" ? ChevronRightIcon : ChevronLeftIcon;
  return (
    <>
      <ItemIcon item={item} showMonogram={showMonogram} reserveIconSlot={reserveIconSlot} />
      <span className={cn("min-w-0 flex-1 truncate transition-opacity duration-150", collapsed ? "opacity-0" : "opacity-100")}>{item.title}</span>
      {chevron === "accordion" && (
        <ChevronDownIcon aria-hidden="true" size={16} className={cn("shrink-0 text-mari-muted transition-transform duration-200", open && "rotate-180", collapsed && "hidden")} />
      )}
      {chevron === "flyout" && <FlyoutChevron aria-hidden="true" size={16} className={cn("shrink-0 text-mari-muted", collapsed && "hidden")} />}
    </>
  );
}

/**
 * `dropdown` modu: satırın kendisi tetikleyici — panel TAM o satırın yanında
 * açılır (eskiden tetikleyicisiz bir Dropdown'ın satırın ALTINA düşen sıfır
 * yükseklikli çıpasına hizalanıyordu). İçerik BasicMenu'nün alt menü paneliyle aynı.
 */
function SidebarDropdownItem(props: SidebarItemProps) {
  const { item, activeKey, setActiveKey, color, collapsed, showMonogram, position, onNavigate, currentPath } = props;
  const children = item.children ?? [];
  const containsActive = isMenuItemActive(item, activeKey);
  const rowClass = getRowClass({ level: 0, collapsed, highlighted: collapsed && containsActive, containsActive, color });

  return (
    <li>
      <Dropdown hover className="block self-auto">
        <DropdownTrigger className={cn(rowClass, "aria-expanded:bg-mari-surface-alt")}>
          <RowContent {...props} showMonogram={showMonogram} chevron="flyout" />
        </DropdownTrigger>
        <DropdownContent
          placement={position === "left" ? "right-start" : "left-start"}
          offset={10}
          className={cn("max-w-[calc(100vw-2rem)] rounded-xl p-2", getSubMenuPanelWidthClass(children))}
        >
          <SubMenuPanelBody items={children} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} currentPath={currentPath} />
        </DropdownContent>
      </Dropdown>
    </li>
  );
}

/**
 * Sidebar satırı. Yapı modern yan menülerden (Linear/Vercel/GitHub): sabit
 * 20px ikon yuvası + etiket + sağa yaslı chevron; aktif yaprak = rol renginin
 * `-subtle` zemini + rengin kendisi, aktif yaprağı İÇEREN üst öğe = sadece
 * renk (eskiden `li`nin tamamı boyanıyordu, açık bir grup komple mavi bir
 * blok gibi görünüyordu).
 *
 * Ray daraltılmışken etiket kesilmiyor, SOLUYOR (eskiden `w-12` içinde yarım
 * harfler görünüyordu); erişilebilir ad metin DOM'da kaldığı için bozulmaz.
 */
export function SidebarItem(props: SidebarItemProps) {
  const hasChildren = !!props.item.children?.length;
  // Kök seviyede alt menü dropdown/mega olabilir; iç seviyeler hep akordeon.
  const mode: SidebarSubMode = props.level === 0 ? props.subMode : "accordion";
  if (hasChildren && mode === "dropdown" && !props.item.disabled) return <SidebarDropdownItem {...props} />;
  return mode === "mega" ? <SidebarMegaItem {...props} /> : <SidebarAccordionItem {...props} />;
}

/** `mega` modunun kök satırı: hover/odak paneli açar, Enter odağı panele taşır. */
function SidebarMegaItem(props: SidebarItemProps) {
  const { item, activeKey, color, collapsed, showMonogram, megaKey, onMegaOpen, onMegaClose, onSelect } = props;
  const hasChildren = !!item.children?.length;
  const containsActive = isMenuItemActive(item, activeKey);
  const isActiveLeaf = !hasChildren && item.key === activeKey;
  const isOpen = megaKey === item.key;
  const hoverOrFocus = item.disabled ? undefined : () => (hasChildren ? onMegaOpen(item) : onMegaClose());

  return (
    <li>
      <button
        type="button"
        data-sidebar-key={item.key}
        disabled={item.disabled}
        aria-expanded={hasChildren ? isOpen : undefined}
        aria-current={isActiveLeaf ? "page" : undefined}
        title={collapsed ? item.title : undefined}
        onMouseEnter={hoverOrFocus}
        onFocus={hoverOrFocus}
        onClick={(event) => {
          if (item.disabled) return;
          // `detail === 0`: click'i fare değil klavye üretti.
          if (hasChildren) onMegaOpen(item, event.detail === 0);
          else onSelect(item);
        }}
        className={getRowClass({ level: 0, collapsed, disabled: item.disabled, highlighted: isActiveLeaf || isOpen || (collapsed && containsActive), containsActive, color })}
      >
        <RowContent {...props} showMonogram={showMonogram} chevron={hasChildren ? "flyout" : undefined} />
      </button>
    </li>
  );
}

/** Varsayılan mod: alt öğeler satırın altında girintili bir akordeonla açılır. */
function SidebarAccordionItem(props: SidebarItemProps) {
  const { item, level, activeKey, onSelect, color, collapsed, showMonogram, tabbable, position, ...shared } = props;
  const hasChildren = !!item.children?.length;
  const containsActive = isMenuItemActive(item, activeKey);
  const isActiveLeaf = !hasChildren && item.key === activeKey;
  const [open, setOpen] = useState(containsActive);

  // Aktif öğe (route) bu grubun içine düşerse grup kendiliğinden açılır — kapatmaz.
  useEffect(() => {
    if (hasChildren && containsActive) setOpen(true);
  }, [hasChildren, containsActive]);

  const expandedBody = open && !collapsed;

  return (
    <li>
      <button
        type="button"
        data-sidebar-key={item.key}
        disabled={item.disabled}
        tabIndex={tabbable ? undefined : -1}
        aria-expanded={hasChildren ? open : undefined}
        aria-current={isActiveLeaf ? "page" : undefined}
        title={collapsed ? item.title : undefined}
        onClick={() => {
          if (item.disabled) return;
          if (hasChildren) setOpen((prev) => !prev);
          else onSelect(item);
        }}
        className={getRowClass({ level, collapsed, disabled: item.disabled, highlighted: isActiveLeaf || (collapsed && containsActive), containsActive, color })}
      >
        <RowContent {...props} showMonogram={showMonogram && level === 0} chevron={hasChildren ? "accordion" : undefined} open={open} />
      </button>

      {hasChildren && (
        // Yükseklik `grid-template-rows` 0fr→1fr ile animasyonlu: içerik ne kadar
        // uzun olursa olsun doğru açılır (eskiden sabit `max-h-96` sınırı vardı).
        <div className={cn("grid transition-[grid-template-rows,opacity] duration-200 ease-out", expandedBody ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
          <div className="overflow-hidden">
            <SidebarMenu
              {...shared}
              activeKey={activeKey}
              onSelect={onSelect}
              color={color}
              collapsed={collapsed}
              showMonogram={showMonogram}
              position={position}
              data={item.children ?? []}
              level={level + 1}
              tabbable={tabbable && expandedBody}
              className={cn("mt-0.5 border-mari-border", position === "left" ? "border-l pl-2" : "border-r pr-2", NESTED_INDENT_CLASS[position][level === 0 ? "root" : "deep"])}
            />
          </div>
        </div>
      )}
    </li>
  );
}
