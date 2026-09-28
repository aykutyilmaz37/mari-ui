"use client";

import React, { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { ToastProps } from "./types";
import { getToastIcon } from "./utils";

export type { ToastProps };

/**
 * Faz 13.6 — eski sürümdeki sorunlar:
 * - Kapat "düğmesi" `onClick`li bir SVG'ydi: klavyeyle ulaşılamıyor, adı yoktu.
 * - Başlık `<h1>`, açıklama `<h6>`dı — sayfanın başlık hiyerarşisini bozuyordu.
 * - 5 sn sabit süre, üzerine gelince/odaklanınca DURMUYORDU (WCAG 2.2.1).
 * - Çıkış animasyonu yoktu; kaldırılınca bir anda kayboluyordu.
 *
 * Duyuru Provider'daki kalıcı canlı bölgeden yapılır (bkz. useToast.tsx) —
 * bu kart sadece görsel + etkileşimli kısım.
 */
export function Toast({ title, description, type = "none", onClose, closeIcon = true, duration, action, exiting = false }: ToastProps) {
  const icon = getToastIcon(type);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const startedAt = useRef(0);

  // Kalan süre sayacı: üzerine gelince/odak içerideyken durur, çıkınca kaldığı yerden devam eder.
  useEffect(() => {
    if (!duration || paused || exiting) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onClose?.(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [duration, paused, exiting, onClose]);

  return (
    // Fare/odak olayları sadece sayacı duraklatır; etkileşim içteki düğmelerde.
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-xl border border-mari-border bg-mari-surface p-4 shadow-mari-lg sm:w-[22rem]",
        "transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none starting:translate-y-2 starting:scale-95 starting:opacity-0",
        exiting ? "scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-mari-foreground">{title}</p>
        {description && <p className="mt-0.5 text-sm text-mari-muted">{description}</p>}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              onClose?.();
            }}
            className="mt-2 cursor-pointer rounded-sm text-sm font-medium text-mari-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
          >
            {action.label}
          </button>
        )}
      </div>
      {closeIcon && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Bildirimi kapat"
          className="-m-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring"
        >
          <XIcon size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
