import type { ReactNode } from "react";
import type { TextProps as RNTextProps } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/Skeleton";

export type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type TextWeight = "normal" | "medium" | "semibold" | "bold";

/**
 * Taşan metni kısaltır. `true` → tek satır + "…"; `{ rows: n }` → n satırdan
 * sonra kısaltır (2–5). Native karşılığı `numberOfLines`.
 */
export type TypographyEllipsis = boolean | { rows: 2 | 3 | 4 | 5 };

interface TypographyBaseProps extends Omit<RNTextProps, "children">, SkeletonableProps {
  children?: ReactNode;
  /** Varsayılan: gövde metni rengi (`foreground`). */
  color?: ColorRole;
  ellipsis?: TypographyEllipsis;
}

export interface TextProps extends TypographyBaseProps {
  weight?: TextWeight;
  muted?: boolean;
}

export interface ParagraphProps extends TypographyBaseProps {
  muted?: boolean;
  /** `skeleton` iken çizilecek satır sayısı. Varsayılan: 3. */
  skeletonRows?: number;
}

export interface TitleProps extends TypographyBaseProps {
  /** HIG metin stilleri: 1 Large Title 34 · 2 Title 1 28 · 3 Title 2 22 · 4 Title 3 20 · 5 Headline 17 · 6 Subheadline 15. */
  level?: TitleLevel;
}
