"use client";

import React, { useState } from "react";
import { cn } from "@mari-ui/core";
import { MegaPanel } from "../_shared";
import type { MenuColorProps, MenuItemType, MenuNavigationProps, SidebarPosition, SidebarVariant } from "../types";
import { getSidebarWidthClass } from "../utils";
import { SidebarButton } from "./_components/SidebarButton";
import { SidebarMenu } from "./_components/SidebarMenu";

export interface SidebarProps extends MenuNavigationProps, MenuColorProps {
  data: MenuItemType[];
  variant?: SidebarVariant;
  position?: SidebarPosition;
  onlyIcon?: boolean;
  dropdown?: boolean;
  mega?: boolean;
  /** Eskiden varsayılan değeri hardcoded `/images/fb.png` idi — bir
   * kütüphanenin varsayılanı olarak marka varlığı barındırmak yanlıştı
   * (bkz. plan denetimi). Artık verilmezse hiç logo render edilmez. */
  logo?: React.ReactNode;
  onLogoClick?: () => void;
  /**
   * Logo/ayırıcı bloğunun ÜSTÜNDE render edilen keyfi içerik — mobil drawer
   * tarzı bir "Merhaba, {isim}" başlığı için (bkz. `MobileDrawerPattern`
   * story'si). Sidebar tüketicinin auth/kullanıcı durumundan habersiz kalır;
   * tüketici kendi `Avatar`ını + metnini burada geçirir.
   */
  header?: React.ReactNode;
}

/**
 * Eskiden `types.ts`'te `SidebarProps` `export` edilmeden tanımlanmıştı ama
 * `sidebar/index.ts` onu `export type { SidebarProps }` ile dışa aktarmaya
 * çalışıyordu — gerçek bir derleme hatasıydı (bkz. plan denetimi). Artık
 * doğrudan burada, export edilerek tanımlanıyor.
 */
export function Sidebar({ data, variant = "hover", position = "left", onlyIcon = false, dropdown = false, mega = false, logo, onLogoClick, header, color = "primary", onNavigate, currentPath }: SidebarProps) {
  const [visible, setVisible] = useState(false);
  const [subItem, setSubItem] = useState<MenuItemType[] | undefined>();
  const [subVisible, setSubVisible] = useState(false);

  const handleMouseEnter = () => setVisible(true);
  const handleMouseLeave = () => {
    setVisible(false);
    setSubVisible(false);
  };

  // Faz 13.5 bulgusu: sarmalayıcı eskiden `w-full` taşıyordu — `aside` (ve
  // yanındaki dropdown/mega panelleri) kendi genişliğine sahip olsa da (bkz.
  // `getSidebarWidthClass`), bu `fixed` + `w-full` sarmalayıcı TÜM viewport
  // genişliğini kaplıyordu ve arkasındaki sayfa içeriğinin TAMAMEN
  // TIKLANAMAZ hale gelmesine yol açıyordu (görsel olarak görünmez ama
  // pointer event'leri yutuyordu — `elementFromPoint` ile doğrulandı).
  // `fixed` + tek taraflı `left`/`right` zaten genişliği içeriğe göre daraltır,
  // `w-full` hiç gerekli değildi.
  return (
    <div className={cn("fixed flex top-0 z-mari-drawer h-full overflow-auto transition-all duration-500", position === "right" && "right-0 flex-row-reverse", position === "left" && "left-0")}>
      <aside
        onMouseEnter={variant === "hover" && !onlyIcon ? handleMouseEnter : undefined}
        onMouseLeave={variant === "hover" && !onlyIcon ? handleMouseLeave : undefined}
        className={cn(
          "h-full max-w-5xl bg-mari-surface transition-all duration-500 py-4",
          position === "right" && "border-l-2 border-mari-border",
          position === "left" && "border-r-2 border-mari-border",
          dropdown && visible ? "overflow-visible" : "overflow-auto",
          getSidebarWidthClass(variant, visible)
        )}
      >
        {header && <div className="overflow-hidden px-1 pb-2 whitespace-nowrap">{header}</div>}
        {logo && (
          <div className="w-12 flex-col items-center justify-center h-12">
            <button type="button" className="cursor-pointer" onClick={onLogoClick}>
              {logo}
            </button>
          </div>
        )}
        <div className="min-h-0.5 w-full bg-mari-border" />
        <nav>
          <SidebarMenu data={data} setSubItem={setSubItem} setSubVisible={setSubVisible} visible={visible} mega={mega} dropdown={dropdown} position={position} color={color} onNavigate={onNavigate} currentPath={currentPath} />
        </nav>
      </aside>
      {subItem && (
        <div
          onMouseEnter={() => setSubVisible(true)}
          onMouseLeave={() => setSubVisible(false)}
          className={cn(
            "h-full overflow-hidden bg-mari-surface-alt transition-all duration-300 ease-in-out",
            subVisible ? "w-full max-w-3xl p-4 opacity-100" : "w-0 opacity-0"
          )}
        >
          <MegaPanel items={subItem} layout="compact" orientation="vertical" color={color} onNavigate={onNavigate} />
        </div>
      )}
      {variant === "click" && <SidebarButton visible={visible} setVisible={setVisible} position={position} />}
    </div>
  );
}
