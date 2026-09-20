import React from "react";
import { type ColorRole } from "@mari-ui/core";
import { Dropdown, DropdownContent } from "../../../dropdown";
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
        <DropdownContent customVisible={subVisible} placement={position === "left" ? "right" : "left"} className="w-56 p-1.5">
          <SidebarMenu data={item.children} dropdown setSubVisible={() => {}} position={position} color={color} onNavigate={onNavigate} currentPath={currentPath} />
        </DropdownContent>
      </Dropdown>
    </div>
  );
}
