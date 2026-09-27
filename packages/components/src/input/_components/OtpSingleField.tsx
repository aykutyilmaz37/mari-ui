"use client";

import React, { useRef, useState } from "react";
import { cn, useControllableState, type ColorRole, type Size } from "@mari-ui/core";
import { skeletonBoxProps } from "../../lib/skeleton";
import { touchTargetClass } from "../../lib/sizeClasses";
import type { InputShape, InputVariant } from "../types";
import { FIELD_BASE_CLASS, FIELD_DISABLED_CLASS, getShapeClasses, getVariantClasses } from "../utils";

export interface OtpSingleFieldProps {
  length: number;
  value?: string;
  defaultValue: string;
  disabled: boolean;
  size: Size;
  shape: InputShape;
  variant: InputVariant;
  color?: ColorRole;
  onChange?: (value: string) => void;
  onInput?: (value: string[]) => void;
  display: (raw: string) => string;
  separator?: React.ReactNode | ((i: number) => React.ReactNode);
  className?: string;
  ariaLabel: string;
  inputMode: "numeric" | "text";
  skeleton: boolean;
}

/** Kutu yüksekliği + yatay dolgu; yuva genişliği ve rakam boyutu. */
const BOX_CLASS: Record<Size, string> = { sm: "h-8 px-2.5 gap-1", md: "h-10 px-3 gap-1.5", lg: "h-12 px-4 gap-2" };
const SLOT_CLASS: Record<Size, string> = { sm: "w-4 text-sm", md: "w-5 text-base", lg: "w-6 text-xl" };

/**
 * Tek kutu görünümlü OTP (`layout="single"`). Kutucuklar yerine TEK bir alan
 * içinde eşit aralıklı hane yuvaları çizilir; arkada ise TEK bir gerçek
 * `<input>` vardır (metni ve imleci şeffaf, kutuyu tamamen kaplar). Bu yapı:
 * yapıştırma ve SMS otomatik doldurma kendiliğinden çalışır (kodun tamamı tek
 * alana gelir), ekran okuyucu tek bir adlandırılmış alan görür (6 ayrı
 * "hane" değil), mobil klavye bir kez açılır. Yuvalar yalnızca görseldir
 * (`aria-hidden`).
 */
export function OtpSingleField({
  length,
  value,
  defaultValue,
  disabled,
  size,
  shape,
  variant,
  color,
  onChange,
  onInput,
  display,
  separator,
  className,
  ariaLabel,
  inputMode,
  skeleton,
}: OtpSingleFieldProps) {
  const [code, setCode] = useControllableState<string>({ value, defaultValue: defaultValue.slice(0, length) });
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const boxClass = cn("relative inline-flex w-fit max-w-full items-center", BOX_CLASS[size], getShapeClasses(shape, variant));

  if (skeleton) {
    return (
      <div {...skeletonBoxProps(cn(boxClass, className))}>
        {Array.from({ length }, (_, i) => (
          <span key={i} className={SLOT_CLASS[size]} />
        ))}
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let next = e.target.value.replace(/\s/g, "");
    if (inputMode === "numeric") next = next.replace(/\D/g, "");
    next = next.slice(0, length);
    setCode(next);
    onInput?.(Array.from({ length }, (_, i) => next[i] ?? ""));
    if (next.length === length) onChange?.(next);
  };

  // İmleç hep sonda: yuvalar ortada bir konuma tıklamayı göstermediği için
  // seçim/imleç taşınırsa kullanıcı nereye yazdığını göremezdi.
  const keepCaretAtEnd = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
  };

  const activeIndex = Math.min(code.length, length - 1);

  return (
    <div
      className={cn(
        boxClass,
        FIELD_BASE_CLASS,
        getVariantClasses(variant, color),
        touchTargetClass[size],
        disabled && FIELD_DISABLED_CLASS,
        className
      )}
    >
      {Array.from({ length }, (_, i) => {
        const char = code[i];
        const isActive = focused && i === activeIndex;
        return (
          <React.Fragment key={i}>
            <span
              aria-hidden
              className={cn(
                "relative flex h-full items-center justify-center font-medium tabular-nums text-mari-foreground",
                SLOT_CLASS[size],
                // Boş yuva: dikeyde ortalı ince bir çizgi — kaç hane kaldığı görünür.
                !char && "after:absolute after:inset-x-0.5 after:top-1/2 after:h-px after:-translate-y-1/2 after:bg-mari-input",
                isActive && !char && "after:bg-mari-primary"
              )}
            >
              {char ? display(char) : null}
              {isActive && code.length < length && (
                <span className="absolute h-[45%] w-px animate-pulse bg-mari-foreground motion-reduce:animate-none" />
              )}
            </span>
            {separator && i < length - 1 && (
              <span aria-hidden className="px-0.5 text-mari-muted">
                {typeof separator === "function" ? separator(i) : separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
      <input
        ref={inputRef}
        value={code}
        onChange={handleChange}
        onFocus={(e) => {
          setFocused(true);
          keepCaretAtEnd(e);
        }}
        onBlur={() => setFocused(false)}
        onSelect={keepCaretAtEnd}
        // `maxLength` YOK: tarayıcı yapıştırılan "482 913" gibi biçimli bir kodu
        // temizlemeden ÖNCE kırpıp "482 91" bırakırdı. Uzunluk `handleChange`de.
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={color === "error" || undefined}
        inputMode={inputMode}
        autoComplete="one-time-code"
        spellCheck={false}
        // Metin ve imleç şeffaf — görünen haneler yuvalardır. `text-base`:
        // iOS 16px altındaki alanda odakta sayfayı yakınlaştırır.
        className="absolute inset-0 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent outline-none selection:bg-transparent disabled:cursor-not-allowed"
      />
    </div>
  );
}
