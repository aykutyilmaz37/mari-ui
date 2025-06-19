import React from "react";
import clsx from "clsx";
import { BreadcrumbItemType } from "./types";

export type BreadcrumbProps = {
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
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  separator = "/",
  className,
  itemRender,
  params = {},
}) => {
  const paths: string[] = [];

  return (
    <nav className={clsx("flex items-center text-sm text-gray-500", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (item.path) {
          paths.push(item.path);
        }

        const content = itemRender ? (
          itemRender(item, params, items, paths)
        ) : item.href ? (
          <a
            href={item.href}
            className={clsx("hover:underline", item.className)}
            onClick={item.onClick}
          >
            {item.title}
          </a>
        ) : (
          <span className={clsx(item.className)} onClick={item.onClick}>
            {item.title}
          </span>
        );

        return (
          <span key={index} className="flex items-center">
            {content}
            {!isLast && <span className="mx-2">{separator}</span>}
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
