"use client";

import React from "react";
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
  className,
}: RadioGroupProps) {
  const [selectedValue, setSelectedValue] = useControllableState<string | number | undefined>({
    value,
    defaultValue,
    onChange: (v) => v !== undefined && onChange?.(v),
  });

  const parsedOptions: RadioOption[] = options.map((opt) =>
    typeof opt === "string" || typeof opt === "number" ? { label: opt, value: opt } : opt
  );

  return (
    <div className={cn("flex gap-2 flex-wrap", block && "w-full", className)}>
      {parsedOptions.map((opt) => (
        <Radio
          key={opt.value}
          value={opt.value}
          name={name}
          label={opt.label}
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
