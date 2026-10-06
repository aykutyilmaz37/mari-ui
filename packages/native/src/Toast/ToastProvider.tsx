import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Platform, StatusBar, View } from "react-native";
import { ToastView, type ToastAction, type ToastType } from "./Toast";
import { pushToast, resolveDuration, toastEdge, type ToastEdge, type ToastPosition } from "./utils";

export interface ToastOptions {
  title: string;
  description?: React.ReactNode;
  type?: ToastType;
  /** `top` / `bottom` (web köşe değerleri en yakın kenara eşlenir). Varsayılan: `bottom`. */
  position?: ToastPosition;
  closeIcon?: boolean;
  /** ms; `0` = kendiliğinden kapanmaz. Varsayılan 5000 (eylemliyse 8000; ekran okuyucu açıkken eylemli kapanmaz). */
  duration?: number;
  /** Tek eylem (ör. "Geri al"); basılınca Toast kapanır. */
  action?: ToastAction;
  onClose?: () => void;
  /** Veri gelene kadar iskelet; `update(id, { skeleton: false, … })` ile duyurulur ve sayaç başlar. */
  skeleton?: boolean;
}

interface ToastEntry extends Omit<ToastOptions, "duration"> {
  id: string;
  edge: ToastEdge;
  duration: number;
  exiting?: boolean;
}

export interface ToastContextValue {
  /** Gösterir, kimliğini döner. */
  showToast: (options: ToastOptions) => string;
  /** Kimlik verilmezse hepsini kapatır. */
  dismiss: (id?: string) => void;
  /** Gösterilen Toast'u günceller (ör. iskeletten veriye). */
  update: (id: string, changes: Partial<Omit<ToastOptions, "position">>) => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  /** Kenar payları (güvenli alan). Varsayılan: üst iOS 54 / Android durum çubuğu, alt iOS 34 / Android 16. */
  insets?: { top?: number; bottom?: number };
}

const ToastContext = createContext<ToastContextValue | null>(null);

let seq = 0;
const nextId = () => `toast-${++seq}`;

function useScreenReader() {
  const on = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((v) => (on.current = v)).catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener("screenReaderChanged", (v: boolean) => (on.current = v));
    return () => sub.remove();
  }, []);
  return on;
}

function Stack({ edge, toasts, inset, onClose, onRemoved }: { edge: ToastEdge; toasts: ToastEntry[]; inset: number; onClose: (id: string) => void; onRemoved: (id: string) => void }) {
  if (toasts.length === 0) return null;
  // En yeni kenara en yakın: üstte en üstte, altta en altta.
  const ordered = edge === "top" ? [...toasts].reverse() : toasts;
  return (
    <View pointerEvents="box-none" accessibilityLabel="Bildirimler" style={{ position: "absolute", left: 0, right: 0, [edge]: inset, paddingHorizontal: 16, gap: 8 }}>
      {ordered.map((t) => (
        <ToastView
          key={t.id}
          title={t.title}
          description={t.description}
          type={t.type}
          closeIcon={t.closeIcon}
          action={t.action}
          duration={t.duration}
          skeleton={t.skeleton}
          edge={edge}
          exiting={t.exiting}
          onClose={() => onClose(t.id)}
          onRemoved={() => onRemoved(t.id)}
        />
      ))}
    </View>
  );
}

/**
 * Uygulamayı sarar; `useToast()` ile Toast gösterilir. Toast'lar uygulamanın
 * üstünde, dokunuşu engellemeyen bir katmanda çizilir (RN `Modal` değil) —
 * bu yüzden açık bir Modal/BottomSheet'in ALTINDA kalır; pencere açıkken
 * bildirim gerekiyorsa pencereyi kapattıktan sonra gösterin.
 */
export function ToastProvider({ children, insets }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const closers = useRef(new Map<string, (() => void) | undefined>());
  const screenReader = useScreenReader();
  const top = insets?.top ?? (Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 8 : 54);
  const bottom = insets?.bottom ?? (Platform.OS === "ios" ? 34 : 16);

  const close = useCallback((id: string) => {
    if (!closers.current.has(id)) return; // zaten kapanıyor
    const onClose = closers.current.get(id);
    closers.current.delete(id);
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    onClose?.();
  }, []);

  const removed = useCallback((id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const showToast = useCallback(
    (options: ToastOptions) => {
      const id = nextId();
      closers.current.set(id, options.onClose);
      const entry: ToastEntry = { ...options, id, edge: toastEdge(options.position), duration: resolveDuration(options.duration, Boolean(options.action), screenReader.current) };
      setToasts((prev) => {
        const next = pushToast(prev, entry);
        // Sınır yüzünden düşenlerin onClose'u da çağrılsın.
        prev.filter((t) => !next.includes(t)).forEach((t) => closers.current.get(t.id)?.());
        prev.filter((t) => !next.includes(t)).forEach((t) => closers.current.delete(t.id));
        return next;
      });
      return id;
    },
    [screenReader]
  );

  const dismiss = useCallback((id?: string) => {
    if (id) close(id);
    else [...closers.current.keys()].forEach(close);
  }, [close]);

  const update = useCallback((id: string, changes: Partial<Omit<ToastOptions, "position">>) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...changes };
        return changes.duration === undefined && changes.action === undefined ? merged : { ...merged, duration: resolveDuration(merged.duration, Boolean(merged.action), screenReader.current) };
      })
    );
    if (changes.onClose) closers.current.set(id, changes.onClose);
  }, [screenReader]);

  const value = useMemo(() => ({ showToast, dismiss, update }), [showToast, dismiss, update]);
  const topToasts = toasts.filter((t) => t.edge === "top");
  const bottomToasts = toasts.filter((t) => t.edge === "bottom");

  return (
    <ToastContext.Provider value={value}>
      <View style={{ flex: 1 }}>
        {children}
        <Stack edge="top" toasts={topToasts} inset={top} onClose={close} onRemoved={removed} />
        <Stack edge="bottom" toasts={bottomToasts} inset={bottom} onClose={close} onRemoved={removed} />
      </View>
    </ToastContext.Provider>
  );
}

/** `ToastProvider` içinde: `const { showToast } = useToast();` */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast, ToastProvider içinde kullanılmalı.");
  return ctx;
}
