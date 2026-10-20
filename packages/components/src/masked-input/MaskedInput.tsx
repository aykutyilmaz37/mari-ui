"use client";

import type React from "react";
import { InputMask } from "@react-input/mask";
import { createInput } from "../input/createInput";
import type { InputProps } from "../input/types";

export interface MaskedInputProps extends InputProps {
  /** Biçim kalıbı; `replacement`'taki anahtar karakterler kullanıcı girişiyle dolar (örn. `"0(5__) ___ __ __"`). */
  mask: string;
  /** Kalıptaki yer tutucu → kabul edilen karakter. Varsayılan: `{ _: /\d/ }` (yalnız rakam). */
  replacement?: Record<string, RegExp>;
}

/**
 * Girişi bir biçime zorlayan Input (telefon, kart numarası, tarih…). Input'la
 * aynı görünüm ve prop'lar + `mask`/`replacement`. @react-input/mask (~5 KB
 * min+gz) yalnız bu bileşeni kullanan sayfaya gelir; düz `Input` taşımaz.
 */
export const MaskedInput = /* @__PURE__ */ createInput({ MaskInput: InputMask }, "MaskedInput") as React.ForwardRefExoticComponent<
  MaskedInputProps & React.RefAttributes<HTMLInputElement>
>;
