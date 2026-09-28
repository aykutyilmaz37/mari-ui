"use client";

import React, { useEffect } from "react";
import { cn } from "@mari-ui/core";
import type { DropdownProps } from "./types";
import { DropdownProvider, useDropdown } from "./useDropdown";
import { getFocusable } from "./utils";

export type { DropdownProps };

/**
 * Faz 13.5 bulgusu: sarmalayıcı `role="menu"` + `tabIndex={0}` taşıyordu ama
 * hem trigger'ı HEM de içeriği kapsıyordu — `DropdownContent`in çocukları
 * gerçek `menuitem`ler değil, tamamen keyfi içerik (bkz. Dropdown.stories.tsx),
 * yani `role="menu"` semantik olarak yanlıştı ve `tabIndex={0}` anlamsız bir
 * ekstra tab durağı ekliyordu. İkisi de kaldırıldı — gerçek etkileşim zaten
 * `DropdownTrigger`in kendi `<button>`ı üzerinden klavyeyle erişilebilir.
 *
 * Eskiden ne Escape ile kapanma ne de dışarı tıklayınca kapanma vardı —
 * açık kalan bir dropdown'ı klavyeyle veya mouse'la kapatmanın tek yolu
 * trigger'a tekrar tıklamaktı. İkisi de eklendi.
 */
function DropdownRoot({ children, hover = false, className }: DropdownProps) {
  const { visible, setVisible, anchorRef, panelRef, triggerRef, scheduleHoverClose, cancelHoverClose } = useDropdown();

  useEffect(() => {
    if (!visible) return;

    // Faz 13.5 kullanıcı bulgusu (round 2): panel artık `document.body`'e
    // portal edildiğinden `anchorRef`in ALT AĞACINDA DEĞİL — bu kontrol
    // sadece `anchorRef`e bakıyor olsaydı panelin İÇİNE (örn. bir menü
    // öğesine) tıklamak bile "dışarı tıklama" sanılıp dropdown'ı ANINDA
    // kapatırdı, tıklamanın kendi `onClick`i hiç işlemeden. `panelRef` de
    // kontrol ediliyor.
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (anchorRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setVisible(false);
    };
    // Panel `body`'ye portal edildiğinden DOM sırasında tetikleyicinin
    // ardından gelmez: odak panelin İÇİNDEYKEN Escape ya da panelin
    // sınırından Tab/Shift+Tab, paneli kapatıp odağı tetikleyiciye geri verir
    // (aksi halde odak `body`nin sonunda kaybolurdu).
    const handleKeyDown = (event: KeyboardEvent) => {
      const panel = panelRef.current;
      const focusInPanel = !!panel && panel.contains(document.activeElement);

      if (event.key === "Escape") {
        setVisible(false);
        if (focusInPanel) triggerRef.current?.focus();
        return;
      }

      if (event.key === "Tab" && focusInPanel) {
        const focusable = getFocusable(panel);
        const active = document.activeElement;
        const leavingForward = !event.shiftKey && (focusable.length === 0 || active === focusable[focusable.length - 1]);
        const leavingBackward = event.shiftKey && (focusable.length === 0 || active === focusable[0] || active === panel);
        if (leavingForward || leavingBackward) {
          event.preventDefault();
          setVisible(false);
          triggerRef.current?.focus();
        }
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, setVisible, anchorRef, panelRef, triggerRef]);

  // `anchorRef` artık sadece dışarı-tıklama tespiti için değil, aynı zamanda
  // `DropdownContent`in `position: fixed` konumunu hesapladığı referans kutu
  // (bkz. DropdownContent.tsx) — bu yüzden `useDropdown()`dan geliyor,
  // `DropdownContent` da aynı ref'e erişebilsin diye.
  //
  // Faz 13.5 kullanıcı bulgusu (round 2): `onMouseLeave` eskiden ANINDA
  // `setVisible(false)` çağırıyordu — panel artık tetikleyiciden `GAP_PX`
  // kadar uzakta VE ayrı bir DOM alt ağacında (portal) olduğundan, mouse
  // tetikleyiciden panele doğru hareket ederken bu boşluğu geçerken
  // `anchorRef`in dışına çıkıyor, kullanıcı paneli görmeye fırsat
  // bulamadan menü kapanıyordu. Artık kapatma `scheduleHoverClose` ile
  // GECİKMELİ planlanıyor; mouse panele ulaşırsa (bkz. DropdownContent.tsx)
  // `cancelHoverClose` bunu iptal ediyor.
  return (
    <div
      ref={anchorRef}
      className={cn("inline-block self-start", className)}
      onMouseEnter={
        hover
          ? () => {
              cancelHoverClose();
              setVisible(true);
            }
          : undefined
      }
      onMouseLeave={hover ? scheduleHoverClose : undefined}
    >
      {children}
    </div>
  );
}

/** `DropdownProvider`ı kendi içine gömer — tüketicinin ayrıca sarması gerekmez. */
export function Dropdown(props: DropdownProps) {
  return (
    <DropdownProvider hover={props.hover}>
      <DropdownRoot {...props} />
    </DropdownProvider>
  );
}
