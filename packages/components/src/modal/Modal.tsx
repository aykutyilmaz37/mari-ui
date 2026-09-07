import React from "react";
import { X } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../button";
import type { ModalProps } from "./types";
import { renderModalIcon, sizeMap } from "./utils";

export type { ModalProps };

/**
 * Tamamen `open`/`onClose` prop'larıyla kontrol edilir, hook yok — saf
 * sunum, "use client" gerekmiyor (eskiden de yoktu, doğruydu). `z-50` ->
 * `z-mari-modal`. Alt/üst butonlar artık ham `bg-primary`/`text-background`
 * yerine Button'ın kendi color/variant ekseni üzerinden.
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
  return (
    <div
      role="none"
      className={cn(
        "fixed inset-0 z-mari-modal flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300",
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        role="none"
        className={cn("w-full rounded-lg shadow-lg transition-transform duration-300 transform bg-mari-surface text-mari-foreground", sizeMap[size], open ? "scale-100" : "scale-95")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-mari-border">
          <div className="flex items-center gap-2">
            <span className="text-mari-muted">{icon ?? renderModalIcon(color)}</span>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {closeButtonPosition === "right" && (
            <Button variant="ghost" color="neutral" shape="circle" onClick={onClose}>
              <X size={20} />
            </Button>
          )}
          {closeButtonPosition === "left" && (
            <Button variant="ghost" color="neutral" shape="circle" className="order-first" onClick={onClose}>
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
