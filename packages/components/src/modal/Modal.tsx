"use client";

import React, { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../button";
import type { ModalProps } from "./types";
import { renderModalIcon, sizeMap } from "./utils";

export type { ModalProps };

/**
 * Faz 9 (backlog madde 14 — erişilebilirlik disiplini) öncesinde bu
 * component ÜÇ gerçek a11y hatası taşıyordu, hiçbiri şu ana kadar
 * fark edilmemişti:
 *
 * 1. Kapsayıcı `<div>`lere `role="none"` verilmişti — bu, `onClick`
 *    taşıyan bir non-interactive element'i eslint-plugin-jsx-a11y'nin
 *    yakalamasını SESSİZCE ATLATIYORDU (rol "yok" demenin bir yolu, ama
 *    ekran okuyucular için de diyalog semantiğini TAMAMEN SİLİYORDU —
 *    doğru çözüm rolü kaldırmak değil, DOĞRU rolü (`dialog`) vermekti).
 * 2. `open=false` iken component hâlâ DOM'daydı (sadece opacity/scale ile
 *    gizleniyordu) — içindeki butonlar görsel olarak görünmez olsa da
 *    klavye Tab'ıyla hâlâ ERİŞİLEBİLİYORDU. `inert` (modern tarayıcıların
 *    hepsinde destekleniyor) hem odaklanmayı hem etkileşimi engelliyor,
 *    ÇIKIŞ animasyonunu bozmadan (DOM'dan hemen kaldırmak animasyonu
 *    keserdi).
 * 3. Açılınca odak İÇERİ TAŞINMIYOR, Escape'e BASINCA KAPANMIYORDU — bir
 *    diyalog için iki temel klavye/ekran okuyucu beklentisi.
 *
 * Bu üçü düzeltilirken component ilk kez hook kullanmaya başladı — bu
 * yüzden `"use client"` eklendi (daha önce hiç gerekmiyordu, artık
 * gerekiyor; Faz 3'ün "gerçek ihtiyaca göre direktif" kuralıyla tutarlı).
 */
export function Modal({
  open,
  onClose,
  title,
  icon,
  color,
  closeButtonPosition = "right",
  children,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  size = "md",
  footerButtonPosition = "left",
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    // Arka plana tıklayınca kapanma — fare için ek bir kolaylık, TEK yol
    // değil (Escape ve "X" butonu zaten klavyeyle erişilebilir). Backdrop
    // kasıtlı olarak odaklanabilir/interaktif YAPILMADI — "Tab ile arka
    // plana git" anlamsız olurdu.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      onClick={onClose}
      // `inert`, `open=false` iken hem odaklanmayı hem tıklamayı engeller —
      // DOM'da kalmaya devam ettiği için (madde 2, yukarıda) çıkış animasyonu
      // bozulmaz.
      inert={!open}
      className={cn(
        "fixed inset-0 z-mari-modal flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      {/*
        `onClick`, KENDİSİ bir eylem yapmıyor — sadece üstteki backdrop'un
        `onClose`ının bu tıklamayı YAKALAMASINI engelliyor (event bubbling
        guard'ı). Bu yüzden klavye eşdeğeri gerekmiyor; `role="dialog"`
        zaten jsx-a11y'nin "interaktif rol" listesinde değil.
      */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "w-full rounded-lg shadow-lg transition-transform duration-300 transform bg-mari-surface text-mari-foreground outline-none",
          sizeMap[size],
          open ? "scale-100" : "scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-mari-border">
          <div className="flex items-center gap-2">
            <span className="text-mari-muted">{icon ?? renderModalIcon(color)}</span>
            <h2 id={titleId} className="text-lg font-semibold">
              {title}
            </h2>
          </div>
          {closeButtonPosition === "right" && (
            <Button variant="ghost" color="neutral" shape="circle" onClick={onClose} aria-label="Kapat">
              <X size={20} />
            </Button>
          )}
          {closeButtonPosition === "left" && (
            <Button variant="ghost" color="neutral" shape="circle" className="order-first" onClick={onClose} aria-label="Kapat">
              <X size={20} />
            </Button>
          )}
        </div>

        <div className="px-4 py-4">{children}</div>

        {(confirmButtonText || cancelButtonText) && (
          <div className={cn("flex gap-2 px-4 py-3 border-t border-mari-border", footerButtonPosition === "right" && "justify-end", footerButtonPosition === "left" && "justify-start")}>
            {cancelButtonText && (
              <Button variant="soft" color="neutral" size="sm" onClick={onCancel ?? onClose}>
                {cancelButtonText}
              </Button>
            )}
            {confirmButtonText && (
              <Button color={color ?? "primary"} size="sm" onClick={onConfirm}>
                {confirmButtonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
