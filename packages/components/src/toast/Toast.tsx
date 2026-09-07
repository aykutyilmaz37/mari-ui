"use client";

import React, { useEffect, useState } from "react";
import { XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { ToastProps } from "./types";
import { getToastIcon } from "./utils";

export type { ToastProps };

/**
 * Eskiden konumunu (top/bottom/.../translate/opacity) KENDİSİ taşıyordu —
 * bu yüzden aynı köşede aynı anda birden fazla toast render edildiğinde
 * hepsi TAM AYNI koordinata `absolute` konumlanıp birbirinin üstüne
 * biniyordu (bkz. plan denetimi ve utils.ts'teki not). Artık Toast sadece
 * kendi giriş animasyonundan (fade+scale) sorumlu; konum/istifleme işini
 * `ToastContainer` (bkz. useToast.tsx) flexbox ile yapıyor.
 */
export function Toast({ title, description, type = "none", onClose, closeIcon = true }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const icon = getToastIcon(type);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        "pointer-events-auto bg-mari-surface transition-all duration-300 ease-out transform shadow-2xl p-5 min-w-2xs min-h-16 flex items-start justify-between gap-3 rounded-lg border border-mari-border",
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-2 scale-95"
      )}
    >
      <div className="flex items-start gap-2">
        {icon && <span className="mt-1">{icon}</span>}
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-lg font-bold text-mari-foreground">{title}</h1>
          {description && <h6 className="text-sm text-mari-muted">{description}</h6>}
        </div>
      </div>
      {closeIcon && <XIcon className="cursor-pointer text-mari-muted hover:text-mari-error shrink-0" size={16} onClick={onClose} />}
    </div>
  );
}
