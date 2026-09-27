import type React from "react";
import type { Size } from "@mari-ui/core";

export type SkeletonButtonShape = "circle" | "round" | "square" | "default";
export type SkeletonAvatarShape = "circle" | "square";

export interface SkeletonAvatarProps {
  active?: boolean;
  shape?: SkeletonAvatarShape;
  size?: number | Size;
}

export interface SkeletonTitleProps {
  width?: number | string;
}

export interface SkeletonParagraphProps {
  rows?: number;
  width?: number | string | Array<number | string>;
}

export interface SkeletonProps {
  /** Parıltı animasyonu. Varsayılan: `false` (düz). */
  active?: boolean;
  /**
   * Verilirse iskelet `role="status"` ile bu adı duyurur. Varsayılan: iskelet
   * ekran okuyucudan gizli (`aria-hidden`) — sayfada 12 kart iskeleti varken 12
   * kez "yükleniyor" okunmasın; yüklenen bölgeye `aria-busy` verin.
   */
  label?: string;
  avatar?: boolean | SkeletonAvatarProps;
  loading?: boolean;
  paragraph?: boolean | SkeletonParagraphProps;
  round?: boolean;
  title?: boolean | SkeletonTitleProps;
  className?: string;
  children?: React.ReactNode;
}

export interface SkeletonBlockProps {
  width?: number | string;
  height?: number | string;
  /** Varsayılan: `"md"`. */
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  active?: boolean;
  className?: string;
}
