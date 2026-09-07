"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useDisclosure } from "@mari-ui/core";

interface DropdownContextType {
  visible: boolean;
  setVisible: (val: boolean) => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

/**
 * Artık `@mari-ui/core`'un `useDisclosure` hook'u üzerine kurulu. Bu
 * Provider dışa aktarılmıyor (bkz. index.ts) — eskiden `DropdownProvider`
 * `useDropdown.tsx`'te tanımlıydı ama `index.ts`'te export EDİLMİYORDU,
 * yani tüketici `Dropdown`ı kullanabilmek için derin import yapmak zorunda
 * kalıyordu (bkz. plan denetimi). Artık `Dropdown` component'i Provider'ı
 * kendi içine gömüyor; tüketicinin bundan haberi olmasına gerek yok.
 */
export function DropdownProvider({ children }: { children: React.ReactNode }) {
  const { isOpen, open, close } = useDisclosure();
  const value = useMemo<DropdownContextType>(
    () => ({ visible: isOpen, setVisible: (v: boolean) => (v ? open() : close()) }),
    [isOpen, open, close]
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
