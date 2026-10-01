"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ArrowRightIcon, CalendarIcon, ClockIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { ClearButton } from "../input/_components/FieldAdornments";
import { FIELD_BASE_CLASS, FIELD_DISABLED_CLASS, FIELD_MOBILE_TEXT_CLASS, getShapeClasses, getVariantClasses } from "../input/utils";
import { useFieldControl } from "../lib/fieldContext";
import { skeletonBoxProps } from "../lib/skeleton";
import { sizeClass, touchTargetClass } from "../lib/sizeClasses";
import { useFloatingPosition } from "../lib/useFloatingPosition";
import { PickerPanel } from "./_components/PickerPanel";
import type { DatePickerProps, DatePickerRangeProps } from "./types";
import { usePickerState, type PickerState } from "./usePickerState";
import { formatPlaceholder, isoValue } from "./utils";

export type { DatePickerProps };

const GAP_PX = 4;

interface SlotInputProps {
  state: PickerState;
  slot: 0 | 1;
  id?: string;
  label?: string;
  labelledBy?: string;
  describedBy?: string;
  placeholder: string;
  panelId: string;
  disabled: boolean;
  required?: boolean;
  invalid?: boolean;
  inputRef: (el: HTMLInputElement | null) => void;
  onOpenWithFocus: () => void;
}

/** Yazılabilir alan (her yuva için). Panel açıkken odak burada kalır; ↓ odağı panele taşır. */
function SlotInput({ state, slot, id, label, labelledBy, describedBy, placeholder, panelId, disabled, required, invalid, inputRef, onOpenWithFocus }: SlotInputProps) {
  const active = state.open && state.slot === slot;
  return (
    <input
      ref={inputRef}
      id={id}
      type="text"
      // APG "Date Picker Combobox": yazılabilir alan + açılır dialog.
      role="combobox"
      inputMode={state.mode === "time" ? "numeric" : "text"}
      autoComplete="off"
      aria-label={label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-haspopup="dialog"
      aria-expanded={state.open}
      aria-controls={state.open ? panelId : undefined}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      disabled={disabled}
      placeholder={placeholder}
      value={state.texts[slot] ?? ""}
      onChange={(e) => {
        state.setSlot(slot);
        state.typeText(slot, e.target.value);
        state.setOpen(true);
      }}
      onFocus={() => state.open && state.setSlot(slot)}
      onClick={() => {
        state.setSlot(slot);
        state.setOpen(true);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || (e.key === "ArrowDown" && e.altKey)) {
          e.preventDefault();
          state.setSlot(slot);
          onOpenWithFocus();
        } else if (e.key === "Enter") {
          e.preventDefault();
          state.commitText(slot);
          state.close();
        } else if (e.key === "Escape" && state.open) {
          e.preventDefault();
          e.stopPropagation();
          state.close();
        }
      }}
      className={cn(
        "w-full min-w-0 flex-1 bg-transparent tabular-nums placeholder:text-mari-muted focus:outline-none disabled:cursor-not-allowed",
        FIELD_MOBILE_TEXT_CLASS,
        state.range && "border-b-2 border-transparent",
        active && state.range && "border-mari-primary"
      )}
    />
  );
}

/** Değerin sığacağı genişlik: tek alan / aralık, tarih-saatte daha geniş. */
function boxWidthClass({ range, mode }: PickerState): string {
  if (mode === "datetime") return range ? "max-w-[26rem]" : "max-w-60";
  return range ? "max-w-80" : "max-w-52";
}

type ElRef<T> = React.RefObject<T | null>;

/**
 * Dışarı tıklama taslağı atıp kapatır; paneldeyken Escape kapatıp alana
 * döner; seçimle kapanınca odak body'ye düştüyse alana geri verilir.
 */
function usePickerDismiss(state: PickerState, anchorRef: ElRef<HTMLDivElement>, panelRef: ElRef<HTMLDivElement>, inputs: ElRef<(HTMLInputElement | null)[]>, resetFocusPanel: () => void) {
  const { open, slot, close } = state;
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      closeRef.current();
      resetFocusPanel();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !panelRef.current?.contains(document.activeElement)) return;
      e.preventDefault();
      closeRef.current();
      resetFocusPanel();
      inputs.current?.[slot]?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    // Yakalama aşaması: Modal'ın (belge düzeyi) Escape dinleyicisinden ÖNCE işlenip `preventDefault` ile işaretlenir.
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refler kararlı
  }, [open, slot]);

  const wasOpen = useRef(open);
  useEffect(() => {
    if (wasOpen.current && !open && document.activeElement === document.body) inputs.current?.[slot]?.focus();
    if (!open) resetFocusPanel();
    wasOpen.current = open;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, slot]);
}

/**
 * Faz 16.5 — yapı ant.design DatePicker/RangePicker/TimePicker'dan; 16.0
 * kararıyla tek motor: `mode="date" | "time" | "datetime"`, `picker`
 * (gün/ay/yıl), `range` (iki alan, gün modunda iki aylık panel, üzerine
 * gelince önizleme). Alan yazılabilir (biçim `format`, ayraçlar esnek);
 * takvim Calendar ile ortak (APG date grid). Bağımlılık yok.
 *
 * Erişilebilirlik: alan(lar) `aria-haspopup="dialog"` + `aria-expanded`;
 * fareyle açılınca odak alanda kalır, ↓ odağı takvime (ya da saat
 * sütununa) taşır; Escape kapatır ve alana döner; Enter yazılanı uygular.
 * Panel `role="dialog"`, adı işlevi ("Tarih aralığı seç").
 */
export function DatePicker(outerProps: DatePickerProps) {
  const props = useFieldControl(outerProps) as DatePickerProps;
  const {
    allowClear = true,
    clearLabel = "Temizle",
    disabled = false,
    size = "md",
    variant = "outline",
    shape = "default",
    color,
    placement = "bottom-start",
    id,
    name,
    required,
    className,
    skeleton = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  } = props;
  const state = usePickerState(props);
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const panelId = useId();
  const [focusPanel, setFocusPanel] = useState(false);
  const coords = useFloatingPosition(state.open, anchorRef, panelRef, { placement, gap: GAP_PX });
  usePickerDismiss(state, anchorRef, panelRef, inputs, () => setFocusPanel(false));

  // Genişlik iskeletle ORTAK — yüklenince kutu kaymasın.
  const geometry = cn("flex w-full items-center gap-2", sizeClass[size], getShapeClasses(shape, variant), boxWidthClass(state));
  if (skeleton) return <div {...skeletonBoxProps(cn(geometry, className))} />;

  const rangeProps = props as DatePickerRangeProps;
  const basePlaceholder = formatPlaceholder(state.format);
  const placeholders: [string, string] = state.range ? (rangeProps.placeholder ?? [basePlaceholder, basePlaceholder]) : [(props.placeholder as string | undefined) ?? basePlaceholder, ""];
  const rangeLabels = rangeProps.rangeLabels ?? ["Başlangıç", "Bitiş"];
  const hasValue = state.values.some((v) => v !== null);
  const Icon = state.mode === "time" ? ClockIcon : CalendarIcon;

  /** Odak bileşenin (alanlar + panel) dışına çıkınca: yazılanı uygula, kapat. */
  const onFocusOut = (e: React.FocusEvent) => {
    const to = e.relatedTarget as Node | null;
    if (anchorRef.current?.contains(to) || panelRef.current?.contains(to)) return;
    state.commitText(state.slot);
    state.close();
    setFocusPanel(false);
  };

  const slotInput = (slot: 0 | 1) => (
    <SlotInput
      state={state}
      slot={slot}
      id={slot === 0 ? id : undefined}
      label={state.range ? rangeLabels[slot] : ariaLabel}
      labelledBy={state.range ? undefined : ariaLabelledBy}
      describedBy={ariaDescribedBy}
      placeholder={placeholders[slot]}
      panelId={panelId}
      disabled={disabled}
      required={required}
      invalid={color === "error"}
      inputRef={(el) => (inputs.current[slot] = el)}
      onOpenWithFocus={() => {
        setFocusPanel(true);
        state.setOpen(true);
      }}
    />
  );

  return (
    <>
      <div
        ref={anchorRef}
        role={state.range ? "group" : undefined}
        aria-labelledby={state.range ? ariaLabelledBy : undefined}
        aria-label={state.range ? ariaLabel : undefined}
        onBlur={onFocusOut}
        onMouseDown={(e) => {
          const t = e.target as HTMLElement;
          if (disabled || t.tagName === "INPUT" || t.closest("button")) return;
          e.preventDefault();
          inputs.current[state.open ? state.slot : 0]?.focus();
          state.setOpen(!state.open);
        }}
        className={cn(
          geometry,
          "group relative cursor-text",
          touchTargetClass[size],
          FIELD_BASE_CLASS,
          getVariantClasses(variant, color),
          disabled && FIELD_DISABLED_CLASS,
          className
        )}
      >
        {slotInput(0)}
        {state.range && (
          <>
            <ArrowRightIcon aria-hidden size={14} className="shrink-0 text-mari-muted" />
            {slotInput(1)}
          </>
        )}
        {allowClear && (
          <ClearButton
            visible={hasValue && !disabled}
            label={clearLabel}
            onClear={() => {
              state.clear();
              inputs.current[0]?.focus();
            }}
          />
        )}
        <Icon aria-hidden size={16} className="shrink-0 text-mari-muted" />
        {name && state.values.map((v, i) => <input key={i} type="hidden" name={name} value={isoValue(v, state.mode)} />)}
      </div>
      {state.open && (
        <PickerPanel
          ref={panelRef}
          id={panelId}
          coords={coords}
          state={state}
          props={props}
          takeFocus={focusPanel}
          onFocusOut={onFocusOut}
        />
      )}
    </>
  );
}
