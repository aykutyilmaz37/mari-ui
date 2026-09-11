"use client";

import React, { useEffect, useId, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isChecked, setIsChecked] = useControllableState<boolean>({ value: checked, defaultValue: defaultChecked, onChange });
  // `label` eskiden salt dekoratif bir <span>'di — ne ekran okuyucuya
  // duyurulan bir isim ne de tıklanabilir bir etiket olarak switch'e
  // bağlıydı (Checkbox/Radio'nun aksine). `<label htmlFor>` hem
  // `aria-labelledby` gerektirmeden erişilebilir adı sağlar hem de metne
  // tıklamayı switch'i değiştirir.
  const switchId = useId();

  useEffect(() => {
    buttonRef.current?.blur();
  }, [isChecked]);

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
        ref={buttonRef}
        onClick={() => !disabled && !loading && setIsChecked(!isChecked)}
        disabled={disabled || loading}
        aria-checked={isChecked}
        role="switch"
        className={cn(
          "relative inline-flex items-center justify-start rounded-full focus:ring-0 duration-300 overflow-hidden transition-opacity hover:opacity-80 group",
          // Buton'daki (Faz 13.1) aynı odak halkası deseni — eskiden `focus:ring-0`
          // ile TAMAMEN kapatılmıştı, klavye kullanıcısı odağın nerede olduğunu göremiyordu.
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          !isChecked && !disabled && "opacity-70",
          getTrackClass(size, color, isChecked, hasLabel),
          className
        )}
      >
        <span
          className={cn(
            "inline-block rounded-full absolute bg-white transform transition-all duration-300",
            isChecked ? "group-focus:scale-x-[1.166] group-focus:origin-right" : "group-focus:scale-x-[1.166] group-focus:origin-left",
            getBallClass(size, isChecked)
          )}
        >
          {loading && <Loader2Icon size={getSpinnerSize(size)} className="animate-spin text-black" />}
        </span>
        <span className={cn("inline-block absolute text-xs leading-none transform transition-all duration-300", isChecked ? "top-1.5 left-1" : "top-1.5 -left-20")}>
          {switchTrueLabel}
        </span>
        <span className={cn("inline-block absolute text-xs leading-none transform transition-all duration-300", !isChecked ? "top-1.5 right-1" : "top-1.5 -right-20")}>
          {switchFalseLabel}
        </span>
      </button>
    </div>
  );
}
