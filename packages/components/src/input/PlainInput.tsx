"use client";

import type React from "react";
import { createInput } from "./createInput";
import type { InputProps } from "./types";

/** `PlainInput`'un desteklemediği (bundle'a girmeyen) özellikler. */
export type PlainInputProps = Omit<InputProps, "mask" | "replacement" | "mentions">;

/**
 * İÇ kullanım: `mask` ve `mentions` olmadan Input — @react-input/mask ve öneri
 * paneli bundle'a girmez (bkz. `createInput`). Paket dışına export edilmez;
 * tüketici her zaman tam `Input`'u kullanır.
 */
export const PlainInput = /* @__PURE__ */ createInput({}) as React.ForwardRefExoticComponent<
  PlainInputProps & React.RefAttributes<HTMLInputElement>
>;
