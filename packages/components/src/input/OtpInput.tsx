"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { cn, type ColorRole, type Size } from "@mari-ui/core";
import { FieldContext, useFieldControl, useFieldGroup, useFieldSkeleton } from "../lib/fieldContext";
import type { SkeletonableProps } from "../lib/skeleton";
import { Input } from "./Input";
import { OtpSingleField } from "./_components/OtpSingleField";
import type { InputShape, InputVariant } from "./types";

export interface OtpInputProps extends SkeletonableProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  size?: Size;
  shape?: InputShape;
  variant?: InputVariant;
  color?: ColorRole;
  onChange?: (value: string) => void;
  onInput?: (value: string[]) => void;
  mask?: boolean;
  formatter?: (val: string) => string;
  separator?: React.ReactNode | ((i: number) => React.ReactNode);
  className?: string;
  /** Grubun erişilebilir adı. Varsayılan: `"Doğrulama kodu"`. */
  "aria-label"?: string;
  /**
   * Mobil klavye. Varsayılan `"numeric"` (SMS/e-posta kodları rakamdır);
   * harf içeren kodlar için `"text"`.
   */
  inputMode?: "numeric" | "text";
  /**
   * `separated` (varsayılan): her hane ayrı bir kutucuk. `single`: tek bir
   * alan içinde hane yuvaları — arkada tek bir gerçek `<input>` (yapıştırma,
   * SMS otomatik doldurma, ekran okuyucu için en sade yapı).
   */
  layout?: "separated" | "single";
  /**
   * Yalnızca `layout="single"`: yuva çizgisinin yeri. `center` (varsayılan):
   * boş yuvada dikeyde ortalı çizgi, hane girilince kaybolur. `bottom`:
   * hanenin altında, dolu yuvada da kalan alt çizgi.
   */
  linePosition?: "center" | "bottom";
}

const WIDTH_CLASS: Record<Size, string> = { sm: "w-6 p-0", md: "w-8 p-0", lg: "w-10 p-0" };

/** İç içe ternary yerine ayrık fonksiyon. */
function resolveDisplayValue(rawValue: string, formatter: ((val: string) => string) | undefined, mask: boolean): string {
  if (formatter) return formatter(rawValue);
  if (mask && rawValue) return "•";
  return rawValue;
}

export function OtpInput({
  length = 6,
  value,
  defaultValue = "",
  disabled = false,
  size = "md",
  shape = "default",
  variant = "outline",
  color,
  onChange,
  onInput,
  mask = false,
  formatter,
  separator,
  className,
  "aria-label": ariaLabelProp,
  inputMode = "numeric",
  skeleton: ownSkeleton,
  layout = "separated",
  linePosition = "center",
}: Readonly<OtpInputProps>) {
  // Field içinde: kutucuklu düzen bir GRUP (etiket grubun adı), tek kutu düzeni tek bir ALAN (label htmlFor).
  // Varsayılan "Doğrulama kodu" adı yalnız hiç ad yoksa — Field'ın etiketini ezmesin.
  const inField = useContext(FieldContext) !== null;
  const group = useFieldGroup({ "aria-label": ariaLabelProp, disabled }, layout === "separated");
  const skeleton = useFieldSkeleton(ownSkeleton);
  const control = useFieldControl({ disabled, color });
  const ariaLabel = ariaLabelProp ?? (inField ? undefined : "Doğrulama kodu");
  const [otpValues, setOtpValues] = useState<string[]>(Array.from({ length }, (_, i) => value?.[i] ?? defaultValue[i] ?? ""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    const input = inputsRef.current[index];
    if (input) {
      input.focus();
      input.select();
    }
  };

  /**
   * Hücrelerde artık `maxLength=1` YOK — o, 6 haneli bir kodun
   * yapıştırılmasını VE iOS/Android'in SMS kodunu otomatik doldurmasını
   * (`autocomplete="one-time-code"`, kodun tamamını ilk hücreye yazar) tek
   * haneye kırpıyordu. Uzun giriş buradan hücrelere dağıtılır; dolu bir
   * hücrede imleç sondayken yazılan tek karakter ise eskisinin YERİNE geçer.
   */
  const handleInput = (i: number, rawValue: string) => {
    const shown = resolveDisplayValue(otpValues[i] ?? "", formatter, mask);
    let text = rawValue.replace(/\s/g, "");
    if (shown && text.length === shown.length + 1) text = text.startsWith(shown) ? text.slice(shown.length) : text.slice(0, 1);
    const chars = text.split("");
    const updated = [...otpValues];
    for (let j = 0; j < chars.length; j++) {
      if (i + j < length) updated[i + j] = chars[j] ?? "";
    }
    setOtpValues(updated);
    onInput?.(updated);
    if (!updated.includes("")) onChange?.(updated.join(""));
    focusInput(Math.min(i + chars.length, length - 1));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    const input = e.currentTarget;
    const cursorAtStart = input.selectionStart === 0;
    const cursorAtEnd = input.selectionStart === input.value.length;

    if (e.key === "Backspace") {
      e.preventDefault();
      const updated = [...otpValues];
      if (otpValues[i]) {
        updated[i] = "";
        setOtpValues(updated);
        onInput?.(updated);
        focusInput(i);
      } else if (i > 0) {
        updated[i - 1] = "";
        setOtpValues(updated);
        onInput?.(updated);
        focusInput(i - 1);
      }
    }
    if (e.key === "ArrowLeft" && cursorAtStart && i > 0) {
      e.preventDefault();
      focusInput(i - 1);
    }
    if (e.key === "ArrowRight" && cursorAtEnd && i < length - 1) {
      e.preventDefault();
      focusInput(i + 1);
    }
  };

  useEffect(() => {
    if (value !== undefined) {
      const split = value.split("").slice(0, length);
      setOtpValues((prev) => Array.from({ length }, (_, i) => split[i] ?? prev[i] ?? ""));
    }
  }, [value, length]);

  // Faz 13 gözden geçirmesi: `ghost` Input'ta ("kenarlıksız, arka planı
  // saydam") bir metin alanının içinde/etrafında bağlam olduğu için anlamlı
  // — ama OTP'de her kutucuk TEK BAŞINA bir hücre, çevresinde hiçbir görsel
  // referans yok. `ghost` seçilince kutucuklar TAMAMEN görünmez oluyordu,
  // kullanıcı nereye yazacağını göremiyordu. OTP için `ghost`, `underlined`e
  // (en azından bir alt çizgi kalır) düşürülür.
  const resolvedVariant = variant === "ghost" ? "underlined" : variant;

  if (layout === "single") {
    return (
      <OtpSingleField
        length={length}
        value={value}
        defaultValue={defaultValue}
        disabled={!!control.disabled}
        size={size}
        shape={shape}
        variant={resolvedVariant}
        color={control.color}
        id={control.id}
        describedBy={control["aria-describedby"]}
        required={control.required}
        onChange={onChange}
        onInput={onInput}
        display={(raw) => resolveDisplayValue(raw, formatter, mask)}
        separator={separator}
        className={className}
        ariaLabel={ariaLabel}
        inputMode={inputMode}
        skeleton={skeleton}
        linePosition={linePosition}
      />
    );
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, i: number) => {
    e.preventDefault();
    handleInput(i, e.clipboardData.getData("text"));
  };

  if (skeleton) {
    return (
      <div aria-hidden className="flex items-center gap-2">
        {Array.from({ length }, (_, i) => (
          <Input key={i} skeleton size={size} shape={shape} className={cn(WIDTH_CLASS[size], className)} />
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={group["aria-labelledby"] ? undefined : (ariaLabel ?? "Doğrulama kodu")}
      aria-labelledby={group["aria-labelledby"]}
      aria-describedby={group["aria-describedby"]}
      className="flex items-center gap-2"
    >
      {/* Hücreler Field'ın bağlantılarını ALMAZ — hepsi aynı id'yi alırdı; bağlantılar gruptadır. */}
      <FieldContext.Provider value={null}>
      {Array.from({ length }).map((_, i) => {
        const rawValue = otpValues[i] ?? "";
        const displayValue = resolveDisplayValue(rawValue, formatter, mask);

        return (
          <React.Fragment key={`otp-${i}`}>
            <Input
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              value={displayValue}
              onInput={(e) => handleInput(i, (e.target as HTMLInputElement).value)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={(e) => handlePaste(e, i)}
              onFocus={(e) => e.currentTarget.select()}
              aria-label={`Hane ${i + 1} / ${length}`}
              inputMode={inputMode}
              // SMS kodunu klavye önerisi olarak sunar — sadece ilk hücrede.
              autoComplete={i === 0 ? "one-time-code" : "off"}
              disabled={!!group.disabled}
              size={size}
              shape={shape}
              variant={resolvedVariant}
              color={group["aria-invalid"] ? (color ?? "error") : color}
              className={cn(WIDTH_CLASS[size], className)}
              classNames={{ input: "w-full text-center font-medium" }}
            />
            {separator && i < length - 1 && (
              <span aria-hidden className="text-mari-muted">
                {typeof separator === "function" ? separator(i) : separator}
              </span>
            )}
          </React.Fragment>
        );
      })}
      </FieldContext.Provider>
    </div>
  );
}
