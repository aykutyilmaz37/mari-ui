"use client";

import type React from "react";
import { createTextarea, type TextareaProps } from "../input/Textarea";
import type { MentionsConfig } from "./types";
import { useMention } from "./useMention";

export interface MentionTextareaProps extends TextareaProps {
  /** `@` ile bahsetme — `MentionInput`'taki `mentions` ile aynı. */
  mentions: MentionsConfig;
}

/**
 * `@` ile bahsetme destekli çok satırlı alan. Textarea'yla aynı görünüm ve
 * prop'lar + `mentions`; öneri paneli yalnız bu bileşenle gelir.
 */
export const MentionTextarea = /* @__PURE__ */ createTextarea({ useMention }, "MentionTextarea") as React.ForwardRefExoticComponent<
  MentionTextareaProps & React.RefAttributes<HTMLTextAreaElement>
>;
