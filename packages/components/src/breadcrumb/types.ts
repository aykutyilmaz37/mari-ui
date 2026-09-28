import type React from "react";
import type { SkeletonableProps } from "../lib/skeleton";
import type { LinkTarget } from "../lib/linkBehavior";

/** Bir öğenin açılır menüsündeki kardeş sayfa (ör. aynı seviyedeki diğer kategoriler). */
export interface BreadcrumbMenuItem {
  key?: React.Key;
  title: React.ReactNode;
  href?: string;
  /** `href`in açılacağı yer; `_blank` → yeni sekme. */
  target?: LinkTarget;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
}

export interface BreadcrumbItemType {
  title: React.ReactNode;
  href?: string;
  /** `href`in açılacağı yer; `_blank` → yeni sekme (`rel="noopener noreferrer"` + ikon otomatik). */
  target?: LinkTarget;
  path?: string;
  /** Başlığın solunda gösterilen ikon (14px'e ölçeklenir). */
  icon?: React.ReactNode;
  /**
   * Öğe bir açılır menü tetikleyicisi olur: başlığın yanında aşağı ok, tıklayınca
   * kardeş sayfalar listelenir. Menülü öğenin kendi `href`i kullanılmaz.
   */
  menu?: { items: BreadcrumbMenuItem[] };
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement | HTMLSpanElement>) => void;
  className?: string;
}

export interface BreadcrumbProps extends SkeletonableProps {
  items?: BreadcrumbItemType[];
  separator?: React.ReactNode;
  className?: string;
  /**
   * Öğe sayısı bunu aşarsa ilk öğe ile son `maxItems - 1` öğe arasındakiler tek
   * bir "…" düğmesine katlanır; düğmeye basınca hepsi açılır. Dar ekranlarda
   * uzun yolları iki satıra taşmaktan korur. En az 2.
   */
  maxItems?: number;
  /** `<nav>`ın erişilebilir adı. Varsayılan "Gezinme yolu". */
  "aria-label"?: string;
  itemRender?: (
    route: BreadcrumbItemType,
    params: Record<string, unknown>,
    routes: BreadcrumbItemType[],
    paths: string[]
  ) => React.ReactNode;
  params?: Record<string, unknown>;
}
