import type { CSSProperties, ReactNode } from "react";
import type { SlotClassNames, Size } from "@mari-ui/core";

export type CardSlot = "header" | "body" | "footer" | "cover";
export type CardClassNames = SlotClassNames<CardSlot>;

export interface CardProps {
  children: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  footer?: ReactNode;
  /** Varsayılan: `true`. Eskiden `variant: "outlined"|"borderless"` idi —
   * `variant` core'da "dolgu stili" anlamına geldiği için isim çakışırdı. */
  bordered?: boolean;
  hoverable?: boolean;
  loading?: boolean;
  size?: Size;
  /** İç içe/gömülü kart görünümü. Eskiden `type: "inner"` idi — "type" ismi
   * kafa karıştırıcıydı (renk gibi görünüyordu ama layout'tu). */
  inset?: boolean;
  className?: string;
  classNames?: CardClassNames;
  /** @deprecated Hiçbir zaman gerçekten kullanılmıyordu (destructure bile
   * edilmiyordu) — kaldırıldı. Stil için `classNames` kullanın. */
  styles?: Partial<Record<CardSlot, CSSProperties>>;
  onClick?: () => void;
}
