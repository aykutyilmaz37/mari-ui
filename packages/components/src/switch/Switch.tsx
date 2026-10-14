"use client";

import React, { useId } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { textClass, textSolidContrastClass } from "../lib/colorClasses";
import { skeletonBoxProps } from "../lib/skeleton";
import type { SwitchProps } from "./types";
import { getBallClass, getSpinnerSize, getTrackClass, getTrackSizeClass, SWITCH_TOUCH_TARGET_CLASS } from "./utils";

export type { SwitchProps };

/**
 * Eskiden `Button` component'inin üzerine `!p-0.5` gibi `!important`
 * override'larla bindiriliyordu (bkz. plan Faz 3 denetimi: "Switch,
 * Button'ın kendi boyut class'larıyla savaşmak için `!important`
 * kullanıyor"). Switch, Button'la aynı boyut/dolgu sözleşmesini
 * paylaşmadığı için (track genişliği Button'ın skalasında yok) bu hack
 * gerekiyordu. Artık bağımsız bir `<button>` render ediyor — override
 * savaşı ortadan kalktı.
 */
export function Switch({
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  label,
  switchTrueLabel,
  switchFalseLabel,
  size = "md",
  color = "primary",
  loading,
  className,
  skeleton = false,
  "aria-label": ariaLabel,
}: Readonly<SwitchProps>) {
  const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked, onChange });
  // `label` eskiden salt dekoratif bir <span>'di — ne ekran okuyucuya
  // duyurulan bir isim ne de tıklanabilir bir etiket olarak switch'e
  // bağlıydı (Checkbox/Radio'nun aksine). `<label htmlFor>` hem
  // `aria-labelledby` gerektirmeden erişilebilir adı sağlar hem de metne
  // tıklamayı switch'i değiştirir.
  const switchId = useId();

  const hasLabel = Boolean(switchTrueLabel || switchFalseLabel);

  if (skeleton) {
    return (
      <div aria-hidden className="flex w-full items-center gap-2">
        {label && <span {...skeletonBoxProps("rounded-sm text-sm")}>{label}</span>}
        <span {...skeletonBoxProps(cn("inline-block shrink-0 rounded-full", getTrackSizeClass(size, hasLabel), className))} />
      </div>
    );
  }

  return (
    <div className="flex items-center w-full gap-2">
      {label && (
        <label htmlFor={switchId} className={cn("text-sm text-mari-foreground", disabled && "cursor-not-allowed text-mari-disabled")}>
          {label}
        </label>
      )}
      <button
        type="button"
        id={switchId}
        onClick={() => !disabled && !loading && setIsChecked(!isChecked)}
        disabled={disabled || loading}
        aria-checked={isChecked}
        aria-busy={loading || undefined}
        aria-label={label ? undefined : ariaLabel}
        role="switch"
        className={cn(
          // `overflow-hidden` BURADA YOK — dokunmatik hedefin `::before`'unu
          // kırpardı. Kayan iç etiketler aşağıdaki ayrı kırpma katmanında.
          "group relative inline-flex shrink-0 cursor-pointer items-center justify-start rounded-full transition-colors duration-200",
          SWITCH_TOUCH_TARGET_CLASS[size],
          // Buton'daki (Faz 13.1) aynı odak halkası deseni — eskiden `focus:ring-0`
          // ile TAMAMEN kapatılmıştı, klavye kullanıcısı odağın nerede olduğunu göremiyordu.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          getTrackClass(size, color, isChecked, hasLabel),
          className
        )}
      >
        <span
          className={cn(
            // `shadow` — ant.design'ın topu da düz bir daire değil, hafif bir
            // gölgeyle (0 2px 4px) track'ten AYRIŞIR; eskiden gölgesiz düz
            // bir beyaz daireydi, track'e "yapışık" görünüyordu.
            "absolute z-10 flex items-center justify-center rounded-full shadow transition-all duration-200",
            // Basılıyken top hafif uzar (ant.design). Eskiden `group-focus:` idi —
            // fareyle tıklayınca buton odakta kaldığı için top UZAMIŞ HALDE takılı kalıyordu.
            isChecked ? "group-active:scale-x-[1.166] group-active:origin-right" : "group-active:scale-x-[1.166] group-active:origin-left",
            // Top HER ZAMAN beyaz (iOS/ant.design). Eskiden açıkken rengin
            // "üstündeki metin" kontrast rengiydi — success/info gibi açık
            // dolgularda o renk siyah çıkıyordu; kapalıyken de koyu `foreground`.
            "bg-white",
            getBallClass(size, isChecked)
          )}
        >
          {loading && (
            <Loader2Icon
              size={getSpinnerSize(size)}
              // Spinner rengi track'in rengini yansıtır (ant.design'ın deseni) —
              // eskiden sabit `text-black`ti, hangi renk/durumda olursa olsun
              // aynı görünüyordu.
              className={cn("animate-spin", isChecked ? textClass[color] : "text-mari-muted")}
            />
          )}
        </span>
        {hasLabel && (
          <span aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
            {/* Kullanıcı geri bildirimi: etiket track kenarına çok bitişikti VE
                dikeyden ortalı değildi — sabit bir `top-1.5` (6px) her boyutta
                AYNI kalıyordu (sm/md/lg track yükseklikleri farklı olduğu için
                sadece birinde doğru olabilirdi). `inset-y-0 flex items-center`
                ile track'in GERÇEK yüksekliğine göre her zaman dikey ortalı;
                kenar payı da `1`(4px) → `1.5`(6px) yapıldı, thumb'a/kenara
                yapışık durmasın diye. */}
            <span
              className={cn(
                "absolute inset-y-0 flex items-center text-xs leading-none whitespace-nowrap transition-all duration-300",
                textSolidContrastClass[color],
                isChecked ? "left-1.5" : "-left-20"
              )}
            >
              {switchTrueLabel}
            </span>
            <span
              className={cn(
                "absolute inset-y-0 flex items-center text-xs leading-none whitespace-nowrap transition-all duration-300",
                textSolidContrastClass.neutral,
                !isChecked ? "right-1.5" : "-right-20"
              )}
            >
              {switchFalseLabel}
            </span>
          </span>
        )}
      </button>
    </div>
  );
}
