"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Radio } from "./Radio";
import type { RadioVariant, RadioType, RadioSize } from "./types";

export type RadioGroupProps = {
  name?: string;
  value?: string | number;
  defaultValue?: string | number;
  disabled?: boolean;
  options?: (
    | string
    | number
    | {
        label: React.ReactNode;
        value: string | number;
        disabled?: boolean;
      }
  )[];
  onChange?: (value: string | number) => void;
  variant?: RadioVariant;
  type?: RadioType;
  size?: RadioSize;
  block?: boolean;
  className?: string;
};

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  defaultValue,
  disabled = false,
  options = [],
  onChange,
  variant = "outline",
  type = "primary",
  size = "middle",
  block = false,
  className,
}) => {
  const [selectedValue, setSelectedValue] = useState(value ?? defaultValue);

  const handleChange = (val: string | number) => {
    setSelectedValue(val);
    onChange?.(val);
  };

  const parsedOptions = options.map((opt) =>
    typeof opt === "string" || typeof opt === "number"
      ? { label: opt, value: opt }
      : opt
  );

  return (
    <div className={clsx("flex gap-2 flex-wrap", block && "w-full", className)}>
      {parsedOptions.map((opt) => (
        <Radio
          key={opt.value}
          value={opt.value}
          name={name}
          label={opt.label}
          disabled={disabled || opt.disabled}
          checked={selectedValue === opt.value}
          onChange={() => handleChange(opt.value)}
          size={size}
          variant={variant}
          type={type}
        />
      ))}
    </div>
  );
};

RadioGroup.displayName = "RadioGroup";
