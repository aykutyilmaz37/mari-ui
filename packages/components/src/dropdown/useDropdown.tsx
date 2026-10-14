"use client";

import React, { createContext, useCallback, useContext, useId, useMemo, useRef } from "react";
import { useDisclosure } from "@mari-ui/core";

/*
 * Faz 13.5 kullanıcı bulgusu (round 2): panel `document.body`'e portal
 * edildiğinden beri (kırpma düzeltmesi) tetikleyici ile panel arasında
 * `GAP_PX` kadar bir BOŞLUK var ve panel artık `anchorRef`in DOM alt ağacında
 * DEĞİL — mouse tetikleyiciden panele doğru hareket ederken bu boşluğu
 * geçerken `anchorRef`in dışına çıkıyor, `onMouseLeave` ANINDA kapatıyor.
 * Kullanıcı paneli görmeye bile fırsat bulamadan menü kapanıyordu. Standart
 * "hover-intent" çözümü: kapatma anında değil, kısa bir gecikmeyle
 * planlanır; mouse bu süre içinde tetikleyiciye VEYA panele (ikisi de aynı
 * `cancelHoverClose`i çağırıyor) geri dönerse iptal edilir.
 */
const HOVER_CLOSE_DELAY_MS = 200;

interface DropdownContextType {
  visible: boolean;
  setVisible: (val: boolean) => void;
  /** `DropdownContent`in `position: fixed` konumunu hesaplarken referans aldığı kutu — bkz. `Dropdown.tsx`. */
  anchorRef: React.RefObject<HTMLDivElement | null>;
  /*
   * Portal edilen panelin kendi DOM düğümü. `Dropdown.tsx`'teki dışarı-tıklama
   * algılaması eskiden sadece `anchorRef`i kontrol ediyordu — panel artık
   * `document.body`'e portal edildiğinden `anchorRef`in ALT AĞACINDA DEĞİL,
   * bu yüzden panelin İÇİNE (örn. bir menü öğesine) tıklamak bile "dışarı
   * tıklama" sanılıp dropdown'ı KAPATIYORDU. Bu ref ikisinin de kontrol
   * edilebilmesi için paylaşılıyor.
   */
  panelRef: React.RefObject<HTMLDivElement | null>;
  /** Tetikleyici `<button>` — Escape/Tab ile panelden çıkılınca odak buraya döner. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  /** Panelin `id`si — tetikleyicinin `aria-controls`ü bunu gösterir. */
  panelId: string;
  /** Klavyeyle açıldıysa panel görünür olunca odağın gideceği uç (Enter/Boşluk/↓ → ilk öğe, ↑ → son öğe); `false` → odak taşınmaz. */
  focusPanelOnOpenRef: React.RefObject<false | "first" | "last">;
  /** `skeleton` açıkken tetikleyici yer tutucu çizer ve panel açılmaz. */
  skeleton: boolean;
  /** `hover` modundayken hem tetikleyici hem panel tarafından paylaşılan gecikmeli kapatma. */
  hoverMode: boolean;
  scheduleHoverClose: () => void;
  cancelHoverClose: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

/*
 * Artık `@mari-ui/core`'un `useDisclosure` hook'u üzerine kurulu. Bu
 * Provider dışa aktarılmıyor (bkz. index.ts) — eskiden `DropdownProvider`
 * `useDropdown.tsx`'te tanımlıydı ama `index.ts`'te export EDİLMİYORDU,
 * yani tüketici `Dropdown`ı kullanabilmek için derin import yapmak zorunda
 * kalıyordu. Artık `Dropdown` component'i Provider'ı
 * kendi içine gömüyor; tüketicinin bundan haberi olmasına gerek yok.
 */
export function DropdownProvider({ children, hover = false, skeleton = false }: Readonly<{ children: React.ReactNode; hover?: boolean; skeleton?: boolean }>) {
  const { isOpen, open, close } = useDisclosure();
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusPanelOnOpenRef = useRef<false | "first" | "last">(false);
  const panelId = useId();
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHoverClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  const scheduleHoverClose = useCallback(() => {
    cancelHoverClose();
    closeTimeoutRef.current = setTimeout(close, HOVER_CLOSE_DELAY_MS);
  }, [cancelHoverClose, close]);

  const value = useMemo<DropdownContextType>(
    () => ({ visible: isOpen, setVisible: (v: boolean) => (v ? open() : close()), anchorRef, panelRef, triggerRef, panelId, focusPanelOnOpenRef, hoverMode: hover, skeleton, scheduleHoverClose, cancelHoverClose }),
    [isOpen, open, close, hover, skeleton, scheduleHoverClose, cancelHoverClose, panelId]
  );
  return <DropdownContext.Provider value={value}>{children}</DropdownContext.Provider>;
}

export function useDropdown(): DropdownContextType {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown, <Dropdown> içinde kullanılmalı.");
  }
  return context;
}
