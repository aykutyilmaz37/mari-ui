"use client";

import { useId, useState } from "react";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { ColorPreset, Hsba } from "../types";
import { describeColor, isLight, parseColor, sameColor } from "../utils";
import { Swatch } from "./Swatch";

interface PresetGroupProps {
  preset: ColorPreset;
  current: Hsba | null;
  disabled?: boolean;
  onPick: (color: Hsba) => void;
}

function PresetGroup({ preset, current, disabled, onPick }: Readonly<PresetGroupProps>) {
  const [open, setOpen] = useState(preset.defaultOpen ?? true);
  const listId = useId();
  const colors = preset.colors.map((text) => ({ text, hsba: parseColor(text) })).filter((c): c is { text: string; hsba: Hsba } => c.hsba !== null);

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 rounded-sm py-0.5 pointer-coarse:py-3 text-left text-xs text-mari-muted outline-none hover:text-mari-foreground focus-visible:ring-2 focus-visible:ring-mari-ring"
      >
        <ChevronRightIcon aria-hidden size={14} className={cn("transition-transform duration-150 motion-reduce:transition-none", open && "rotate-90")} />
        {preset.label}
      </button>
      <ul id={listId} hidden={!open} className="mt-1.5 grid grid-cols-10 gap-1.5 pointer-coarse:grid-cols-5">
        {colors.map(({ text, hsba }) => {
          const selected = sameColor(current, hsba);
          return (
            <li key={text} className="flex">
              <button
                type="button"
                aria-label={describeColor(hsba)}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onPick(hsba)}
                className="relative aspect-square w-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-mari-ring focus-visible:ring-offset-1 focus-visible:ring-offset-mari-surface disabled:cursor-not-allowed"
              >
                <Swatch color={hsba} className="size-full rounded-sm" />
                {selected && (
                  <CheckIcon
                    aria-hidden
                    size={12}
                    strokeWidth={3}
                    className={cn("absolute inset-0 m-auto", isLight(hsba) ? "text-mari-neutral-solid" : "text-white")}
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Hazır renk grupları; her grup başlığı açılır/kapanır (ant.design gibi). Seçili renk ✓ ve `aria-pressed`. */
export function ColorPresets({ presets, current, disabled, onPick }: Readonly<{ presets: ColorPreset[]; current: Hsba | null; disabled?: boolean; onPick: (color: Hsba) => void }>) {
  return (
    <div className="flex flex-col gap-2 border-t border-mari-border pt-2">
      {presets.map((preset, i) => (
        // Başlık ReactNode olabilir — sıra anahtarı.
        <PresetGroup key={i} preset={preset} current={current} disabled={disabled} onPick={onPick} />
      ))}
    </div>
  );
}
