import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextWeight = "normal" | "medium" | "semibold" | "bold";

/**
 * Taşan metni kısaltır. `true` → tek satır + "…"; `{ rows: n }` → n satırdan
 * sonra kısalt (2–5). Kısaltılan metnin tamamı için `title` verin.
 */
export type TypographyEllipsis = boolean | { rows: 2 | 3 | 4 | 5 };

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement>, SkeletonableProps {
  children?: React.ReactNode;
  className?: string;
  /** Varsayılan: `neutral` (gövde metni rengi, `foreground` token'ı). */
  color?: ColorRole;
  weight?: TextWeight;
  muted?: boolean;
  ellipsis?: TypographyEllipsis;
}

export interface ParagraphProps extends React.HTMLAttributes<HTMLParagraphElement>, SkeletonableProps {
  children?: React.ReactNode;
  className?: string;
  color?: ColorRole;
  muted?: boolean;
  ellipsis?: TypographyEllipsis;
  /** `skeleton` iken çizilecek satır sayısı. Varsayılan: 3. */
  skeletonRows?: number;
}

export interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement>, SkeletonableProps {
  level?: TitleLevel;
  children?: React.ReactNode;
  className?: string;
  color?: ColorRole;
  ellipsis?: TypographyEllipsis;
}
