"use client";

import { useEffect, useState } from "react";
import { Input } from "../../input";
import { InputNumber } from "../../input-number";
import { Segmented } from "../../segmented";
import type { ColorFormat, Hsba } from "../types";
import { clamp, colorInfo, hsbToRgb, parseColor, rgbToHsb } from "../utils";

const FORMAT_OPTIONS = [
  { value: "hex", label: "HEX" },
  { value: "rgb", label: "RGB" },
  { value: "hsb", label: "HSB" },
];

interface ColorInputsProps {
  color: Hsba;
  format: ColorFormat;
  onFormatChange: (format: ColorFormat) => void;
  disabledAlpha: boolean;
  disabled?: boolean;
  /** Girişten gelen değer kesin bir değerdir — `onChangeComplete` de tetiklenir. */
  onChange: (color: Hsba) => void;
}

/** Hex: 6/8 hane yazılınca anında, 3/4 hane alandan çıkınca/Enter'da uygulanır; geçersizse eski değere döner. */
function HexInput({ color, disabled, onChange }: Readonly<{ color: Hsba; disabled?: boolean; onChange: (c: Hsba) => void }>) {
  const hex = colorInfo(color).hex.slice(1);
  const [text, setText] = useState(hex);
  // Dışarıdan (alan/kaydırıcı) değişince metni eşitle.
  useEffect(() => setText(hex), [hex]);

  const commit = (value: string) => {
    const parsed = parseColor(`#${value}`);
    // Hex'te ton bilgisi yoksa (gri) mevcut tonu koru.
    if (parsed) onChange(parsed.s === 0 ? { ...parsed, h: color.h } : parsed);
    else setText(hex);
  };

  return (
    <Input
      size="sm"
      aria-label="Hex renk kodu"
      icon={<span className="text-mari-muted">#</span>}
      value={text}
      maxLength={8}
      autoComplete="off"
      disabled={disabled}
      className="min-w-0 flex-1 font-mono uppercase"
      onChange={(e) => {
        const next = e.target.value.replace(/[^\da-f]/gi, "");
        setText(next);
        if (next.length === 6 || next.length === 8) commit(next);
      }}
      onBlur={() => commit(text)}
      onPressEnter={() => commit(text)}
    />
  );
}

interface ChannelProps {
  label: string;
  value: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function Channel({ label, value, max, disabled, onChange }: Readonly<ChannelProps>) {
  return (
    <InputNumber
      size="sm"
      aria-label={label}
      value={Math.round(value)}
      min={0}
      max={max}
      controls={false}
      grouping={false}
      disabled={disabled}
      className="min-w-0 flex-1"
      onChange={(v) => v !== null && onChange(clamp(v, 0, max))}
    />
  );
}

function ChannelInputs({ color, format, disabled, onChange }: Readonly<{ color: Hsba; format: "rgb" | "hsb"; disabled?: boolean; onChange: (c: Hsba) => void }>) {
  if (format === "hsb") {
    return (
      <>
        <Channel label="Ton" value={color.h} max={360} disabled={disabled} onChange={(h) => onChange({ ...color, h })} />
        <Channel label="Doygunluk" value={color.s} max={100} disabled={disabled} onChange={(s) => onChange({ ...color, s })} />
        <Channel label="Parlaklık" value={color.b} max={100} disabled={disabled} onChange={(b) => onChange({ ...color, b })} />
      </>
    );
  }
  const rgba = hsbToRgb(color);
  const set = (patch: Partial<typeof rgba>) => {
    const next = rgbToHsb({ ...rgba, ...patch });
    onChange(next.s === 0 ? { ...next, h: color.h } : next);
  };
  return (
    <>
      <Channel label="Kırmızı" value={rgba.r} max={255} disabled={disabled} onChange={(r) => set({ r })} />
      <Channel label="Yeşil" value={rgba.g} max={255} disabled={disabled} onChange={(g) => set({ g })} />
      <Channel label="Mavi" value={rgba.b} max={255} disabled={disabled} onChange={(b) => set({ b })} />
    </>
  );
}

/** Biçim seçimi (HEX/RGB/HSB) + o biçimin alanları + saydamlık yüzdesi. */
export function ColorInputs({ color, format, onFormatChange, disabledAlpha, disabled, onChange }: Readonly<ColorInputsProps>) {
  return (
    <div className="flex flex-col gap-2">
      <Segmented size="sm" block aria-label="Renk biçimi" options={FORMAT_OPTIONS} value={format} disabled={disabled} onChange={(v) => onFormatChange(v as ColorFormat)} />
      <div className="flex items-center gap-1">
        {format === "hex" ? (
          <HexInput color={color} disabled={disabled} onChange={onChange} />
        ) : (
          <ChannelInputs color={color} format={format} disabled={disabled} onChange={onChange} />
        )}
        {!disabledAlpha && (
          <InputNumber
            size="sm"
            aria-label="Opaklık"
            value={Math.round(color.a * 100)}
            min={0}
            max={100}
            suffix="%"
            controls={false}
            disabled={disabled}
            className="w-16 shrink-0"
            onChange={(v) => v !== null && onChange({ ...color, a: clamp(v, 0, 100) / 100 })}
          />
        )}
      </div>
    </div>
  );
}
