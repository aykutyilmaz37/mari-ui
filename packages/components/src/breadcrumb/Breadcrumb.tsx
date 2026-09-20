import React from "react";
import type { BreadcrumbProps } from "./types";
import { getButtonItemClass, getItemClass, getNavClass } from "./utils";

export type { BreadcrumbProps };

/**
 * Faz 13.5 kullanıcı bulgusu (plan denetiminde de not edilmişti): son öğede
 * `aria-current="page"` YOKTU — ekran okuyucu kullanıcıları hiyerarşideki
 * geçerli konumu bilemiyordu. Yapı da düz `<span>` sarmalayıcılardan
 * ant.design'ın gerçek Breadcrumb'ıyla (DOM incelemesi, ant.design/
 * components/breadcrumb) aynı semantik `<nav><ol><li>` listesine çevrildi;
 * ayırıcı artık `aria-hidden` (ekran okuyucu her öğe arasında "/" okumasın
 * diye). Ayrıca `onClick` VAR ama `href` YOK olan öğeler eskiden `<span
 * role="none">` idi — tıklanabilirdi ama klavyeyle ASLA erişilemiyordu
 * (AutoComplete/Rate/Switch/Tooltip'te bulunanlarla aynı sınıf gerçek bug);
 * artık gerçek bir `<button>`.
 *
 * Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
 */
export function Breadcrumb({ items = [], separator = "/", className, itemRender, params = {} }: BreadcrumbProps) {
  const paths: string[] = [];

  return (
    <nav className={getNavClass(className)} aria-label="Gezinme yolu">
      <ol className="flex items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          if (item.path) paths.push(item.path);

          let content: React.ReactNode;
          if (itemRender) {
            content = itemRender(item, params, items, paths);
          } else if (item.href) {
            content = (
              <a href={item.href} className={getItemClass(item.className)} onClick={item.onClick} aria-current={isLast ? "page" : undefined}>
                {item.title}
              </a>
            );
          } else if (item.onClick) {
            content = (
              <button type="button" className={getButtonItemClass(item.className)} onClick={item.onClick} aria-current={isLast ? "page" : undefined}>
                {item.title}
              </button>
            );
          } else {
            content = (
              <span className={item.className} aria-current={isLast ? "page" : undefined}>
                {item.title}
              </span>
            );
          }

          return (
            <li key={item.path ?? item.href ?? index} className="flex items-center">
              {content}
              {!isLast && (
                <span className="mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
