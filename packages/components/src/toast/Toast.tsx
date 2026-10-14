"use client";

import React, { useEffect, useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { SkeletonBlock } from "../skeleton";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { touchTargetClass } from "../lib/sizeClasses";
import type { ToastProps } from "./types";
import { getToastIcon } from "./utils";

export type { ToastProps };

/** Ölçülecek içerik yoksa (yerleşimsiz ortam) genel yer tutucu. */
const PLACEHOLDER = (
  <div className="flex flex-col gap-2 py-0.5">
    <SkeletonBlock active width="55%" height="0.875rem" radius="sm" />
    <SkeletonBlock active width="80%" height="0.75rem" radius="sm" />
  </div>
);

/**
 * Faz 13.6 — eski sürümdeki sorunlar:
 * - Kapat "düğmesi" `onClick`li bir SVG'ydi: klavyeyle ulaşılamıyor, adı yoktu.
 * - Başlık `<h1>`, açıklama `<h6>`dı — sayfanın başlık hiyerarşisini bozuyordu.
 * - 5 sn sabit süre, üzerine gelince/odaklanınca DURMUYORDU (WCAG 2.2.1).
 * - Çıkış animasyonu yoktu; kaldırılınca bir anda kayboluyordu.
 *
 * Duyuru Provider'daki kalıcı canlı bölgeden yapılır (bkz. useToast.tsx) —
 * bu kart sadece görsel + etkileşimli kısım.
 *
 * Faz 15.6 — `skeleton` (ikon/başlık/açıklama/aksiyon `ContentSkeleton`,
 * Kapat canlı, sayaç durur); Kapat (28px) ve aksiyon bağlantısı (20px)
 * dokunmatikte 44px hedef.
 */
export function Toast({ title, description, type = "none", onClose, closeIcon = true, duration, action, exiting = false, skeleton = false }: Readonly<ToastProps>) {
  const icon = getToastIcon(type);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(duration ?? 0);
  const startedAt = useRef(0);

  // Kalan süre sayacı: üzerine gelince/odak içerideyken durur, çıkınca kaldığı yerden devam eder.
  // İskeletteyken işlemez — veri gelmeden kapanmasın.
  useEffect(() => {
    if (!duration || paused || exiting || skeleton) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => onClose?.(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt.current;
    };
  }, [duration, paused, exiting, skeleton, onClose]);

  return (
    // Fare/odak olayları sadece sayacı duraklatır; etkileşim içteki düğmelerde.
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
      aria-busy={skeleton || undefined}
      className={cn(
        "pointer-events-auto relative flex w-full items-start gap-3 rounded-xl border border-mari-border bg-mari-surface p-4 shadow-mari-lg sm:w-[22rem]",
        "transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none starting:translate-y-2 starting:scale-95 starting:opacity-0",
        exiting ? "scale-95 opacity-0" : "translate-y-0 scale-100 opacity-100"
      )}
    >
      <ContentSkeleton on={skeleton} fallback={PLACEHOLDER} className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 items-start gap-3">
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
                className={cn(
                  "relative mt-2 cursor-pointer rounded-sm text-sm font-medium text-mari-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
                  touchTargetClass.xs
                )}
              >
                {action.label}
              </button>
            )}
          </div>
        </div>
      </ContentSkeleton>
      {closeIcon && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Bildirimi kapat"
          className={cn(
            "relative -m-1 inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
            // 28px → 44px (her yönde 8px); hazır tablolar 24/32px'lik kontroller için.
            "pointer-coarse:before:absolute pointer-coarse:before:-inset-2"
          )}
        >
          <XIcon size={16} aria-hidden />
        </button>
      )}
    </div>
  );
}
