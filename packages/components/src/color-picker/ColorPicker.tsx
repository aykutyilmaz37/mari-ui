"use client";

import React, { useContext, useEffect, useId, useRef, useState } from "react";
import { cn, useControllableState, type Size } from "@mari-ui/core";
import { FIELD_BASE_CLASS, FIELD_DISABLED_CLASS, getVariantClasses } from "../input/utils";
import { FieldContext, useFieldControl } from "../lib/fieldContext";
import { skeletonBoxProps } from "../lib/skeleton";
import { touchTargetClass } from "../lib/sizeClasses";
import { Popover } from "../popover";
import { ColorArea } from "./_components/ColorArea";
import { ColorInputs } from "./_components/ColorInputs";
import { ColorPresets } from "./_components/ColorPresets";
import { ColorSlider, HUE_GRADIENT } from "./_components/ColorSlider";
import { Swatch } from "./_components/Swatch";
import type { ColorFormat, ColorInfo, ColorPickerProps, Hsba } from "./types";
import { colorInfo, describeColor, formatColor, parseColor } from "./utils";

export type { ColorPickerProps };

/** Hiç renk yokken panelin başladığı renk (primary ailesine yakın bir mavi). */
const FALLBACK: Hsba = { h: 212, s: 71, b: 64, a: 1 };

/** Yükseklik Input/Select ile aynı; renk kutusu her boyutta 3px iç boşlukla oturur. */
const TRIGGER_CLASS: Record<Size, string> = {
  sm: "h-6 text-xs gap-1 rounded-sm",
  md: "h-8 text-sm gap-2 rounded-md",
  lg: "h-10 text-base gap-2 rounded-md",
};
const SQUARE_CLASS: Record<Size, string> = { sm: "w-6", md: "w-8", lg: "w-10" };
const TEXT_PAD_CLASS: Record<Size, string> = { sm: "pr-2", md: "pr-3", lg: "pr-4" };
const SWATCH_CLASS: Record<Size, string> = { sm: "size-4 rounded-sm", md: "size-6 rounded-sm", lg: "size-8 rounded-sm" };

/**
 * Kontrollü/kontrolsüz renk durumu. İç model HSB — dışarıya `format`taki metin
 * verilir. Kontrollü `value` yalnız BİZİM bildirdiğimizden farklıysa yeniden
 * ayrıştırılır; böylece gri bir renkte (ton bilgisi yok) sürüklerken seçilen
 * ton kaybolmaz.
 */
function useColorState(props: ColorPickerProps, format: ColorFormat) {
  const { value, defaultValue, onChange, onChangeComplete, disabledAlpha = false } = props;
  const controlled = value !== undefined;
  const normalize = (c: Hsba | null) => (c && disabledAlpha ? { ...c, a: 1 } : c);
  const [color, setColor] = useState<Hsba | null>(() => normalize(parseColor(controlled ? value : defaultValue)));
  const emitted = useRef<string | null | undefined>(controlled ? value : undefined);
  const current = useRef(color);
  current.current = color;
  // Renk temizlense de panel son rengi göstermeye devam eder.
  const lastColor = useRef<Hsba>(color ?? FALLBACK);

  useEffect(() => {
    if (!controlled || value === emitted.current) return;
    emitted.current = value;
    const parsed = normalize(parseColor(value));
    setColor(parsed);
    if (parsed) lastColor.current = parsed;
    // normalize yalnız disabledAlpha'ya bağlı; value değişince yeterli.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlled, value]);

  const toOutput = (c: Hsba | null): [string | null, ColorInfo | null] => (c ? [formatColor(c, format), colorInfo(c)] : [null, null]);

  const set = (next: Hsba | null, complete: boolean) => {
    const c = normalize(next);
    setColor(c);
    current.current = c;
    if (c) lastColor.current = c;
    const [text, info] = toOutput(c);
    emitted.current = text;
    onChange?.(text, info);
    if (complete) onChangeComplete?.(text, info);
  };

  return {
    color,
    draft: color ?? lastColor.current,
    set,
    /** Sürükleme bitti: son değeri kesinleştir. */
    complete: () => onChangeComplete?.(...toOutput(current.current)),
  };
}

interface PanelProps {
  state: ReturnType<typeof useColorState>;
  format: ColorFormat;
  setFormat: (f: ColorFormat) => void;
  props: ColorPickerProps;
}

function ColorPanel({ state, format, setFormat, props }: Readonly<PanelProps>) {
  const { allowClear = false, disabledAlpha = false, presets } = props;
  const { color, draft, set, complete } = state;
  const opaque = colorInfo({ ...draft, a: 1 }).hex;

  return (
    <div className="flex flex-col gap-3">
      {allowClear && (
        <button
          type="button"
          aria-pressed={color === null}
          onClick={() => set(null, true)}
          className="flex items-center gap-2 self-start rounded-sm text-xs text-mari-muted outline-none pointer-coarse:py-3 hover:text-mari-foreground focus-visible:ring-2 focus-visible:ring-mari-ring"
        >
          <Swatch color={null} className="size-4 rounded-sm" />
          Renk yok
        </button>
      )}
      <ColorArea color={draft} onChange={(s, b) => set({ ...draft, s, b }, false)} onChangeEnd={complete} />
      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <ColorSlider
            label="Ton"
            value={Math.round(draft.h)}
            min={0}
            max={360}
            valueText={`${Math.round(draft.h)} derece`}
            background={HUE_GRADIENT}
            thumbColor={colorInfo({ h: draft.h, s: 100, b: 100, a: 1 }).hex}
            onChange={(h) => set({ ...draft, h }, false)}
            onChangeEnd={complete}
          />
          {!disabledAlpha && (
            <ColorSlider
              label="Opaklık"
              value={Math.round(draft.a * 100)}
              min={0}
              max={100}
              valueText={`%${Math.round(draft.a * 100)}`}
              background={`linear-gradient(to right, transparent, ${opaque})`}
              checker
              thumbColor={colorInfo(draft).rgb}
              onChange={(a) => set({ ...draft, a: a / 100 }, false)}
              onChangeEnd={complete}
            />
          )}
        </div>
        <Swatch color={color} className="size-7 rounded-md" />
      </div>
      <ColorInputs color={draft} format={format} onFormatChange={setFormat} disabledAlpha={disabledAlpha} onChange={(c) => set(c, true)} />
      {presets && presets.length > 0 && <ColorPresets presets={presets} current={color} onPick={(c) => set(c, true)} />}
    </div>
  );
}

function triggerText(showText: ColorPickerProps["showText"], color: Hsba | null, format: ColorFormat): React.ReactNode {
  if (!showText) return null;
  if (typeof showText === "function") return showText(color ? colorInfo(color) : null);
  if (!color) return <span className="text-mari-muted">Renk yok</span>;
  const text = formatColor(color, format);
  return format === "hex" ? text.toUpperCase() : text;
}

/**
 * Faz 16.4 — yapı ant.design ColorPicker'dan: renk kutulu tetikleyici + panel
 * (doygunluk/parlaklık alanı, ton ve opaklık kaydırıcıları, HEX/RGB/HSB
 * girişleri, hazır renk grupları, "renk yok"). Panel Popover üstünde (konum,
 * kapanma, odak yönetimi ortak); tetikleyici Input/Select ile aynı yükseklik
 * ve kenarlık.
 *
 * Erişilebilirlik: tetikleyici `aria-haspopup="dialog"` + `aria-expanded`,
 * seçili renk açıklamada (`aria-describedby`) okunur. Açılınca odak 2B alana
 * geçer; alan ve kaydırıcılar `role="slider"` ile ok tuşlarıyla kullanılır,
 * her değer metin girişiyle de verilebilir. Escape kapatır, odak geri döner.
 */
export function ColorPicker(outerProps: Readonly<ColorPickerProps>) {
  const props = useFieldControl(outerProps) as ColorPickerProps;
  const {
    defaultFormat = "hex",
    showText = false,
    trigger = "click",
    placement = "bottom-start",
    size = "md",
    color: statusColor,
    disabled = false,
    id,
    name,
    className,
    skeleton = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  } = props;
  const inField = useContext(FieldContext) !== null;
  const [format, setFormat] = useControllableState<ColorFormat>({ value: props.format, defaultValue: defaultFormat, onChange: props.onFormatChange });
  const [open, setOpen] = useControllableState<boolean>({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const state = useColorState(props, format);
  const valueId = useId();

  const text = triggerText(showText, state.color, format);
  const geometry = cn("inline-flex shrink-0 items-center pl-[0.1875rem]", TRIGGER_CLASS[size], text ? TEXT_PAD_CLASS[size] : cn(SQUARE_CLASS[size], "justify-center pl-0"));
  // İskelet gerçek içeriği (renk kutusu + metin) şeffaf çizer: genişlik metne göre birebir, yüklenince kayma yok.
  if (skeleton) {
    return (
      <span {...skeletonBoxProps(cn(geometry, "border border-transparent", className))}>
        <span className={cn("block shrink-0", SWATCH_CLASS[size])} />
        {text && <span className="truncate">{text}</span>}
      </span>
    );
  }

  const button = (
    <button
      type="button"
      id={id}
      disabled={disabled}
      // Field içindeyse ad `<label htmlFor>`dan gelir; aria-label onu ezerdi.
      aria-label={ariaLabelledBy || inField ? ariaLabel : (ariaLabel ?? "Renk seç")}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={[valueId, ariaDescribedBy].filter(Boolean).join(" ")}
      aria-invalid={statusColor === "error" || undefined}
      className={cn(
        geometry,
        "relative cursor-pointer border text-mari-foreground outline-none",
        touchTargetClass[size],
        FIELD_BASE_CLASS,
        getVariantClasses("outline", statusColor),
        disabled && FIELD_DISABLED_CLASS,
        className
      )}
    >
      <Swatch color={state.color} className={SWATCH_CLASS[size]} />
      {text && <span className="truncate">{text}</span>}
      <span id={valueId} className="sr-only">
        {describeColor(state.color)}
      </span>
    </button>
  );

  const hidden = name ? <input type="hidden" name={name} value={state.color ? formatColor(state.color, format) : ""} /> : null;

  if (disabled) {
    return (
      <>
        {button}
        {hidden}
      </>
    );
  }

  return (
    <>
      <Popover
        trigger={trigger}
        placement={placement}
        arrow={false}
        open={open}
        onOpenChange={setOpen}
        aria-label="Renk seçici"
        className="w-60 max-w-[calc(100vw-1rem)] pointer-coarse:w-72"
        content={<ColorPanel state={state} format={format} setFormat={setFormat} props={props} />}
      >
        {button}
      </Popover>
      {hidden}
    </>
  );
}
