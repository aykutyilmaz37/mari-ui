"use client";

import React, { useEffect, useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import type { SwitchProps } from "./types";
import { getBallClass, getTrackClass } from "./utils";

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

  useEffect(() => {
    buttonRef.current?.blur();
  }, [isChecked]);

  return (
    <div className="flex items-center w-full gap-2">
      {label && <span className="text-sm">{label}</span>}
      <button
        type="button"
        ref={buttonRef}
        onClick={() => !disabled && !loading && setIsChecked(!isChecked)}
        disabled={disabled || loading}
        aria-checked={isChecked}
        role="switch"
        className={cn(
          "relative inline-flex items-center justify-start rounded-full focus:ring-0 duration-300 overflow-hidden transition-opacity hover:opacity-80 group",
          (disabled || loading) && "opacity-50 cursor-not-allowed",
          !isChecked && !disabled && "opacity-70",
          getTrackClass(size, color, isChecked),
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
          {loading && <Loader2Icon className="animate-spin text-black" />}
        </span>
        <span className={cn("inline-block absolute transform transition-all duration-300", isChecked ? "top-1 left-1" : "top-1 -left-20")}>
          {switchTrueLabel}
        </span>
        <span className={cn("inline-block absolute transform transition-all duration-300", !isChecked ? "top-1 right-1" : "top-1 -right-20")}>
          {switchFalseLabel}
        </span>
      </button>
    </div>
  );
}
