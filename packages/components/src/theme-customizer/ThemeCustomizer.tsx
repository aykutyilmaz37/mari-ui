"use client";

import React, { useEffect, useId } from "react";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import {
  BLACK,
  WHITE,
  defaultThemeSettings,
  lightTheme,
  pickAccessibleForeground,
  type ColorSchemePreference,
  type HexColor,
  type SpacingDensity,
  type ThemeSettings,
} from "@mari-ui/tokens";
import { ColorPicker } from "../color-picker";
import { Segmented } from "../segmented";
import { skeletonBoxProps } from "../lib/skeleton";
import { applyTheme } from "./applyTheme";
import type { ThemeAccentOption, ThemeCustomizerProps, ThemeCustomizerSection } from "./types";

export type { ThemeCustomizerProps };

const ALL_SECTIONS: ThemeCustomizerSection[] = ["mode", "color", "spacing"];

/** Parlak sarı/camgöbeği bilinçli olarak listede: otomatik kontrast düzeltmesi onları zeminde görünür kılar. */
export const defaultAccentColors: ThemeAccentOption[] = [
  { value: "#2563eb", label: "Mavi" },
  { value: "#0891b2", label: "Camgöbeği" },
  { value: "#16a34a", label: "Yeşil" },
  { value: "#eab308", label: "Sarı" },
  { value: "#ea580c", label: "Turuncu" },
  { value: "#dc2626", label: "Kırmızı" },
  { value: "#db2777", label: "Pembe" },
];

/** Dar yerleşimde (çekmece, <20rem) ikon sarmalayıcısıyla gizlenir — etiket kesilmez, boşluk kalmaz. */
const MODE_ICON_RESPONSIVE = "[&_span:has(>svg)]:hidden @xs:[&_span:has(>svg)]:flex";

const MODE_OPTIONS: Array<{ value: ColorSchemePreference; label: string; icon: React.ReactNode }> = [
  { value: "light", label: "Açık", icon: <SunIcon aria-hidden /> },
  { value: "dark", label: "Koyu", icon: <MoonIcon aria-hidden /> },
  { value: "system", label: "Sistem", icon: <MonitorIcon aria-hidden /> },
];

const SPACING_OPTIONS: Array<{ value: SpacingDensity; label: string }> = [
  { value: "compact", label: "Sıkı" },
  { value: "normal", label: "Normal" },
  { value: "comfortable", label: "Rahat" },
];

const HEX6 = /^#[0-9a-f]{6}$/i;
const DEFAULT_SWATCH = lightTheme.color.primary.solid;

interface SwatchProps {
  name: string;
  color: HexColor;
  label: string;
  checked: boolean;
  disabled: boolean;
  skeleton: boolean | undefined;
  onSelect: () => void;
}

/** Gerçek radyo düğmesi (ok tuşları, tek Tab durağı tarayıcıdan) + görünen daire. */
function Swatch({ name, color, label, checked, disabled, skeleton, onSelect }: Readonly<SwatchProps>) {
  if (skeleton) return <span {...skeletonBoxProps("size-8 rounded-full")} />;
  return (
    <label
      className={cn(
        "relative grid size-8 place-items-center rounded-full",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mari-ring",
        checked && "ring-2 ring-mari-foreground ring-offset-2 ring-offset-mari-surface",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        "pointer-coarse:before:absolute pointer-coarse:before:-inset-1.5"
      )}
      style={{ backgroundColor: color }}
      title={label}
    >
      <input type="radio" name={name} className="sr-only" checked={checked} disabled={disabled} onChange={onSelect} aria-label={label} />
      {checked && <CheckIcon aria-hidden className="size-4" style={{ color: pickAccessibleForeground(color, [WHITE, BLACK]) }} />}
    </label>
  );
}

/**
 * Faz 16.8 — son kullanıcının uygulamanın görünümünü kişiselleştirdiği panel:
 * mod (açık/koyu/sistem), vurgu rengi, boşluk yoğunluğu. Kendi tasarımımız
 * (ant referansı yok). Satır içi durur; Popover/Drawer/ayarlar sayfasına
 * yerleştirmek tüketicinin işi.
 *
 * Seçim `applyTheme` ile anında uygulanır (provider yok). Seçilen vurgu rengi
 * zeminde görünür olacak kadar otomatik koyulaştırılır/açılır — kullanıcı
 * bozuk tema üretemez. Örnekte kullanıcının seçtiği renk gösterilir.
 */
export function ThemeCustomizer({
  value,
  defaultValue,
  onChange,
  apply = true,
  target,
  sections = ALL_SECTIONS,
  colors = defaultAccentColors,
  allowCustom = false,
  disabled = false,
  skeleton,
  className,
}: Readonly<ThemeCustomizerProps>) {
  const id = useId();
  const [settings, setSettings] = useControllableState<ThemeSettings>({
    value,
    defaultValue: { ...defaultThemeSettings, ...defaultValue },
    onChange,
  });
  const { mode, primary, spacing } = settings;

  useEffect(() => {
    if (!apply) return;
    // Temizlik yok (bilerek): panel kapanınca tema geri alınmamalı.
    applyTheme({ mode, primary, spacing }, target?.current ?? undefined);
  }, [apply, target, mode, primary, spacing]);

  const update = (patch: Partial<ThemeSettings>) => setSettings({ ...settings, ...patch });
  const isPreset = !primary || colors.some((c) => c.value.toLowerCase() === primary.toLowerCase());
  const customValue = primary && !isPreset ? primary : null;

  const renderSection = (section: ThemeCustomizerSection) => {
    const labelId = `${id}-${section}`;
    const heading = (text: string) => (
      <p id={labelId} className="mb-2 text-sm font-medium text-mari-foreground">
        {text}
      </p>
    );

    if (section === "mode") {
      return (
        <div key={section}>
          {heading("Görünüm")}
          <Segmented
            block
            aria-labelledby={labelId}
            options={MODE_OPTIONS}
            className={MODE_ICON_RESPONSIVE}
            value={mode}
            onChange={(next) => update({ mode: next as ColorSchemePreference })}
            disabled={disabled}
            skeleton={skeleton}
          />
        </div>
      );
    }

    if (section === "spacing") {
      return (
        <div key={section}>
          {heading("Yoğunluk")}
          <Segmented
            block
            aria-labelledby={labelId}
            options={SPACING_OPTIONS}
            value={spacing}
            onChange={(next) => update({ spacing: next as SpacingDensity })}
            disabled={disabled}
            skeleton={skeleton}
          />
        </div>
      );
    }

    const swatches: Array<{ value: HexColor | undefined; color: HexColor; label: string }> = [
      { value: undefined, color: DEFAULT_SWATCH, label: "Varsayılan" },
      ...colors.map((c) => ({ value: c.value, color: c.value, label: c.label })),
    ];
    return (
      <div key={section}>
        {heading("Vurgu rengi")}
        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-labelledby={labelId} className="flex flex-wrap gap-3">
            {swatches.map((swatch) => (
              <Swatch
                key={swatch.label}
                name={`${id}-accent`}
                color={swatch.color}
                label={swatch.label}
                checked={swatch.value === undefined ? !primary : primary?.toLowerCase() === swatch.value.toLowerCase()}
                disabled={disabled}
                skeleton={skeleton}
                onSelect={() => update({ primary: swatch.value })}
              />
            ))}
          </div>
          {allowCustom && (
            <div className={cn("rounded-md", customValue && "ring-2 ring-mari-foreground ring-offset-2 ring-offset-mari-surface")}>
              <ColorPicker
                aria-label="Özel renk"
                disabledAlpha
                // Boşken "renk yok" (çizgili) simgesi yanıltıcıydı: seçici o anki
                // renkten başlar; halka yalnız özel renk seçiliyken.
                value={customValue ?? primary ?? DEFAULT_SWATCH}
                onChange={(next) => {
                  if (next && HEX6.test(next)) update({ primary: next.toLowerCase() as HexColor });
                }}
                disabled={disabled}
                skeleton={skeleton}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return <div className={cn("@container flex flex-col gap-5", className)}>{sections.map(renderSection)}</div>;
}
