"use client";

import { InputMask } from "@react-input/mask";
import { useMention } from "./mention/useMention";
import { createInput } from "./createInput";

export type { InputProps } from "./types";

/** Tam özellikli Input: `mask` ve `mentions` dahil (bkz. `createInput`). */
export const Input = /* @__PURE__ */ createInput({ MaskInput: InputMask, useMention });
