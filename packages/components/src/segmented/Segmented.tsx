"use client";

import React, { useId, useLayoutEffect, useRef, useState } from "react";
import { cn, useControllableState, type Size } from "@mari-ui/core";
import { useFieldGroup, useFieldSkeleton } from "../lib/fieldContext";
import { skeletonBoxProps } from "../lib/skeleton";
import { touchTargetClass } from "../lib/sizeClasses";
import type { SegmentedOption, SegmentedProps, SegmentedValue } from "./types";

export type { SegmentedProps };

/** Kapsayıcı 2px dolgulu; dilim yüksekliği + 4px = Input/Select yüksekliği (24/32/40). */
const SEGMENT_SIZE: Record<Size, string> = {
  sm: "h-5 px-2 text-xs gap-1",
  md: "h-7 px-3 text-sm gap-1.5",
  lg: "h-9 px-4 text-base gap-2",
};

const normalize = (option: SegmentedValue | SegmentedOption): SegmentedOption =>
  typeof option === "object" ? option : { value: option, label: String(option) };

/**
 * Seçili dilimin altında kayan zemin ("thumb"). Konumu DOM'dan ölçülür ve
 * boyut değişince (pencere, `block`, yazı tipi yüklenmesi) yeniden ölçülür.
 * Ölçülene kadar (SSR, ilk kare) seçili dilim zemini kendisi çizer — boş görünmez.
 */
function useThumb(containerRef: React.RefObject<HTMLDivElement | null>, selectedIndex: number) {
  const [rect, setRect] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const measure = () => {
      const segment = container.querySelectorAll<HTMLElement>("[data-segment]")[selectedIndex];
      setRect(segment ? { left: segment.offsetLeft, width: segment.offsetWidth } : null);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, selectedIndex]);
  return rect;
}

/**
 * Faz 16.1 — ant.design Segmented'ın yapısı, Tabs `pills`in görünümü (aynı
 * zemin, aynı kayan beyaz dilim). Tabs'ten ayrı çünkü anlamı farklı: Tabs bir
 * PANEL değiştirir (`tablist`), Segmented bir DEĞER seçer — form kontrolü.
 *
 * Erişilebilirlik: gerçek `<input type="radio">`lar + `role="radiogroup"`.
 * Ok tuşları seçimi taşır, Tab gruba tek durakla girer, `name` ile native
 * forma katılır, disabled seçenek atlanır — hepsi tarayıcının kendisinden.
 * Yalnız ikonlu seçenekte `aria-label` verin.
 */
export function Segmented({
  options,
  value,
  defaultValue,
  onChange,
  block = false,
  size = "md",
  disabled: ownDisabled = false,
  name,
  "aria-label": ownAriaLabel,
  "aria-labelledby": ownAriaLabelledBy,
  className,
  skeleton: ownSkeleton,
}: SegmentedProps) {
  // Field içindeyse etiketi grubun adı olur; ipucu/hata, zorunluluk ve devre dışı oradan.
  const field = useFieldGroup({ "aria-label": ownAriaLabel, "aria-labelledby": ownAriaLabelledBy, disabled: ownDisabled });
  const skeleton = useFieldSkeleton(ownSkeleton);
  const { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy } = field;
  const disabled = !!field.disabled;
  const items = options.map(normalize);
  const fallbackName = useId();
  const groupName = name ?? fallbackName;
  const [current, setCurrent] = useControllableState<SegmentedValue | undefined>({
    value,
    defaultValue: defaultValue ?? items.find((o) => !o.disabled)?.value,
    onChange: onChange as ((v: SegmentedValue | undefined) => void) | undefined,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = items.findIndex((o) => o.value === current);
  const thumb = useThumb(containerRef, selectedIndex);

  const containerClass = cn("relative isolate inline-flex max-w-full rounded-lg bg-mari-surface-alt p-0.5", block && "flex w-full");

  const segments = items.map((option, index) => {
    const selected = index === selectedIndex;
    const optionDisabled = disabled || option.disabled;
    return (
      <label
        key={String(option.value)}
        data-segment=""
        className={cn(
          "relative flex min-w-0 cursor-pointer items-center justify-center rounded-md font-medium transition-colors duration-150",
          SEGMENT_SIZE[size],
          touchTargetClass[size],
          block && "flex-1",
          selected ? "text-mari-foreground" : "text-mari-muted hover:text-mari-foreground",
          // Kayan zemin ölçülene kadar seçili dilim kendi zeminini çizer.
          selected && !thumb && "bg-mari-surface shadow-sm ring-1 ring-mari-border/60",
          optionDisabled && "cursor-not-allowed opacity-50 hover:text-mari-muted",
          // Odak halkası dilimin kendisinde (radyo görünmez).
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-mari-ring"
        )}
      >
        <input
          type="radio"
          name={groupName}
          value={String(option.value)}
          checked={selected}
          disabled={optionDisabled}
          aria-label={option["aria-label"]}
          onChange={() => setCurrent(option.value)}
          className="sr-only"
        />
        {option.icon && (
          <span aria-hidden className="flex shrink-0 items-center [&>svg]:size-4">
            {option.icon}
          </span>
        )}
        {option.label !== undefined && <span className="truncate">{option.label}</span>}
      </label>
    );
  });

  if (skeleton) {
    // Gerçek dilimler görünmez olarak yerinde: iskelet ile yüklü hal birebir aynı genişlikte.
    return (
      <div {...skeletonBoxProps(cn(containerClass, "rounded-lg", className))}>
        <div className="invisible flex w-full">{segments}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={field["aria-describedby"]}
      aria-invalid={field["aria-invalid"]}
      aria-required={field["aria-required"]}
      aria-disabled={disabled || undefined}
      className={cn(containerClass, className)}
    >
      {thumb && selectedIndex >= 0 && (
        <span
          aria-hidden
          className="absolute inset-y-0.5 -z-10 rounded-md bg-mari-surface shadow-sm ring-1 ring-mari-border/60 transition-[left,width] duration-200 ease-out motion-reduce:transition-none"
          style={{ left: thumb.left, width: thumb.width }}
        />
      )}
      {segments}
    </div>
  );
}
