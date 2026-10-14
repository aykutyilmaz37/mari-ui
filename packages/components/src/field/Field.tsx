"use client";

import React, { useCallback, useId, useMemo, useState } from "react";
import { cn } from "@mari-ui/core";
import { FieldContext, type FieldContextValue } from "../lib/fieldContext";
import { skeletonBoxProps } from "../lib/skeleton";
import type { FieldProps } from "./types";

export type { FieldProps };

/**
 * Faz 16.1 — form alanının düzeni ve erişilebilirlik bağlantıları: etiket,
 * ipucu, hata, zorunlu işareti. Kendisi bir kontrol DEĞİL; içindeki kontrole
 * (context ile) id, `aria-describedby`, hata durumu (`color="error"` +
 * `aria-invalid`), `required` ve `disabled` verir. Kontrole açıkça verilen
 * prop her zaman kazanır.
 *
 * Doğrulama YOK — kurallar/state tüketicinin (react-hook-form, zod…) işi;
 * Field yalnız sonucu gösterir. Eskiden her story (Drawer, Modal, Select,
 * InputNumber) kendi `Field` yardımcısını yazıyor, id'leri elle eşliyordu.
 *
 * Hata metni `aria-live="polite"` bölgede: gönderimde ortaya çıkınca okunur.
 * Bölge hep DOM'da (sonradan eklenen canlı bölgeyi bazı ekran okuyucular
 * duyurmuyor); hata yokken boş.
 */
export function Field({ label, hint, error, required = false, disabled = false, layout = "vertical", htmlFor, className, skeleton = false, children }: Readonly<FieldProps>) {
  const autoId = useId();
  const [ownControlId, setControlId] = useState<string | undefined>();
  const [isGroup, setIsGroup] = useState(false);
  const markGroup = useCallback(() => setIsGroup(true), []);

  const controlId = ownControlId ?? htmlFor ?? `${autoId}-control`;
  const labelId = `${autoId}-label`;
  const hintId = `${autoId}-hint`;
  const errorId = `${autoId}-error`;
  const invalid = error !== undefined && error !== null && error !== false && error !== "";
  const showHint = !invalid && hint !== undefined && hint !== null;
  // Hata varken ipucu gizlenir; kontrol yalnız görünen metne bağlanır.
  let describedBy: string | undefined;
  if (invalid) describedBy = errorId;
  else if (showHint) describedBy = hintId;

  const context = useMemo<FieldContextValue>(
    () => ({ controlId, labelId, describedBy, invalid, required, disabled, markGroup, setControlId, skeleton }),
    [controlId, labelId, describedBy, invalid, required, disabled, markGroup, skeleton]
  );

  const horizontal = layout === "horizontal";
  // İskelette etiket/ipucu metni şeffaf bir blok olur — gerçek metinle aynı boyut, yüklenince kayma yok.
  const textSkeleton = (text: React.ReactNode) => (skeleton ? <span {...skeletonBoxProps("rounded-sm")}>{text}</span> : text);
  const labelContent = (
    <>
      {textSkeleton(label)}
      {/* Zorunluluk kontrolün `required`ı ile okunur; yıldız yalnız görsel. */}
      {required && !skeleton && (
        <span aria-hidden className="ml-0.5 text-mari-error">
          *
        </span>
      )}
    </>
  );
  // Yatayda etiket kontrolün İLK satırıyla hizalı (md kontrol yüksekliği 32px) — satırın (ipucu dahil) ortasına değil.
  const labelClass = cn("text-sm font-medium text-mari-foreground", disabled && "opacity-50", horizontal && "sm:flex sm:min-h-8 sm:items-center sm:self-start");

  return (
    <FieldContext.Provider value={context}>
      <div className={cn("flex min-w-0 flex-col gap-1.5", horizontal && "sm:grid sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] sm:gap-x-6 sm:gap-y-1.5", className)}>
        {/* Grupta `<label for>` bağlanamaz — etiket grubun `aria-labelledby`si olur. */}
        {isGroup ? (
          <span id={labelId} className={labelClass}>
            {labelContent}
          </span>
        ) : (
          <label id={labelId} htmlFor={controlId} className={labelClass}>
            {labelContent}
          </label>
        )}
        {/* `gap` değil `mt`: boş canlı bölge (hata yokken) yükseklik ve boşluk kaplamasın — `display:none`
            olsaydı bazı ekran okuyucular bölgeyi izlemeyi bırakıp hatayı duyurmuyordu. */}
        {/* `items-start`: satır içi kontroller (Segmented, RadioGroup) kendi genişliğinde kalsın —
            gerilince Segmented'ın zemini tam genişliğe yayılıyordu. Tam genişlik isteyenler zaten `w-full`. */}
        <div className="flex min-w-0 flex-col items-start [&>*]:max-w-full">
          {children}
          {showHint && (
            <p id={hintId} className="mt-1.5 text-xs text-mari-muted">
              {textSkeleton(hint)}
            </p>
          )}
          <p id={errorId} aria-live="polite" className="mt-1.5 text-xs text-mari-error empty:mt-0">
            {invalid ? error : null}
          </p>
        </div>
      </div>
    </FieldContext.Provider>
  );
}
