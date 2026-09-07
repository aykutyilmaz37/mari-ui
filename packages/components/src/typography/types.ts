import type React from "react";
import type { ColorRole } from "@mari-ui/core";

export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextWeight = "normal" | "medium" | "semibold" | "bold";

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
  className?: string;
  /** Varsayılan: `neutral` (gövde metni rengi, `foreground` token'ı). */
  color?: ColorRole;
  weight?: TextWeight;
  muted?: boolean;
}

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  className?: string;
  color?: ColorRole;
  muted?: boolean;
}

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: TitleLevel;
  children?: React.ReactNode;
  className?: string;
  color?: ColorRole;
}
