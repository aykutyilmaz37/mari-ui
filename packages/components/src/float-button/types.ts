import type React from "react";
import type { ColorRole } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export type FloatButtonShape = "circle" | "square";
export type FloatButtonPlacement = "bottom-right" | "bottom-left" | "top-right" | "top-left";

export interface FloatButtonBadge {
  count?: number | string;
  dot?: boolean;
  color?: ColorRole;
}

export interface FloatButtonProps extends SkeletonableProps {
  icon?: React.ReactNode;
  /** İkonun altında kısa metin (yalnız `square`); verilirse erişilebilir ad da odur. */
  description?: React.ReactNode;
  /** Üzerine gelince/odakta ipucu. Verilmezse ve `description` yoksa `aria-label` zorunlu. */
  tooltip?: React.ReactNode;
  /** Verilmezse yüzey rengi (nötr); verilirse rolün dolu rengi (ör. `primary` = ana eylem). */
  color?: ColorRole;
  /** Varsayılan: `circle`. Grupta grubun şekli geçerli. */
  shape?: FloatButtonShape;
  /** Sayı ya da nokta rozeti (okunmamış mesaj gibi). */
  badge?: FloatButtonBadge;
  /** Bağlantı olarak çizilir. */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /**
   * Tek başına kullanımda ekrandaki köşe. Varsayılan: `bottom-right`. Grupta
   * yok sayılır (grup konumlanır).
   */
  placement?: FloatButtonPlacement;
  "aria-label"?: string;
  className?: string;
}

interface FloatButtonGroupBaseProps extends SkeletonableProps {
  /** Varsayılan: `circle`. Kare grup tek bir kart gibi birleşik çizilir. */
  shape?: FloatButtonShape;
  /** Varsayılan: `bottom-right`. */
  placement?: FloatButtonPlacement;
  children: React.ReactNode;
  className?: string;
}

export interface FloatButtonGroupStaticProps extends FloatButtonGroupBaseProps {
  /** Verilmezse düğmeler hep görünür, alt alta. */
  trigger?: undefined;
}

export interface FloatButtonGroupMenuProps extends FloatButtonGroupBaseProps {
  /** Ana düğme menüyü açar/kapatır; düğmeler onun üstünde (ya da altında) açılır. */
  trigger: "click" | "hover";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Ana düğmenin ikonu (kapalıyken). Açıkken kapat (×) ikonu. */
  icon?: React.ReactNode;
  /** Ana düğmenin erişilebilir adı. Varsayılan: "Hızlı işlemler". */
  "aria-label"?: string;
  color?: ColorRole;
  tooltip?: React.ReactNode;
}

export type FloatButtonGroupProps = FloatButtonGroupStaticProps | FloatButtonGroupMenuProps;

export interface BackTopProps extends Omit<FloatButtonProps, "href" | "target" | "description"> {
  /** Bu kadar kaydırılınca görünür (px). Varsayılan: 400. */
  visibilityHeight?: number;
  /** Kaydırılan öğe. Varsayılan: pencere. */
  target?: () => HTMLElement | null;
  /**
   * Başa dönünce odak buraya taşınır — düğme gizlenince odak kaybolmasın.
   * Varsayılan: hedefin (ya da sayfanın) ilk `h1`i, yoksa `main`, yoksa hedefin kendisi.
   */
  focusTarget?: () => HTMLElement | null;
}
