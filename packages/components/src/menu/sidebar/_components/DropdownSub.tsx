import React from "react";
import { type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent } from "../../../dropdown";
import { MegaPanel } from "../../_shared";
import type { MenuItemType, MenuNavigationProps, SidebarPosition } from "../../types";
import { SidebarMenu } from "./SidebarMenu";

export interface DropdownSubProps extends MenuNavigationProps {
  item: MenuItemType;
  setSubVisible: (value: boolean) => void;
  subVisible: boolean;
  position?: SidebarPosition;
  color: ColorRole;
}

/** `Dropdown` kendi Provider'ını içinde barındırıyor — eskiden burada da
 * AYRICA bir `<DropdownProvider>` sarmalayıcısı vardı, gereksizdi. */
export function DropdownSub({ item, setSubVisible, subVisible, position = "left", color, onNavigate, currentPath }: DropdownSubProps) {
  if (!item.children) return null;

  // 2026-09-22: `DropdownSubMenu` (BasicMenu) ile aynı veri-şekli dallanması
  // — gerçek 3. seviye varsa ray+kolon paneli (`MegaPanel`, `layout="compact"
  // orientation="vertical"`: ray üstte, kolonlar altta — sidebar'dan yana
  // açılan dar bir panelde ray+kolon YAN YANA sığmaz). Aksi halde bugünkü
  // düz `SidebarMenu` liste render'ı korunur.
  const isRich = item.children.some((child) => child.children && child.children.length > 0);

  // Faz 13.5 bulgusu: `role="menu"` + `tabIndex={0}` içerik gerçek bir ARIA
  // menü deseni (ok tuşlarıyla gezinme, roving tabindex) UYGULAMADIĞI halde
  // ekran okuyucuya "bu bir menü" mesajı veriyordu — yanıltıcı. İçerik aslında
  // düz bir `<ul>`/`<button>` listesi (bkz. `SidebarMenu`), kendi klavye
  // erişilebilirliğini zaten Tab/Enter ile sağlıyor. İkisi de kaldırıldı.
  return (
    <div onMouseEnter={() => setSubVisible(true)} onMouseLeave={() => setSubVisible(false)}>
      {/* Faz 13.5 kullanıcı bulgusu: `w-full` eskiden `DropdownContent`in
          `position: absolute` olduğu dönemde makul bir genişlik veriyordu —
          panel artık `position: fixed` olduğundan (bkz. dropdown/_components/
          DropdownContent.tsx'teki kırpma düzeltmesi) `w-full` VIEWPORT'UN
          TAMAMI anlamına geliyordu. Sabit bir genişliğe çevrildi. */}
      <Dropdown hover className="block self-auto">
        <DropdownContent customVisible={subVisible} placement={position === "left" ? "right" : "left"} className={isRich ? "w-80 p-1.5" : "w-56 p-1.5"}>
          {isRich ? (
            <MegaPanel items={item.children} layout="compact" orientation="vertical" color={color} onNavigate={onNavigate} />
          ) : (
            <SidebarMenu data={item.children} dropdown setSubVisible={() => {}} position={position} color={color} onNavigate={onNavigate} currentPath={currentPath} />
          )}
        </DropdownContent>
      </Dropdown>
    </div>
  );
}
