import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface BadgeProps extends SkeletonableProps {
  /** Sayı ya da kısa metin ("Yeni"). `0` varsayılan olarak gizlenir (`showZero`). */
  count?: number | string;
  /** Bu sayıdan büyükse "N+" gösterilir. Varsayılan: `99`. */
  overflowCount?: number;
  /** `count` 0 iken de göster. Varsayılan: `false`. */
  showZero?: boolean;
  /** Sayı yerine küçük bir nokta (ör. "okunmamış var"). */
  dot?: boolean;
  /** Varsayılan: `error` (bildirim kırmızısı). */
  color?: ColorRole;
  /** `sm` 16px / `md` 20px kabarcık. Varsayılan: `md`. */
  size?: "sm" | "md";
  /**
   * Ekran okuyucuya okunacak metin, ör. "3 okunmamış bildirim". Kabarcık
   * görseldir; sarılan öğe bir düğmeyse sayıyı düğmenin kendi adına katmak
   * daha iyidir (`aria-label="Bildirimler, 3 okunmamış"`).
   */
  label?: string;
  /** Kabarcığı köşeden kaydır: `[x, y]` (CSS uzunluğu ya da px sayısı). */
  offset?: [number | string, number | string];
  /** Kabarcığın üstüne sarılan öğe (ikon düğmesi, avatar). Verilmezse kabarcık tek başına durur. */
  children?: React.ReactNode;
  className?: string;
}

export interface StatusBadgeProps extends SkeletonableProps {
  /** Durum rengi — nokta bu renkte. */
  color?: ColorRole;
  /** Durum metni ("Aktif", "Beklemede"). Renk tek başına anlam taşımaz; metin zorunlu. */
  children: React.ReactNode;
  /** Süren bir işlem: nokta nabız gibi atar (hareket azaltmada durur). */
  processing?: boolean;
  className?: string;
}
