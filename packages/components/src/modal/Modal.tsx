"use client";

import React, { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../button";
import { Skeleton, SkeletonBlock } from "../skeleton";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { touchTargetSquareClass } from "../lib/sizeClasses";
import { useScrollable } from "../lib/useScrollable";
import { findAutofocus, firstFocusable, reachable, useModalBehavior, usePresence, useRefocusAfterSkeleton } from "../lib/overlay";
import type { ModalProps } from "./types";
import { renderModalIcon, sizeMap } from "./utils";

export type { ModalProps };

const EXIT_MS = 200;
const CLOSE_SELECTOR = "[data-modal-close]";

/**
 * İlk odak: `initialFocus` → data-autofocus → (yıkıcı onayda) Vazgeç →
 * gövdedeki ilk alan → Vazgeç → Kapat → panel. İskelette düğmeler/alanlar
 * görünmez kopyadadır (`reachable` eler) → odak Kapat'a düşer.
 */
function getModalInitialFocus(panel: HTMLElement, isAlert: boolean, preferred?: "cancel" | "confirm"): HTMLElement | null {
  const cancel = reachable(panel.querySelector<HTMLElement>("[data-modal-cancel]"));
  const confirm = reachable(panel.querySelector<HTMLElement>("[data-modal-confirm]"));
  const body = panel.querySelector<HTMLElement>("[data-modal-body]");
  const explicit = preferred ? { confirm, cancel }[preferred] : null;
  return (
    explicit ??
    findAutofocus(panel) ??
    (isAlert ? cancel : null) ??
    (body && firstFocusable(body)) ??
    cancel ??
    panel.querySelector<HTMLElement>(CLOSE_SELECTOR)
  );
}

/** Ölçülecek içerik yoksa (başlık da veriden geliyor ya da yerleşimsiz ortam). */
const HEADER_PLACEHOLDER = (
  <div className="flex flex-col gap-2.5 py-1.5">
    <SkeletonBlock active width="50%" height="1.125rem" radius="sm" />
  </div>
);
const FOOTER_PLACEHOLDER = (
  <div className="flex justify-end gap-2">
    <SkeletonBlock active width="5rem" height="2.25rem" />
    <SkeletonBlock active width="5rem" height="2.25rem" />
  </div>
);

/** `onConfirm` Promise dönerse çözülene kadar onay düğmesi "yükleniyor". */
function useConfirm(onConfirm: ModalProps["onConfirm"]) {
  const [pending, setPending] = useState(false);
  const handleConfirm = async () => {
    const result = onConfirm?.();
    if (!(result instanceof Promise)) return;
    setPending(true);
    try {
      await result;
    } finally {
      setPending(false);
    }
  };
  return { pending, handleConfirm };
}

function ModalHeader({
  icon,
  title,
  titleId,
  description,
  descriptionId,
  closeInset,
  skeleton,
}: Readonly<{
  icon: React.ReactNode;
  title: React.ReactNode;
  titleId: string;
  description: React.ReactNode;
  descriptionId: string;
  /** Kapat düğmesinin olduğu kenar — başlık onun altına girmesin. */
  closeInset?: Exclude<ModalProps["closeButtonPosition"], undefined>;
  skeleton: boolean;
}>) {
  return (
    <div className={cn("shrink-0 px-6 pt-6", closeInset === "left" && "pl-14", closeInset === "right" && "pr-14")}>
      <ContentSkeleton on={skeleton} fallback={HEADER_PLACEHOLDER}>
        <div className="flex gap-4">
          {icon}
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
      </ContentSkeleton>
    </div>
  );
}

function ModalBody({
  indented,
  hasFooter,
  skeleton,
  className,
  children,
}: Readonly<{
  indented: boolean;
  hasFooter: boolean;
  skeleton: boolean;
  className?: string;
  children: React.ReactNode;
}>) {
  const ref = useRef<HTMLDivElement>(null);
  // Uzun metin (kullanım koşulları) kayar ama içinde odaklanabilir öğe yok →
  // klavyeyle kaydırılabilsin diye taşarken gövde Tab durağı olur.
  const scrollable = useScrollable(ref, "y", [children, skeleton]);
  return (
    <div
      ref={ref}
      data-modal-body
      tabIndex={scrollable && !skeleton ? 0 : undefined}
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-4 text-sm text-mari-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mari-ring",
        // Durum ikonu varsa gövde başlıkla hizalı (ikon + boşluk kadar içeride).
        indented && "sm:pl-20",
        // Footer varken de küçük bir alt pay: satır içi dolgu ya da kenardaki
        // alanın odak halkası 1-2px taşıp gereksiz kaydırma çubuğu açmasın.
        hasFooter ? "pb-1" : "pb-6",
        className
      )}
    >
      <ContentSkeleton on={skeleton} fallback={<Skeleton active title={false} paragraph={{ rows: 3 }} />}>
        {children}
      </ContentSkeleton>
    </div>
  );
}

function CloseButton({ onClose, position }: Readonly<{ onClose: () => void; position: ModalProps["closeButtonPosition"] }>) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Kapat"
      data-modal-close
      className={cn(
        "absolute top-3 z-10 inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-mari-muted transition-colors",
        "hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        touchTargetSquareClass.md,
        position === "left" ? "left-3" : "right-3"
      )}
    >
      <XIcon size={18} aria-hidden />
    </button>
  );
}

interface FooterButtonsProps {
  position: ModalProps["footerButtonPosition"];
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
  color: ModalProps["color"];
  loading: boolean;
  disabled: boolean;
}

/** `footer` verilmişse o (`null` = alt çubuk yok), yoksa metni verilen düğmeler. */
function resolveFooter({ footer, ...buttons }: FooterButtonsProps & { footer: React.ReactNode }): React.ReactNode {
  if (footer !== undefined) return footer;
  if (!buttons.cancelText && !buttons.confirmText) return null;
  return <FooterButtons {...buttons} />;
}

function FooterButtons({ position, cancelText, confirmText, onCancel, onConfirm, color, loading, disabled }: Readonly<FooterButtonsProps>) {
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

/*
 * Faz 9 temel ARIA'yı düzeltmişti (role=dialog, Escape, odağı geri verme).
 * yapı ant.design Modal'dan, overlay davranışı Drawer ile ortak
 * (`lib/overlay.ts`). Eski sürümde kalanlar:
 * - Odak tuzağı YOKTU (belgede "focus-trap" yazmasına rağmen Tab dışarı
 *  kaçıyordu); sayfa kaydırması kilitlenmiyordu; portal yoktu.
 * - Uzun içerik ekrandan taşıyordu — artık gövde kendi içinde kayar.
 * - `title` zorunlu string'di; açıklama, özel footer, genişlik yoktu.
 * - Async onay için yükleniyor durumu, yıkıcı onay için `alertdialog` yoktu.
 * - Kapalıyken `inert` ile DOM'da kalıyordu; artık kapanış animasyonundan
 *  sonra unmount.
 */
/**
 * `skeleton`: başlık (ikon dahil), gövde ve alt çubuk
 * `ContentSkeleton` ile içeriğin kendi şeklinde iskelete döner; Kapat ve
 * Escape çalışır, `aria-busy`. Veri gelince odak (hâlâ Kapat'taysa) normal
 * ilk odağa taşınır. Kapat düğmesi 44px dokunma hedefi.
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
  skeleton = false,
  "aria-label": ariaLabel,
  className,
  bodyClassName,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const { pending, handleConfirm } = useConfirm(onConfirm);
  const present = usePresence(open, EXIT_MS);

  const isAlert = (color === "error" || color === "warning") && Boolean(confirmButtonText);
  const getInitialFocus = (panel: HTMLElement) => getModalInitialFocus(panel, isAlert, initialFocus);

  useModalBehavior(open, panelRef, onClose, { closeOnEscape: keyboard, getInitialFocus });
  useRefocusAfterSkeleton(open, skeleton, panelRef, getInitialFocus, CLOSE_SELECTOR);

  if (!present || typeof document === "undefined") return null;

  const iconNode = renderModalIcon(color, icon);
  const footerNode = resolveFooter({
    footer,
    position: footerButtonPosition,
    cancelText: cancelButtonText,
    confirmText: confirmButtonText,
    onCancel: onCancel ?? onClose,
    onConfirm: handleConfirm,
    color,
    loading: confirmLoading ?? pending,
    disabled: confirmDisabled,
  });

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
          aria-busy={skeleton || undefined}
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
          {showCloseButton && <CloseButton onClose={onClose} position={closeButtonPosition} />}

          {(title || description || iconNode) && (
            <ModalHeader
              icon={iconNode}
              title={title}
              titleId={titleId}
              description={description}
              descriptionId={descriptionId}
              closeInset={showCloseButton ? closeButtonPosition : undefined}
              skeleton={skeleton}
            />
          )}

          {children !== undefined && children !== null && (
            <ModalBody indented={Boolean(iconNode)} hasFooter={Boolean(footerNode)} skeleton={skeleton} className={bodyClassName}>
              {children}
            </ModalBody>
          )}

          {footerNode && (
            <div className="shrink-0 px-6 pb-6 pt-5">
              <ContentSkeleton on={skeleton} fallback={FOOTER_PLACEHOLDER}>
                {footerNode}
              </ContentSkeleton>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
