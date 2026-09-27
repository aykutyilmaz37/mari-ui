"use client";

import React, { useId } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { bgSolidContrastClass, textClass, textSolidContrastClass } from "../lib/colorClasses";
import type { SwitchProps } from "./types";
import { getBallClass, getSpinnerSize, getTrackClass } from "./utils";

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
}: SwitchProps) {
  const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked, onChange });
  // `label` eskiden salt dekoratif bir <span>'di — ne ekran okuyucuya
  // duyurulan bir isim ne de tıklanabilir bir etiket olarak switch'e
  // bağlıydı (Checkbox/Radio'nun aksine). `<label htmlFor>` hem
  // `aria-labelledby` gerektirmeden erişilebilir adı sağlar hem de metne
  // tıklamayı switch'i değiştirir.
  const switchId = useId();

  const hasLabel = Boolean(switchTrueLabel || switchFalseLabel);

  return (
    <div className="flex items-center w-full gap-2">
      {label && (
        <label htmlFor={switchId} className={cn("text-sm", disabled && "cursor-not-allowed")}>
          {label}
        </label>
      )}
      <button
        type="button"
        id={switchId}
        onClick={() => !disabled && !loading && setIsChecked(!isChecked)}
        disabled={disabled || loading}
        aria-checked={isChecked}
        role="switch"
        className={cn(
          "relative inline-flex items-center justify-start rounded-full focus:ring-0 duration-300 overflow-hidden transition-colors group",
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
            "inline-block rounded-full absolute shadow transform transition-all duration-300 flex items-center justify-center",
            isChecked ? "group-focus:scale-x-[1.166] group-focus:origin-right" : "group-focus:scale-x-[1.166] group-focus:origin-left",
            isChecked ? bgSolidContrastClass[color] : "bg-mari-foreground",
            getBallClass(size, isChecked)
          )}
        >
          {loading && (
            <Loader2Icon
              size={getSpinnerSize(size)}
              // Spinner rengi track'in rengini yansıtır (ant.design'ın deseni) —
              // eskiden sabit `text-black`ti, hangi renk/durumda olursa olsun
              // aynı görünüyordu.
              className={cn("animate-spin", isChecked ? textClass[color] : "text-mari-surface")}
            />
          )}
        </span>
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
            "absolute inset-y-0 flex items-center text-xs leading-none whitespace-nowrap transition-all duration-300 text-mari-foreground",
            !isChecked ? "right-1.5" : "-right-20"
          )}
        >
          {switchFalseLabel}
        </span>
      </button>
    </div>
  );
}
