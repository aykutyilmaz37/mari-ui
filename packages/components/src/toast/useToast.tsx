"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@mari-ui/core";
import { Toast } from "./Toast";
import type { ToastData, ToastPosition } from "./types";
import { getContainerPositionClass } from "./utils";

const TOAST_TIMEOUT = 5000;
const DEFAULT_POSITION: ToastPosition = "bottomRight";

interface ToastContextType {
  showToast: (t: Omit<ToastData, "id">) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Modül seviyesinde tanımlı — `showToast`in `setTimeout` içindeki otomatik
 * kapatması olmadan `useCallback > setTimeout > setToasts > filter` 5 kat iç
 * içe fonksiyona çıkıyordu (SonarJS `no-nested-functions`, Faz 8, sınır 4).
 */
function removeToastById(toasts: ToastData[], id: string): ToastData[] {
  return toasts.filter((t) => t.id !== id);
}

function ToastGroup({ position, toasts, onClose }: { position: ToastPosition; toasts: ToastData[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className={cn("fixed z-mari-toast flex flex-col gap-2 pointer-events-none", getContainerPositionClass(position))}>
      {toasts.map((toast) => (
        <Toast key={toast.id} title={toast.title} description={toast.description} type={toast.type} closeIcon={toast.closeIcon} onClose={() => onClose(toast.id)} />
      ))}
    </div>
  );
}

/**
 * `ToastProvider` eskiden `index.ts`'te export EDİLMİYORDU (bkz. plan
 * denetimi — Dropdown'daki `DropdownProvider` ile aynı sınıf hata).
 * Tüketici `useToast()`'ı çağırabiliyordu ama Provider'ı bulamıyordu.
 *
 * Ayrıca eskiden `<div className="static z-[9999]">` içinde her toast
 * bağımsız `absolute` konumlanıyordu — `position: static` bir positioning
 * context OLUŞTURMADIĞI için `absolute` çocuklar en yakın konumlanmış
 * ATA'ya (genelde `<body>`) göre yerleşiyordu; üstelik aynı köşedeki 2+
 * toast TAM AYNI koordinatta üst üste biniyordu (stacking mantığı yoktu).
 * Artık her konum için ayrı bir `fixed` + `flex flex-col gap-2` kap
 * (`ToastGroup`) render ediliyor — toast'lar doğal olarak istifleniyor.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((toast: Omit<ToastData, "id">) => {
    // Eskiden `Date.now() + Math.random()` idi — çakışma ihtimali pratikte
    // sıfıra yakın olsa da, ID üretmek için `crypto.randomUUID()` zaten bu
    // projenin kendi kuralı (bkz. Faz 3 — `uuid` paketinin kaldırılıp aynı
    // yerleşik API'ye taşınması); SonarJS bu tutarsızlığı haklı yakaladı.
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => removeToastById(prev, id));
    }, TOAST_TIMEOUT);
  }, []);

  const handleClose = useCallback((id: string) => {
    setToasts((prev) => removeToastById(prev, id));
  }, []);

  const contextValue = useMemo(() => ({ showToast }), [showToast]);

  const positions: ToastPosition[] = ["top", "bottom", "topLeft", "topRight", "bottomLeft", "bottomRight"];

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {positions.map((position) => (
        <ToastGroup key={position} position={position} toasts={toasts.filter((t) => (t.position ?? DEFAULT_POSITION) === position)} onClose={handleClose} />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast, <ToastProvider> içinde kullanılmalı.");
  }
  return context;
}
