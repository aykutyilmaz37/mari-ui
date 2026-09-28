"use client";

import React, { useId } from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { Radio } from "./Radio";
import type { RadioGroupProps, RadioOption } from "./types";

export type { RadioGroupProps };

export function RadioGroup({
  name,
  value,
  defaultValue,
  disabled = false,
  options = [],
  onChange,
  variant = "outline",
  color,
  type,
  size = "md",
  block = false,
  orientation = "horizontal",
  className,
  skeleton = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: RadioGroupProps) {
  const [selectedValue, setSelectedValue] = useControllableState<string | number | undefined>({
    value,
    defaultValue,
    onChange: (v) => v !== undefined && onChange?.(v),
  });

  // Faz 15: `name` verilmezse radyolar tarayıcı gözünde tek bir grup OLMUYORDU —
  // Ok tuşlarıyla gezinme çalışmıyor, Tab her seçenekte duruyordu. Otomatik ad.
  const autoName = useId();
  const groupName = name ?? autoName;

  const parsedOptions: RadioOption[] = options.map((opt) =>
    typeof opt === "string" || typeof opt === "number" ? { label: opt, value: opt } : opt
  );

  return (
    // `role="radiogroup"` eskiden yoktu — birden çok `<input type="radio">`
    // sadece aynı `name`'i paylaşarak native olarak bir grup oluşturuyordu
    // ama ekran okuyucuya bunun tek bir SEÇİM grubu olduğu (ve varsa grubun
    // adının) ayrıca duyurulması gerekir.
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-orientation={orientation}
      aria-busy={skeleton || undefined}
      className={cn("flex", orientation === "vertical" ? "flex-col gap-3" : "flex-wrap gap-x-4 gap-y-2", block && "w-full", className)}
    >
      {parsedOptions.map((opt) => (
        <Radio
          key={opt.value}
          value={opt.value}
          name={groupName}
          label={opt.label}
          description={opt.description}
          skeleton={skeleton}
          disabled={disabled || opt.disabled}
          checked={selectedValue === opt.value}
          onChange={() => setSelectedValue(opt.value)}
          size={size}
          variant={variant}
          color={color}
          type={type}
        />
      ))}
    </div>
  );
}

RadioGroup.displayName = "RadioGroup";
