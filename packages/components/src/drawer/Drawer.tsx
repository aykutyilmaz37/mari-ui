"use client";

import React, { useId, useRef } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Skeleton, SkeletonBlock } from "../skeleton";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { useScrollable } from "../lib/useScrollable";
import { touchTargetSquareClass } from "../lib/sizeClasses";
import { findAutofocus, firstFocusable, useModalBehavior, usePresence, useRefocusAfterSkeleton } from "../lib/overlay";
import type { DrawerProps } from "./types";
import { getPanelClass, getTranslateClass, isSide } from "./utils";

export type { DrawerProps };

const EXIT_MS = 300;

/**
 * Açılışta odak sırası: `[data-autofocus]` → gövdedeki ilk alan → Kapat →
 * panel. Başlıktaki `extra` aksiyonlarına ASLA ilk odak verilmez — Faz 13.6
 * incelemesinde yükleniyor durumunda açılan düzenleme çekmecesinde ilk odak
 * "Sil" düğmesine gidiyordu (Enter'a basan kullanıcı kaydı silebilirdi).
 */
function getDrawerInitialFocus(panel: HTMLElement): HTMLElement | null {
  const body = panel.querySelector<HTMLElement>("[data-drawer-body]");
  return findAutofocus(panel) ?? (body && firstFocusable(body)) ?? panel.querySelector<HTMLElement>("[data-drawer-close]");
}

/*
 * Ölçülecek içerik yoksa (başlık/alt çubuk da veriden geliyor ya da
 * yerleşimsiz ortam) gösterilen genel yer tutucular.
 */
const TITLE_PLACEHOLDER = (
  <div className="flex flex-col gap-2 py-1">
    <SkeletonBlock active width="45%" height="1rem" radius="sm" />
  </div>
);

/** Alt çubuğun genel iskeleti: en yaygın düzen sağa yaslı İptal / Kaydet. */
const FOOTER_PLACEHOLDER = (
  <div className="flex h-full items-center justify-end gap-2">
    <SkeletonBlock active width="4.5rem" height="2rem" />
    <SkeletonBlock active width="4.5rem" height="2rem" />
  </div>
);

/** Özel `width`/`height` — yine de ekranı taşmasın. */
function getCustomSizeStyle(side: boolean, custom: boolean, width?: number | string, height?: number | string): React.CSSProperties | undefined {
  if (!custom) return undefined;
  return side ? { width, maxWidth: "calc(100vw - 3rem)" } : { height, maxHeight: "90dvh" };
}

/**
 * Faz 13.6 — yapı ant.design Drawer'ından (başlık 16/24px dolgu + 16px/600,
 * gövde 24px, alt çubuk), görünüm kendi token'larımızdan; overlay davranışı
 * `lib/overlay.ts`'te NavDrawer ile ortak.
 *
 * Eski sürümdeki sorunlar:
 * - `role="dialog"`/`aria-modal`/erişilebilir ad yoktu; odak içeri
 *   taşınmıyor, Tab sayfaya kaçıyor, Escape kapatmıyordu.
 * - Kapalıyken DOM'da kalıyordu (sadece opacity) — içindeki düğmeler Tab ile
 *   odaklanabiliyordu. Artık kapanış animasyonundan sonra unmount.
 * - Sayfa kaydırması kilitlenmiyordu; portal yoktu (overflow/transform'lu bir
 *   atanın içinde kırpılabiliyordu).
 * - Başlık ortalıydı; yan çekmece mobilde ekranı taşıyordu (`w-96` sabit).
 * - `loading` düz "Yükleniyor..." metniydi.
 *
 * Faz 15.6 — `skeleton` artık yalnız gövdeyi değil
 * başlık/açıklama/extra/alt çubuğu da iskelete çevirir; Kapat düğmesi canlı
 * kalır. Her bölge `ContentSkeleton` ile içeriğin kendi şeklinde (satır satır
 * metin, alan alan form, düğme düğme alt çubuk) iskelete döner; gerçek içerik
 * görünmez olarak yerinde kalır → yükseklik zıplamaz.
 * Görünmez kopyalar `aria-hidden` bölgede — odak tuzağı onları atlar.
 */
export function Drawer({
  open,
  onClose,
  position = "right",
  size = "md",
  width,
  height,
  title,
  description,
  extra,
  footer,
  children,
  showCloseButton = true,
  closeButtonPosition = "right",
  skeleton = false,
  mask = true,
  maskClosable = true,
  keyboard = true,
  "aria-label": ariaLabel,
  className,
  bodyClassName,
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const present = usePresence(open, EXIT_MS);
  const bodyRef = useRef<HTMLDivElement>(null);
  const bodyScrollable = useScrollable(bodyRef, "y", [children, skeleton, present]);
  useModalBehavior(open, panelRef, onClose, { closeOnEscape: keyboard, getInitialFocus: getDrawerInitialFocus });

  // İskelet → içerik geldi: odak hâlâ Kapat'ta/panelde ise forma taşı.
  useRefocusAfterSkeleton(open, skeleton, panelRef, getDrawerInitialFocus, "[data-drawer-close]");

  if (!present || typeof document === "undefined") return null;

  const side = isSide(position);
  const customSize = side ? width !== undefined : height !== undefined;
  const sizeStyle = getCustomSizeStyle(side, customSize, width, height);
  const hasHeader = Boolean(title || extra || showCloseButton);

  const closeButton = showCloseButton && (
    <button
      type="button"
      onClick={onClose}
      aria-label="Kapat"
      data-drawer-close
      className={cn(
        "relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors",
        "hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        touchTargetSquareClass.md,
        closeButtonPosition === "left" ? "-ml-1.5" : "-mr-1.5"
      )}
    >
      <XIcon size={18} aria-hidden />
    </button>
  );

  return createPortal(
    <div className={cn("fixed inset-0 z-mari-drawer", !open && "pointer-events-none")}>
      {mask && (
        <div
          aria-hidden
          onClick={maskClosable ? onClose : undefined}
          className={cn(
            "absolute inset-0 bg-mari-scrim transition-opacity duration-300 motion-reduce:transition-none starting:opacity-0",
            open ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : ariaLabel}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={skeleton || undefined}
        tabIndex={-1}
        style={sizeStyle}
        className={cn(getPanelClass(position, size, customSize), getTranslateClass(position, open), className)}
      >
        {position === "bottom" && (
          <div aria-hidden className="flex justify-center pt-2.5">
            <span className="h-1 w-10 rounded-full bg-mari-border" />
          </div>
        )}

        {hasHeader && (
          <div className={cn("flex shrink-0 items-start gap-3 border-b border-mari-border px-4 py-4 sm:px-6", position === "bottom" && "pt-2")}>
            {closeButtonPosition === "left" && closeButton}
            <ContentSkeleton on={skeleton} fallback={TITLE_PLACEHOLDER} className="min-w-0 flex-1 self-center">
              <div className="min-w-0 flex-1 self-center">
                {title && (
                  <h2 id={titleId} className="truncate text-base font-semibold leading-6 text-mari-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-0.5 text-sm text-mari-muted">
                    {description}
                  </p>
                )}
              </div>
            </ContentSkeleton>
            {extra && (
              <ContentSkeleton on={skeleton} fallback={null} className="shrink-0 self-center">
                <div className="flex shrink-0 items-center gap-2 self-center">{extra}</div>
              </ContentSkeleton>
            )}
            {closeButtonPosition === "right" && closeButton}
          </div>
        )}

        <div
          ref={bodyRef}
          data-drawer-body
          // Taşan ve içinde odaklanabilir öğe olmayan gövde de klavyeyle kaydırılabilsin (axe scrollable-region-focusable).
          tabIndex={bodyScrollable && !skeleton ? 0 : undefined}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring",
            bodyClassName
          )}
        >
          <ContentSkeleton on={skeleton} fallback={<Skeleton active paragraph={{ rows: 6 }} />}>
            {children}
          </ContentSkeleton>
        </div>

        {footer && (
          <div className="shrink-0 border-t border-mari-border px-4 py-3 sm:px-6">
            <ContentSkeleton on={skeleton} fallback={FOOTER_PLACEHOLDER}>
              {footer}
            </ContentSkeleton>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
