"use client";

import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { SubMenuPanelBody } from "../../basic-menu/_components/DropdownSubMenu";
import { MegaPanel } from "../../_shared";
import { MegaPanelColumn } from "../../_shared/_components/MegaPanelColumn";
import type { MenuItemType, MenuNavigationProps, SidebarPosition } from "../../types";

export interface SidebarMegaPanelProps extends MenuNavigationProps {
  item: MenuItemType;
  activeKey: string | null;
  setActiveKey: (key: string) => void;
  color: ColorRole;
  position: SidebarPosition;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

type MegaShape = "rail" | "columns" | "rows";

/*
 * Panel gövdesi verinin DERİNLİĞİNE göre seçilir (eskiden her durumda
 * `MegaPanel`e veriliyordu — o "ray → grup → bağlantı" yani 4 seviye bekler;
 * 3 seviyede gruplar raya, bağlantılar chevron'lu grup başlıklarına dönüşüyor,
 * 2 seviyede anlamsız bir "chip" şeridi çıkıyordu):
 * - `rail`: kök → ray öğesi → grup → bağlantı (MegaMenu'nün paneliyle aynı).
 * - `columns`: kök → grup → bağlantı; gruplar doğrudan kolonlara akar.
 * - `rows`: kök → bağlantı; açıklamalı satırlar (BasicMenu'nün alt menü paneli).
 */
function getMegaShape(children: MenuItemType[]): MegaShape {
  if (children.some((child) => child.children?.some((grandchild) => grandchild.children?.length))) return "rail";
  if (children.some((child) => child.children?.length)) return "columns";
  return "rows";
}

function getWidthClass(shape: MegaShape, count: number): string {
  if (shape === "rail") return "w-[44rem]";
  if (shape === "columns") return count > 4 ? "w-[44rem]" : "w-[32rem]";
  return count > 4 ? "w-[38rem]" : "w-[24rem]";
}

/** `mega` modunda sidebar'ın yanında tam yükseklikte açılan panel. */
export const SidebarMegaPanel = React.forwardRef<HTMLDivElement, SidebarMegaPanelProps>(function SidebarMegaPanel(
  { item, activeKey, setActiveKey, color, position, onClose, onMouseEnter, onMouseLeave, onNavigate, currentPath },
  ref
) {
  const children = item.children ?? [];
  const shape = getMegaShape(children);

  return (
    <div
      ref={ref}
      role="region"
      aria-label={item.title}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "h-full max-w-[calc(100vw-5rem)] shrink overflow-y-auto overscroll-contain border-mari-border bg-mari-surface p-6 shadow-mari-lg transition-[opacity,translate] duration-200 ease-out starting:opacity-0",
        position === "right" ? "border-l starting:translate-x-2" : "border-r starting:-translate-x-2",
        getWidthClass(shape, children.length)
      )}
    >
      <div className="mb-4 text-base font-semibold text-mari-foreground">{item.title}</div>
      {shape === "rail" && (
        <MegaPanel
          items={children}
          layout="compact"
          orientation="horizontal"
          color={color}
          onNavigate={onNavigate}
          activeKey={activeKey}
          onItemClick={(picked) => {
            setActiveKey(picked.key);
            onClose();
          }}
        />
      )}
      {shape === "columns" && (
        <div className={cn("gap-8", children.length > 4 ? "columns-3" : "columns-2")}>
          {children.map((group) => (
            <MegaPanelColumn
              key={group.key}
              group={group}
              color={color}
              onNavigate={onNavigate}
              activeKey={activeKey}
              onItemClick={(picked) => {
                setActiveKey(picked.key);
                onClose();
              }}
            />
          ))}
        </div>
      )}
      {shape === "rows" && (
        <SubMenuPanelBody items={children} activeKey={activeKey} setActiveKey={setActiveKey} color={color} onNavigate={onNavigate} currentPath={currentPath} onAfterSelect={onClose} />
      )}
    </div>
  );
});
