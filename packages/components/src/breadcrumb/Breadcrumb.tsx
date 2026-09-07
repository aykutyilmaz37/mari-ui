import React from "react";
import type { BreadcrumbProps } from "./types";
import { getItemClass, getNavClass } from "./utils";

export type { BreadcrumbProps };

// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Breadcrumb({ items = [], separator = "/", className, itemRender, params = {} }: BreadcrumbProps) {
  const paths: string[] = [];

  return (
    <nav className={getNavClass(className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (item.path) paths.push(item.path);

        let content: React.ReactNode;
        if (itemRender) {
          content = itemRender(item, params, items, paths);
        } else if (item.href) {
          content = (
            <a href={item.href} className={getItemClass(item.className)} onClick={item.onClick}>
              {item.title}
            </a>
          );
        } else {
          content = (
            <span className={item.className} role="none" onClick={item.onClick}>
              {item.title}
            </span>
          );
        }

        return (
          <span key={item.path ?? item.href ?? index} className="flex items-center">
            {content}
            {!isLast && <span className="mx-2">{separator}</span>}
          </span>
        );
      })}
    </nav>
  );
}
