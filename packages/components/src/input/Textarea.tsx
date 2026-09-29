"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { ClearButton, clearIconOf } from "./_components/FieldAdornments";
import type { InputClassNames, InputShape, InputVariant, InputCountConfig, TextareaAutoSize } from "./types";
import type { ColorRole, Size } from "@mari-ui/core";
import { skeletonBoxProps, type SkeletonableProps } from "../lib/skeleton";
import { useFieldControl } from "../lib/fieldContext";
import {
  FIELD_BASE_CLASS,
  FIELD_DISABLED_CLASS,
  FIELD_MOBILE_TEXT_CLASS,
  getShapeClasses,
  getTextareaSizeClasses,
  getVariantClasses,
  clearNativeValue,
  isClearable,
  resolveInputColor,
  resolveLegacyInputVariant,
} from "./utils";

export interface TextareaProps extends SkeletonableProps {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear?: () => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  /** Temizle butonunun erişilebilir adı. Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  readOnly?: boolean;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** İpucu/hata metnine bağlantı (Field içindeyse otomatik). */
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  size?: Size;
  shape?: InputShape;
  variant?: InputVariant | "outlined" | "filled" | "borderless";
  color?: ColorRole;
  /** @deprecated `color` kullanın. */
  status?: "error" | "warning";
  maxLength?: number;
  showCount?: boolean;
  count?: InputCountConfig;
  id?: string;
  classNames?: InputClassNames;
  className?: string;
  /**
   * `true`: içerik kadar uzar. `{ minRows, maxRows }`: en az/en çok bu kadar
   * satır; `maxRows` aşılınca kaydırma çubuğu çıkar. `autoSize` verilince
   * elle yeniden boyutlandırma kapalıdır.
   */
  autoSize?: TextareaAutoSize;
  /** Başlangıç yüksekliği (satır). `autoSize` yoksa elle dikey büyütülebilir. Varsayılan: 3. */
  rows?: number;
}

/**
 * `autoSize` yüksekliği: içerik yüksekliğini satır yüksekliği × min/max'a
 * kıstırır. Eskiden `{ minRows, maxRows }` tipte vardı ama HİÇ uygulanmıyordu —
 * alan sınırsız uzuyordu.
 */
function fitHeight(el: HTMLTextAreaElement, autoSize: TextareaAutoSize) {
  const style = window.getComputedStyle(el);
  const lineHeight = Number.parseFloat(style.lineHeight) || 20;
  const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
  const { minRows, maxRows } = typeof autoSize === "object" ? autoSize : {};
  el.style.height = "auto";
  let height = el.scrollHeight;
  if (minRows) height = Math.max(height, minRows * lineHeight + padding);
  if (maxRows) height = Math.min(height, maxRows * lineHeight + padding);
  el.style.height = `${height}px`;
  el.style.overflowY = maxRows && el.scrollHeight > height ? "auto" : "hidden";
}

/**
 * Eskiden `TextareaProps = Omit<InputProps, ...>` ile `Input`tan türetiliyordu
 * ama `onBlur`/`onFocus` Omit listesinde YOKTU — `InputProps.onBlur`'un tipi
 * `FormEvent<HTMLInputElement>` idi ve `{...rest}` ile `<textarea>`'ya
 * yayıldığında (`FocusEventHandler<HTMLTextAreaElement>` beklenen yerde)
 * gerçek bir TS hatasıydı (bkz. plan denetimi). Artık Textarea kendi tam
 * tip setini tanımlıyor, `Input`tan miras almıyor.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>((outerProps, ref) => {
  // Field içindeyse id / aria-describedby / hata / required / disabled oradan tamamlanır.
  return <TextareaInner {...useFieldControl(outerProps)} forwardedRef={ref} />;
});

Textarea.displayName = "Textarea";

const TextareaInner = (
    {
      forwardedRef: ref,
      placeholder,
      allowClear = false,
      clearLabel = "Temizle",
      skeleton = false,
      rows = 3,
      readOnly,
      onKeyDown,
      classNames = {},
      className = "",
      count,
      defaultValue = "",
      disabled = false,
      id,
      maxLength,
      showCount,
      status,
      color,
      size = "md",
      shape = "default",
      variant,
      value,
      onChange,
      onClear,
      onFocus,
      onBlur,
      autoSize = false,
      name,
      required,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalidProp,
    }: TextareaProps & { forwardedRef: React.ForwardedRef<HTMLTextAreaElement> }
  ) => {
    const resolvedVariant = resolveLegacyInputVariant(variant);
    const resolvedColor = resolveInputColor(color, status);
    const ariaInvalid = ariaInvalidProp ?? (resolvedColor === "error" || undefined);
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const [currentValue, setCurrentValue] = useControllableState<string>({ value, defaultValue });
    const charCount = currentValue.length;
    // Ayrık değişken — iç içe template literal yerine (Faz 8, SonarJS `no-nested-template-literals`).
    const countLabel = maxLength ? `${charCount} / ${maxLength}` : `${charCount}`;
    const showClear = isClearable(allowClear) && Boolean(currentValue) && !disabled;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentValue(e.target.value);
      onChange?.(e);
    };

    const handleClear = () => {
      // onChange'i gerçek olayla tetikler (handleChange → iç state + tüketici).
      clearNativeValue(innerRef.current);
      onClear?.();
      innerRef.current?.focus();
    };

    const initialRows = typeof autoSize === "object" && autoSize.minRows ? autoSize.minRows : rows;
    const autoSizeKey = typeof autoSize === "object" ? `${autoSize.minRows}-${autoSize.maxRows}` : String(autoSize);
    useEffect(() => {
      if (autoSize && innerRef.current) fitHeight(innerRef.current, autoSize);
      // eslint-disable-next-line react-hooks/exhaustive-deps -- autoSizeKey, obje kimliği yerine değerleri izler
    }, [currentValue, autoSizeKey]);

    const geometryClass = cn("flex w-full items-start gap-2", getTextareaSizeClasses(size), getShapeClasses(shape, resolvedVariant));
    const textareaClass = cn(
      "w-full bg-transparent placeholder:text-mari-muted focus:outline-none disabled:cursor-not-allowed",
      autoSize ? "resize-none" : "resize-y",
      FIELD_MOBILE_TEXT_CLASS,
      classNames.input
    );

    if (skeleton) {
      // Şeffaf, erişilemez bir <textarea> kutuya GERÇEK yüksekliğini verir
      // (satır sayısı × satır yüksekliği + dolgu) — tahmin yok, zıplama yok.
      return (
        <div {...skeletonBoxProps(cn(geometryClass, classNames.wrapper, className))}>
          <textarea tabIndex={-1} rows={initialRows} className={cn(textareaClass, "invisible resize-none")} />
        </div>
      );
    }

    const wrapperClass = cn(
      geometryClass,
      FIELD_BASE_CLASS,
      getVariantClasses(resolvedVariant, resolvedColor),
      disabled && FIELD_DISABLED_CLASS,
      classNames.wrapper,
      className
    );

    return (
      // `w-full`: Input gibi kapsayıcısını doldurur — `items-start`lı bir flex sütununda (Field) büzülüyordu.
      <div className="flex w-full flex-col gap-2">
        <div className={wrapperClass}>
          <textarea
            id={id}
            ref={innerRef}
            value={currentValue}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            readOnly={readOnly}
            rows={initialRows}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            name={name}
            required={required}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={textareaClass}
          />
          {allowClear && <ClearButton visible={showClear} label={clearLabel} icon={clearIconOf(allowClear)} onClear={handleClear} className={classNames.clear} />}
        </div>
        {(showCount || count?.formatter) && (
          <span className={cn("flex flex-none items-center justify-end text-xs tabular-nums", maxLength && charCount >= maxLength ? "text-mari-error" : "text-mari-muted", classNames.count)}>
            {count?.formatter ? count.formatter({ value: currentValue, count: charCount, maxLength }) : countLabel}
          </span>
        )}
      </div>
    );
  };
