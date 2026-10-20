"use client";

import type React from "react";
import { createInput } from "../input/createInput";
import type { InputProps } from "../input/types";
import type { MentionsConfig } from "./types";
import { useMention } from "./useMention";

export interface MentionInputProps extends InputProps {
  /**
   * `@` ile bahsetme: tetik karakteri yazılınca imlecin altında öneri listesi
   * açılır, seçilen değer metne yazılır.
   */
  mentions: MentionsConfig;
}

/**
 * `@` ile bahsetme destekli tek satırlık alan. Input'la aynı görünüm ve
 * prop'lar + `mentions`. Öneri paneli (Select'in listesi) yalnız bu bileşeni
 * kullanan sayfaya gelir; düz `Input` taşımaz.
 */
export const MentionInput = /* @__PURE__ */ createInput({ useMention }, "MentionInput") as React.ForwardRefExoticComponent<
  MentionInputProps & React.RefAttributes<HTMLInputElement>
>;
