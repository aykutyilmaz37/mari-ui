import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type ProgressStatus = "normal" | "active" | "success" | "exception";

export interface ProgressProps extends SkeletonableProps {
  /** 0–100. Sınır dışı değerler kırpılır. */
  percent?: number;
  /** Varsayılan: `line`. */
  type?: "line" | "circle";
  /**
   * `active`: çubukta akan parıltı (süren işlem); `success`: yeşil + ✓;
   * `exception`: kırmızı + ✕. `percent` 100 olunca kendiliğinden `success`.
   */
  status?: ProgressStatus;
  /** Doluluk rengi. Varsayılan: `primary` (durum verilince durumun rengi). */
  color?: ColorRole;
  /** İkinci, tamamlanmış kısım (ör. %90 yüklendi, %60 işlendi) — başarı renginde, `percent`in altında. */
  success?: { percent: number };
  /** Çizgiyi N eşit parçaya böler (şifre gücü, adım sayacı). */
  steps?: number;
  /** Yüzde metni/ikon. Varsayılan: `true`. */
  showInfo?: boolean;
  /** Metni özelleştir: `(percent) => "3 / 5 dosya"`. Ekran okuyucu da bunu okur (`aria-valuetext`). */
  format?: (percent: number) => React.ReactNode;
  /** Çizgide kalınlık, dairede çap: sm / md / lg. Varsayılan: `md`. */
  size?: "sm" | "md" | "lg";
  /** Erişilebilir ad (ya da `aria-labelledby`) — "Dosya yükleniyor" gibi. */
  "aria-label"?: string;
  "aria-labelledby"?: string;
  className?: string;
}
