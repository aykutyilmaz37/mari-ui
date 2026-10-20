"use client";

import type React from "react";
import { createInput } from "./createInput";
import type { InputProps } from "./types";

export type { InputProps } from "./types";

/**
 * Tek satırlık metin alanı. Maske için `MaskedInput`
 * (`@mari-ui/components/masked-input`), `@` ile bahsetme için `MentionInput`
 * (`@mari-ui/components/mentions`) — ikisinin kodu da burada yok (bkz. `createInput`).
 */
export const Input = /* @__PURE__ */ createInput({}) as React.ForwardRefExoticComponent<InputProps & React.RefAttributes<HTMLInputElement>>;
