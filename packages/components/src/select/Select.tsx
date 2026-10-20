"use client";

import React from "react";
import { SelectBase } from "./SelectBase";
import type { SelectProps } from "./types";

export type { SelectProps };

/**
 * Tekli seçim. Çoklu seçim (etiketler) ayrı bir bileşen:
 * `MultiSelect` (`@mari-ui/components/multi-select`) — tekli kullanan
 * (Calendar başlığı vb.) etiket kodunu taşımasın diye.
 */
export function Select(props: Readonly<SelectProps>) {
  return <SelectBase {...props} />;
}
