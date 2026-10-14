"use client";

import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Dropdown, DropdownContent, DropdownItem, DropdownTrigger } from "../dropdown";
import { skeletonFill } from "../lib/skeleton";
import { SkeletonSlot } from "../lib/SkeletonSlot";
import { NewTabHint, getLinkAttrs } from "../lib/linkBehavior";
import type { BreadcrumbItemType, BreadcrumbProps } from "./types";
import {
  getInteractiveClass,
  getNavClass,
  getPathsByIndex,
  getStaticClass,
  getVisibleIndexes,
  itemClass,
  listClass,
  separatorClass,
} from "./utils";

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
 * Faz 15.5: ikon, öğe başına açılır menü (`menu`, Dropdown ile), `maxItems`
 * katlama ("…" düğmesi), satır kırılması (375px'te yatay taşma yok), dokunma
 * hedefi, son öğe ön plan renginde ve `skeleton`.
 */
export function Breadcrumb({
  items = [],
  separator = "/",
  className,
  itemRender,
  params = {},
  maxItems,
  skeleton = false,
  "aria-label": ariaLabel = "Gezinme yolu",
}: Readonly<BreadcrumbProps>) {
  const [expanded, setExpanded] = useState(false);
  const pathsByIndex = getPathsByIndex(items);
  const visible = getVisibleIndexes(items.length, maxItems, expanded);
  const lastIndex = items.length - 1;

  const renderContent = (item: BreadcrumbItemType, index: number) => {
    const isCurrent = index === lastIndex;
    const ariaCurrent = isCurrent ? ("page" as const) : undefined;
    if (itemRender) return itemRender(item, params, items, pathsByIndex[index] ?? []);

    const inner = (
      <>
        {item.icon && <span aria-hidden="true" className="inline-flex">{item.icon}</span>}
        {item.title}
      </>
    );

    if (item.menu) {
      return (
        <Dropdown className="inline-flex self-auto">
          <DropdownTrigger className={cn("group", getInteractiveClass(isCurrent, item.className))}>
            {inner}
            <ChevronDownIcon aria-hidden="true" className="transition-transform duration-200 group-aria-expanded:rotate-180" />
          </DropdownTrigger>
          <DropdownContent placement="bottom-start">
            {item.menu.items.map((sub, i) => (
              <DropdownItem key={sub.key ?? sub.href ?? i} href={sub.href} target={sub.target} icon={sub.icon} onClick={sub.onClick}>
                {sub.title}
              </DropdownItem>
            ))}
          </DropdownContent>
        </Dropdown>
      );
    }
    if (item.href) {
      return (
        <a href={item.href} {...getLinkAttrs(item.target)} className={getInteractiveClass(isCurrent, item.className)} onClick={item.onClick} aria-current={ariaCurrent}>
          {inner}
          <NewTabHint target={item.target} />
        </a>
      );
    }
    if (item.onClick) {
      return (
        <button type="button" className={getInteractiveClass(isCurrent, item.className)} onClick={item.onClick} aria-current={ariaCurrent}>
          {inner}
        </button>
      );
    }
    return (
      <span className={getStaticClass(isCurrent, item.className)} aria-current={ariaCurrent}>
        {inner}
      </span>
    );
  };

  return (
    <nav className={getNavClass(className)} aria-label={ariaLabel}>
      <ol className={listClass}>
        {visible.map((index, position) => {
          const isLastShown = position === visible.length - 1;
          const sep = !isLastShown && (
            <span className={separatorClass} aria-hidden="true">
              {separator}
            </span>
          );

          if (index === null) {
            return (
              <li key="collapsed" className={itemClass}>
                <SkeletonSlot on={skeleton} placeholder={<span className={cn("block h-[1lh] rounded-sm", skeletonFill(true))} />}>
                  <button
                    type="button"
                    className={getInteractiveClass(false)}
                    aria-label={`${items.length - visible.length + 1} gizli yolu göster`}
                    onClick={() => setExpanded(true)}
                  >
                    …
                  </button>
                </SkeletonSlot>
                {sep}
              </li>
            );
          }

          const item = items[index];
          if (!item) return null;
          return (
            <li key={item.path ?? item.href ?? index} className={itemClass}>
              <SkeletonSlot on={skeleton} className="min-w-0" placeholder={<span className={cn("block h-[1lh] rounded-sm", skeletonFill(true))} />}>
                {renderContent(item, index)}
              </SkeletonSlot>
              {sep}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
