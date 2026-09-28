"use client";

import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Skeleton } from "../skeleton";
import { FOCUSABLE_SELECTOR, findAutofocus, useModalBehavior, usePresence } from "../lib/overlay";
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
  return (
    findAutofocus(panel) ??
    body?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
    panel.querySelector<HTMLElement>("[data-drawer-close]")
  );
}

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
  header,
  footer,
  children,
  showCloseButton = true,
  closeButtonPosition = "right",
  loading = false,
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
  useModalBehavior(open, panelRef, onClose, { closeOnEscape: keyboard, getInitialFocus: getDrawerInitialFocus });

  // Yükleniyor → içerik geldi: odak hâlâ Kapat'ta/panelde ise forma taşı.
  const wasLoading = useRef(loading);
  useEffect(() => {
    const panel = panelRef.current;
    if (open && wasLoading.current && !loading && panel) {
      const active = document.activeElement;
      if (active === panel || (active instanceof HTMLElement && active.hasAttribute("data-drawer-close"))) {
        const body = panel.querySelector<HTMLElement>("[data-drawer-body]");
        (findAutofocus(panel) ?? body?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR))?.focus();
      }
    }
    wasLoading.current = loading;
  }, [loading, open]);

  if (!present || typeof document === "undefined") return null;

  const side = isSide(position);
  const customSize = side ? width !== undefined : height !== undefined;
  const sizeStyle = getCustomSizeStyle(side, customSize, width, height);
  const hasHeader = Boolean(header || title || extra || showCloseButton);

  const closeButton = showCloseButton && (
    <button
      type="button"
      onClick={onClose}
      aria-label="Kapat"
      data-drawer-close
      className={cn(
        "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors",
        "hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
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
            <div className="min-w-0 flex-1 self-center">
              {header ?? (
                <>
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
                </>
              )}
            </div>
            {extra && <div className="flex shrink-0 items-center gap-2 self-center">{extra}</div>}
            {closeButtonPosition === "right" && closeButton}
          </div>
        )}

        <div data-drawer-body className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6", bodyClassName)}>
          {loading ? <Skeleton active paragraph={{ rows: 6 }} /> : children}
        </div>

        {footer && <div className="shrink-0 border-t border-mari-border px-4 py-3 sm:px-6">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
