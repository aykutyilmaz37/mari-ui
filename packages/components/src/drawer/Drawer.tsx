import React from "react";
import { X } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { DrawerProps } from "./types";
import { getAnimationClass, getBasePositionClass, getDimensionClass } from "./utils";

export type { DrawerProps };

// Tamamen `open`/`onClose` prop'larıyla kontrol edilir, hook yok — "use client" gerekmiyor.
export function Drawer({
  position = "right",
  size = "md",
  open,
  onClose,
  showCloseButton = true,
  closeButtonPosition = "right",
  loading = false,
  header,
  footer,
  children,
}: DrawerProps) {
  const isHorizontal = position === "left" || position === "right";

  return (
    <div className={cn("fixed inset-0 z-mari-drawer transition-opacity duration-300", open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
      <div className="absolute inset-0 bg-black/30" role="none" onClick={onClose} />
      <div className={cn(getBasePositionClass(position), getDimensionClass(size, isHorizontal), getAnimationClass(open, position), "flex flex-col text-mari-foreground")}>
        {(header || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-mari-border">
            {closeButtonPosition === "left" && showCloseButton && (
              <button onClick={onClose} aria-label="Çekmeceyi kapat" className="mr-2 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1 text-center">{header}</div>
            {closeButtonPosition === "right" && showCloseButton && (
              <button onClick={onClose} aria-label="Çekmeceyi kapat" className="ml-2 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 flex-1 overflow-auto">
          {loading ? <p className="text-center text-base text-mari-muted">Yükleniyor...</p> : children}
        </div>

        {footer && <div className="border-t border-mari-border p-4">{footer}</div>}
      </div>
    </div>
  );
}
