"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { cn } from "@mari-ui/core";
import { Toast } from "./Toast";
import type { ToastData, ToastOptions, ToastPosition } from "./types";
import { getContainerPositionClass, isBottom } from "./utils";

const DEFAULT_DURATION = 5000;
const ACTION_DURATION = 8000;
const EXIT_MS = 200;
const MAX_PER_POSITION = 4;
const DEFAULT_POSITION: ToastPosition = "bottomRight";
const POSITIONS: ToastPosition[] = ["top", "bottom", "topLeft", "topRight", "bottomLeft", "bottomRight"];

interface ToastContextType {
  /** Toast gösterir, `id` döndürür (`dismiss` için). */
  showToast: (t: ToastOptions) => string;
  /** Belirli bir toast'u kapatır; `id` verilmezse hepsini. */
  dismiss: (id?: string) => void;
  /**
   * Açık bir toast'u günceller — ör. iskeletten içeriğe:
   * `update(id, { skeleton: false, title: "Rapor hazır", type: "success" })`.
   * İskeletten çıkınca ekran okuyucuya duyurulur ve kapanma sayacı başlar.
   */
  update: (id: string, changes: Partial<Omit<ToastOptions, "position">>) => void;
}

interface ToastEntry extends ToastData {
  exiting?: boolean;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/** Modül seviyesinde — `useCallback > setTimeout > setState > filter` iç içeliği 4'ü aşmasın. */
const withoutToast = (id: string) => (prev: ToastEntry[]) => prev.filter((t) => t.id !== id);
const markExiting = (id: string) => (prev: ToastEntry[]) => {
  if (!prev.some((t) => t.id === id && !t.exiting)) return prev;
  return prev.map((t) => (t.id === id ? { ...t, exiting: true } : t));
};

/** Canlı bölgeye okunacak metin: başlık + (düz metinse) açıklama. */
const announcementText = (t: Pick<ToastOptions, "title" | "description">) =>
  [t.title, typeof t.description === "string" ? t.description : ""].filter(Boolean).join(". ");

function ToastGroup({ position, toasts, onClose }: Readonly<{ position: ToastPosition; toasts: ToastEntry[]; onClose: (id: string) => void }>) {
  if (toasts.length === 0) return null;
  // Kenara en yakın olan en yeni — altta sıra ters çevrilir.
  const ordered = isBottom(position) ? toasts : [...toasts].reverse();
  return (
    <section
      aria-label="Bildirimler"
      className={cn("pointer-events-none fixed z-mari-toast flex flex-col gap-2", isBottom(position) ? "justify-end" : "justify-start", getContainerPositionClass(position))}
    >
      {ordered.map((t) => (
        <Toast
          key={t.id}
          title={t.title}
          description={t.description}
          type={t.type}
          closeIcon={t.closeIcon}
          action={t.action}
          duration={t.duration}
          exiting={t.exiting}
          skeleton={t.skeleton}
          onClose={() => onClose(t.id)}
        />
      ))}
    </section>
  );
}

/**
 * Faz 13.6: ekran okuyucu duyurusu için KALICI iki canlı bölge (polite +
 * assertive). Eskiden hiç yoktu — hiçbir toast duyurulmuyordu. Bölgeler hep
 * DOM'da; sadece metinleri değişir (yeni eklenen canlı bölgeyi bazı ekran
 * okuyucular kaçırır). Hata toast'ları `assertive`.
 */
export function ToastProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [announce, setAnnounce] = useState({ polite: "", assertive: "" });
  const closers = useRef(new Map<string, (() => void) | undefined>());
  const toastsRef = useRef(toasts);
  toastsRef.current = toasts;

  const announceToast = useCallback((t: ToastOptions) => {
    const text = announcementText(t);
    setAnnounce((a) => (t.type === "error" ? { ...a, assertive: text } : { ...a, polite: text }));
  }, []);

  const remove = useCallback((id: string) => {
    if (!closers.current.has(id)) return; // zaten kapanıyor
    setToasts(markExiting(id));
    const onClose = closers.current.get(id);
    closers.current.delete(id);
    onClose?.();
    setTimeout(() => setToasts(withoutToast(id)), EXIT_MS);
  }, []);

  const showToast = useCallback((options: ToastOptions) => {
    const id = crypto.randomUUID();
    const duration = options.duration ?? (options.action ? ACTION_DURATION : DEFAULT_DURATION);
    closers.current.set(id, options.onClose);
    setToasts((prev) => {
      const position = options.position ?? DEFAULT_POSITION;
      const next = [...prev, { ...options, id, duration, position }];
      // Konum başına en fazla N görünür — en eskiler düşer.
      const same = next.filter((t) => (t.position ?? DEFAULT_POSITION) === position && !t.exiting);
      const overflow = same.slice(0, Math.max(0, same.length - MAX_PER_POSITION)).map((t) => t.id);
      return next.filter((t) => !overflow.includes(t.id));
    });
    // İskeletteki içerik yer tutucu — duyurulmaz; veri gelince `update` duyurur.
    if (!options.skeleton) announceToast(options);
    return id;
  }, [announceToast]);

  const update = useCallback((id: string, changes: Partial<Omit<ToastOptions, "position">>) => {
    const current = toastsRef.current.find((t) => t.id === id);
    if (!current || current.exiting) return;
    const next = { ...current, ...changes };
    if (changes.onClose !== undefined) closers.current.set(id, changes.onClose);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...changes } : t)));
    const contentChanged = current.skeleton || changes.title !== undefined || changes.description !== undefined;
    if (!next.skeleton && contentChanged) announceToast(next);
  }, [announceToast]);

  const dismiss = useCallback(
    (id?: string) => {
      if (id) remove(id);
      else toastsRef.current.forEach((t) => remove(t.id));
    },
    [remove]
  );

  const contextValue = useMemo(() => ({ showToast, dismiss, update }), [showToast, dismiss, update]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {POSITIONS.map((position) => (
        <ToastGroup key={position} position={position} toasts={toasts.filter((t) => (t.position ?? DEFAULT_POSITION) === position)} onClose={remove} />
      ))}
      <div aria-live="polite" role="status" className="sr-only">
        {announce.polite}
      </div>
      <div aria-live="assertive" role="alert" className="sr-only">
        {announce.assertive}
      </div>
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
