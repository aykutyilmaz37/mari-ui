"use client";

import React, { useId, useState } from "react";
import { CircleAlertIcon, CircleXIcon, InfoIcon } from "lucide-react";
import { cn, useControllableState, type ColorRole } from "@mari-ui/core";
import { Button } from "../button";
import { textClass } from "../lib/colorClasses";
import { Popover } from "../popover";
import type { PopconfirmProps } from "./types";

export type { PopconfirmProps };

const isDestructive = (color: ColorRole) => color === "error" || color === "warning";

function StatusIcon({ icon, color }: { icon: PopconfirmProps["icon"]; color: ColorRole }) {
  if (icon === false) return null;
  if (icon !== true && icon !== undefined) return <span className={cn("flex shrink-0 pt-0.5", textClass[color])}>{icon}</span>;
  let Icon = InfoIcon;
  if (color === "error") Icon = CircleXIcon;
  else if (color === "warning") Icon = CircleAlertIcon;
  return <Icon aria-hidden size={16} className={cn("mt-0.5 shrink-0", textClass[color])} />;
}

/**
 * Faz 16.2 — yapı ant.design Popconfirm'den: bir eylemin hemen yanında,
 * sayfayı karartmadan "emin misiniz?" sorusu. Popover'ın üstüne kurulu
 * (konum, ok, odak, kapatma yolları ortak).
 *
 * Erişilebilirlik: panel `role="alertdialog"`, soru adı, açıklama
 * `aria-describedby`. Yıkıcı onayda (`error`/`warning`) ilk odak "Vazgeç"te —
 * Enter'a basan kullanıcı yanlışlıkla silmesin; diğerlerinde onay düğmesinde.
 * `onConfirm` Promise dönerse düğme yükleniyor, panel açık; bitince kapanır
 * ve odak tetikleyiciye döner.
 */
export function Popconfirm({
  title,
  description,
  children,
  onConfirm,
  onCancel,
  okText = "Evet",
  cancelText = "Vazgeç",
  color = "warning",
  icon = true,
  placement = "top",
  disabled = false,
  open: openProp,
  onOpenChange,
  className,
  skeleton = false,
}: PopconfirmProps) {
  const [open, setOpen] = useControllableState<boolean>({ value: openProp, defaultValue: false, onChange: onOpenChange });
  const [pending, setPending] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const destructive = isDestructive(color);

  const confirm = async () => {
    const result = onConfirm?.();
    if (!(result instanceof Promise)) {
      setOpen(false);
      return;
    }
    setPending(true);
    try {
      await result;
      setOpen(false);
    } catch {
      // Reddedildi: panel açık kalır, kullanıcı tekrar deneyebilir ya da vazgeçebilir.
    } finally {
      setPending(false);
    }
  };

  const cancel = () => {
    onCancel?.();
    setOpen(false);
  };

  if (disabled) return children;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => !pending && setOpen(next)}
      placement={placement}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      skeleton={skeleton}
      className={cn("max-w-[min(20rem,calc(100vw-1rem))]", className)}
      content={
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <StatusIcon icon={icon} color={color} />
            <div className="min-w-0">
              <p id={titleId} className="font-semibold text-mari-foreground">
                {title}
              </p>
              {description && (
                <p id={descriptionId} className="mt-0.5 text-mari-muted">
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" color="neutral" onClick={cancel} data-autofocus={destructive || undefined}>
              {cancelText}
            </Button>
            <Button size="sm" color={destructive ? color : "primary"} onClick={confirm} loading={pending} data-autofocus={destructive ? undefined : true}>
              {okText}
            </Button>
          </div>
        </div>
      }
    >
      {children}
    </Popover>
  );
}
