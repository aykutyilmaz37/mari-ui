import type React from "react";

export interface BreadcrumbItemType {
  title: React.ReactNode;
  href?: string;
  path?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  className?: string;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItemType[];
  separator?: React.ReactNode;
  className?: string;
  itemRender?: (
    route: BreadcrumbItemType,
    params: Record<string, unknown>,
    routes: BreadcrumbItemType[],
    paths: string[]
  ) => React.ReactNode;
  params?: Record<string, unknown>;
}
