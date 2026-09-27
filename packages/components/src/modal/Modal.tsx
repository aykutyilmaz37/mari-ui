"use client";

import React, { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../button";
import { FOCUSABLE_SELECTOR, findAutofocus, useModalBehavior, usePresence } from "../lib/overlay";
import type { ModalProps } from "./types";
import { renderModalIcon, sizeMap } from "./utils";

export type { ModalProps };

const EXIT_MS = 200;

/**
 * İlk odak: `initialFocus` → data-autofocus → (yıkıcı onayda) Vazgeç →
 * gövdedeki ilk alan → Vazgeç → Kapat → panel.
 */
function getModalInitialFocus(panel: HTMLElement, isAlert: boolean, preferred?: "cancel" | "confirm"): HTMLElement | null {
  const cancel = panel.querySelector<HTMLElement>("[data-modal-cancel]");
  const confirm = panel.querySelector<HTMLElement>("[data-modal-confirm]");
  const body = panel.querySelector<HTMLElement>("[data-modal-body]");
  const explicit = preferred ? { confirm, cancel }[preferred] : null;
  return (
    explicit ??
    findAutofocus(panel) ??
    (isAlert ? cancel : null) ??
    body?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
    cancel ??
    panel.querySelector<HTMLElement>("[data-modal-close]")
  );
}

function FooterButtons({
  position,
  cancelText,
  confirmText,
  onCancel,
  onConfirm,
  color,
  loading,
  disabled,
}: {
  position: ModalProps["footerButtonPosition"];
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  color: ModalProps["color"];
  loading: boolean;
  disabled: boolean;
}) {
  return (
    // Mobilde düğmeler tam genişlik ve alt alta (birincil altta, başparmak erişiminde).
    <div className={cn("flex flex-col-reverse gap-2 sm:flex-row", position === "left" ? "sm:justify-start" : "sm:justify-end")}>
      {cancelText && (
        <Button variant="outline" color="neutral" onClick={onCancel} data-modal-cancel className="w-full sm:w-auto">
          {cancelText}
        </Button>
      )}
      {confirmText && (
        <Button color={color === "neutral" || !color ? "primary" : color} onClick={onConfirm} loading={loading} disabled={disabled} data-modal-confirm className="w-full sm:w-auto">
          {confirmText}
        </Button>
      )}
    </div>
  );
}

/**
 * Faz 9 temel ARIA'yı düzeltmişti (role=dialog, Escape, odağı geri verme).
 * Faz 13.6 — yapı ant.design Modal'dan, overlay davranışı Drawer ile ortak
 * (`lib/overlay.ts`). Eski sürümde kalanlar:
 * - Odak tuzağı YOKTU (belgede "focus-trap" yazmasına rağmen Tab dışarı
 *   kaçıyordu); sayfa kaydırması kilitlenmiyordu; portal yoktu.
 * - Uzun içerik ekrandan taşıyordu — artık gövde kendi içinde kayar.
 * - `title` zorunlu string'di; açıklama, özel footer, genişlik yoktu.
 * - Async onay için yükleniyor durumu, yıkıcı onay için `alertdialog` yoktu.
 * - Kapalıyken `inert` ile DOM'da kalıyordu; artık kapanış animasyonundan
 *   sonra unmount.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  color,
  children,
  showCloseButton = true,
  closeButtonPosition = "right",
  footer,
  footerButtonPosition = "right",
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  confirmLoading,
  confirmDisabled = false,
  initialFocus,
  size = "md",
  width,
  maskClosable = true,
  keyboard = true,
  "aria-label": ariaLabel,
  className,
  bodyClassName,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const [pending, setPending] = useState(false);
  const present = usePresence(open, EXIT_MS);

  const hasButtons = Boolean(confirmButtonText || cancelButtonText);
  const isAlert = (color === "error" || color === "warning") && Boolean(confirmButtonText);

  useModalBehavior(open, panelRef, onClose, {
    closeOnEscape: keyboard,
    getInitialFocus: (panel) => getModalInitialFocus(panel, isAlert, initialFocus),
  });

  if (!present || typeof document === "undefined") return null;

  const handleConfirm = async () => {
    const result = onConfirm?.();
    if (result instanceof Promise) {
      setPending(true);
      try {
        await result;
      } finally {
        setPending(false);
      }
    }
  };

  const iconNode = renderModalIcon(color, icon);
  const loading = confirmLoading ?? pending;

  const closeButton = showCloseButton && (
    <button
      type="button"
      onClick={onClose}
      aria-label="Kapat"
      data-modal-close
      className={cn(
        "absolute top-3 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors",
        "hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        closeButtonPosition === "left" ? "left-3" : "right-3"
      )}
    >
      <XIcon size={18} aria-hidden />
    </button>
  );

  const defaultFooter = hasButtons && (
    <FooterButtons
      position={footerButtonPosition}
      cancelText={cancelButtonText}
      confirmText={confirmButtonText}
      onCancel={onCancel ?? onClose}
      onConfirm={handleConfirm}
      color={color}
      loading={loading}
      disabled={confirmDisabled}
    />
  );
  const footerNode = footer === undefined ? defaultFooter : footer;

  return createPortal(
    <div className={cn("fixed inset-0 z-mari-modal", !open && "pointer-events-none")}>
      <div
        aria-hidden
        onClick={maskClosable ? onClose : undefined}
        className={cn(
          "absolute inset-0 bg-mari-scrim transition-opacity duration-200 motion-reduce:transition-none starting:opacity-0",
          open ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Kaydırılabilir yerleşim katmanı: çok uzun modal ekranı aşarsa gövde kayar. */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-3 sm:items-center sm:p-6">
        <div
          ref={panelRef}
          role={isAlert ? "alertdialog" : "dialog"}
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-label={title ? undefined : ariaLabel}
          aria-describedby={description ? descriptionId : undefined}
          tabIndex={-1}
          style={width !== undefined ? { maxWidth: width } : undefined}
          // Tailwind v4'te translate-*/scale-* ayrı `translate`/`scale` CSS
          // özelliklerini yazar, `transform`u değil — geçiş listesinde onlar
          // olmalı. Eskiden `transition-[opacity,transform]` vardı: kapanışta
          // panel ilk karede aniden kayıp küçülüyor, sadece opaklık yumuşak
          // soluyordu ("kapatırken tekliyor" kullanıcı bulgusu). Aynı hata
          // Card hover, MegaMenu ve MobileNavLevel'da da düzeltildi.
          className={cn(
            "pointer-events-auto relative flex max-h-[calc(100dvh-1.5rem)] w-full flex-col rounded-xl border border-mari-border bg-mari-surface text-mari-foreground shadow-mari-xl outline-none sm:max-h-[calc(100dvh-3rem)]",
            "transition-[opacity,translate,scale] duration-200 ease-out motion-reduce:transition-none starting:translate-y-2 starting:scale-[0.98] starting:opacity-0",
            open ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0",
            width === undefined && sizeMap[size],
            className
          )}
        >
          {closeButton}

          {(title || description || iconNode) && (
            <div className={cn("flex shrink-0 gap-4 px-6 pt-6", showCloseButton && (closeButtonPosition === "left" ? "pl-14" : "pr-14"))}>
              {iconNode}
              <div className="min-w-0 flex-1 self-center">
                {title && (
                  <h2 id={titleId} className="text-lg font-semibold leading-7 text-mari-foreground">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-mari-muted">
                    {description}
                  </p>
                )}
              </div>
            </div>
          )}

          {children !== undefined && children !== null && (
            <div
              data-modal-body
              className={cn(
                "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 text-sm text-mari-foreground",
                // Durum ikonu varsa gövde başlıkla hizalı (ikon + boşluk kadar içeride).
                iconNode && "sm:pl-20",
                // Footer varken de küçük bir alt pay: satır içi dolgu ya da kenardaki
                // alanın odak halkası 1-2px taşıp gereksiz kaydırma çubuğu açmasın.
                footerNode ? "pb-1" : "pb-6",
                bodyClassName
              )}
            >
              {children}
            </div>
          )}

          {footerNode && <div className="shrink-0 px-6 pb-6 pt-5">{footerNode}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}
