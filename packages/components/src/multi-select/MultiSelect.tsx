"use client";

import React from "react";
import { Tag } from "../tag";
import { optionLabel, SelectBase } from "../select/SelectBase";
import type { MultiSelectProps } from "../select/types";
import type { SelectState } from "../select/useSelectState";

export type { MultiSelectProps };

function SelectTags({ state, maxTagCount, disabled }: Readonly<{ state: SelectState; maxTagCount?: number; disabled: boolean }>) {
  const shown = maxTagCount === undefined ? state.selectedOptions : state.selectedOptions.slice(0, maxTagCount);
  const hidden = state.selectedOptions.length - shown.length;
  return (
    <>
      {shown.map((option) => {
        const label = optionLabel(option);
        return (
          <Tag
            key={String(option.value)}
            onClose={disabled ? undefined : () => state.removeValue(option.value)}
            closeLabel={typeof label === "string" ? `${label} seçimini kaldır` : "Seçimi kaldır"}
            className="max-w-full"
          >
            {label}
          </Tag>
        );
      })}
      {hidden > 0 && <Tag>+{hidden}</Tag>}
    </>
  );
}

/**
 * Çoklu seçim: seçilenler etiket (`Tag`) olarak görünür, liste seçimden sonra
 * açık kalır; arama kutusunda Backspace son etiketi siler. Görünüm, klavye ve
 * erişilebilirlik `Select` ile aynı gövdeden (`SelectBase`) gelir.
 */
export function MultiSelect({ maxTagCount, ...props }: Readonly<MultiSelectProps>) {
  return (
    <SelectBase
      {...props}
      mode="multiple"
      renderTags={(state, disabled) => <SelectTags state={state} maxTagCount={maxTagCount} disabled={disabled} />}
    />
  );
}
