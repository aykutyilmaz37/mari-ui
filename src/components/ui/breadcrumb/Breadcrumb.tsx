import React from "react";
import clsx from "clsx";
import { BreadcrumbItemType } from "./types";
import { twMerge } from "tailwind-merge";

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
    <nav
      className={twMerge(
        clsx("flex items-center text-sm text-gray-500", className)
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        if (item.path) {
          paths.push(item.path);
        }

        let content;

        if (itemRender) {
          content = itemRender(item, params, items, paths);
        } else if (item.href) {
          content = (
            <a
              href={item.href}
              className={twMerge(clsx("hover:underline", item.className))}
              onClick={item.onClick}
            >
              {item.title}
            </a>
          );
        } else {
          content = (
            <span
              className={twMerge(clsx(item.className))}
              role="none"
              onClick={item.onClick}
            >
              {item.title}
            </span>
          );
        }

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
