"use client";

import React, { createContext, useContext } from "react";
import { cn, useControllableState, type Size } from "@mari-ui/core";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { InfiniteScrollFooter } from "../lib/infiniteScroll";
import { Empty } from "../empty";
import { Loading } from "../loading";
import { Pagination } from "../pagination";
import { SkeletonBlock } from "../skeleton";
import type { ListItemLayout, ListItemMetaProps, ListItemProps, ListPagination, ListProps } from "./types";
import { getPageSlice, gridClassName, resolveRowKey } from "./utils";

export type { ListProps, ListItemProps, ListItemMetaProps };

interface ListContextValue {
  size: Size;
  bordered: boolean;
  itemLayout: ListItemLayout;
  grid: boolean;
  skeleton: boolean;
}

const ListContext = createContext<ListContextValue>({ size: "md", bordered: false, itemLayout: "horizontal", grid: false, skeleton: false });

/*
 * ant.design ölçüleri: sm 8/16, md 12/24, lg 16/24px (çerçevesizde yatay dolgu yok).
 */
const PAD_Y: Record<Size, string> = { sm: "py-2", md: "py-3", lg: "py-4" };
const PAD_X: Record<Size, string> = { sm: "px-4", md: "px-6", lg: "px-6" };

function rowPadding({ size, bordered }: Pick<ListContextValue, "size" | "bordered">): string {
  return cn(PAD_Y[size], bordered && PAD_X[size]);
}

const DEFAULT_PAGE_SIZE = 10;

function PlaceholderRow({ layout }: Readonly<{ layout: ListItemLayout }>) {
  if (layout === "vertical") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <SkeletonBlock active width="2rem" height="2rem" radius="full" />
          <SkeletonBlock active width="35%" height="1rem" radius="sm" />
        </div>
        <SkeletonBlock active width="100%" height="0.75rem" radius="sm" />
        <SkeletonBlock active width="80%" height="0.75rem" radius="sm" />
      </div>
    );
  }
  // Satır kutuları `ListItemMeta` ile aynı (20px başlık + 2px + 20px açıklama) →
  // veri gelince tipik bir satır aynı yükseklikte kalır.
  return (
    <div className="flex items-start gap-4">
      <SkeletonBlock active width="2rem" height="2rem" radius="full" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex h-5 items-center">
          <SkeletonBlock active width="40%" height="0.875rem" radius="sm" />
        </div>
        <div className="flex h-5 items-center">
          <SkeletonBlock active width="70%" height="0.75rem" radius="sm" />
        </div>
      </div>
    </div>
  );
}

const CELL_PLACEHOLDER = <SkeletonBlock active height="7rem" radius="lg" />;

/** Veri henüz yokken (ilk yükleme) satır ya da hücre biçiminde yer tutucular. */
function Placeholders({ count, ctx, gridClass }: Readonly<{ count: number; ctx: ListContextValue; gridClass?: string }>) {
  const rows = Array.from({ length: count }, (_, i) => i);
  return (
    <div aria-hidden data-skeleton="" className={gridClass ?? "divide-y divide-mari-border"}>
      {rows.map((i) => (
        <div key={i} className={gridClass ? undefined : rowPadding(ctx)}>
          {gridClass ? CELL_PLACEHOLDER : <PlaceholderRow layout={ctx.itemLayout} />}
        </div>
      ))}
    </div>
  );
}

/** Başlık/alt bilgi gibi serbest bölge: kenarlığı görünür kalır, içeriği iskelete döner. */
function Region({ skeleton, className, children }: Readonly<{ skeleton: boolean; className?: string; children: React.ReactNode }>) {
  return (
    <div className={className}>
      <ContentSkeleton on={skeleton} fallback={<SkeletonBlock active width="30%" height="0.875rem" radius="sm" />}>
        {children}
      </ContentSkeleton>
    </div>
  );
}

function usePagedData<T>(data: T[], config: ListPagination | undefined) {
  const [page, setPage] = useControllableState<number>({ value: config?.currentPage, defaultValue: config?.defaultPage ?? 1 });
  const [pageSize, setPageSize] = useControllableState<number>({ value: config?.pageSize, defaultValue: config?.defaultPageSize ?? DEFAULT_PAGE_SIZE });
  // Sayfalamasız ilk yüklemede 3 yer tutucu satır; sayfalıda sayfa boyu (en çok 10).
  if (!config) return { items: data, offset: 0, page, pageSize: 3, setPage, setPageSize, total: data.length };
  // Sunucu tarafı: `dataSource` zaten o sayfa.
  if (config.totalItems !== undefined) return { items: data, offset: (page - 1) * pageSize, page, pageSize, setPage, setPageSize, total: config.totalItems };
  const slice = getPageSlice(data, page, pageSize);
  return { items: slice.items, offset: slice.offset, page: slice.page, pageSize, setPage, setPageSize, total: data.length };
}

function ListPager({
  config,
  paged,
  placement,
  skeleton,
  className,
}: Readonly<{
  config: ListPagination;
  paged: ReturnType<typeof usePagedData>;
  placement: "top" | "bottom";
  skeleton: boolean;
  className?: string;
}>) {
  const position = config.position ?? "bottom";
  if (paged.total === 0 || (position !== placement && position !== "both")) return null;
  return (
    <div className={className}>
      <Pagination
        align="end"
        {...config}
        skeleton={skeleton}
        totalItems={paged.total}
        currentPage={paged.page}
        pageSize={paged.pageSize}
        showSizeChanger={config.showSizeChanger ?? Boolean(config.onPageSizeChange)}
        onPageChange={(p, s) => {
          paged.setPage(p);
          config.onPageChange?.(p, s);
        }}
        onPageSizeChange={(s, p) => {
          paged.setPageSize(s);
          config.onPageSizeChange?.(s, p);
        }}
      />
    </div>
  );
}

/**
 * Semantik: `<ul>` + `<li>`; eylemler kendi `<ul>`sunda. `skeleton`: her satır
 * kendi içeriğini ölçüp kendi şeklinde iskelet çizer (ayırıcılar görünür kalır);
 * veri yoksa sayfa boyu kadar genel satır. `loading`: mevcut satırlar yerinde
 * soluklaşır (Loading sarmalama).
 *
 * React Native karşılığı henüz yok (bkz. `@mari-ui/native` README) — prop
 * sözleşmesi (`dataSource`/`renderItem`/`rowKey`/`header`/`footer`/`empty`)
 * FlatList'e birebir taşınabilecek şekilde seçildi.
 */
export function List<T>({
  dataSource,
  renderItem,
  rowKey,
  children,
  header,
  footer,
  bordered = false,
  split = true,
  size = "md",
  itemLayout = "horizontal",
  grid,
  pagination,
  loadMore,
  infinite,
  loading = false,
  empty,
  className,
  skeleton = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: Readonly<ListProps<T>>) {
  const data = dataSource ?? [];
  const config = pagination || undefined;
  const paged = usePagedData(data, config);
  const ctx: ListContextValue = { size, bordered, itemLayout, grid: Boolean(grid), skeleton };
  const gridClass = grid ? gridClassName(grid) : undefined;
  const showSplit = split && !grid;

  const rendered =
    renderItem && dataSource
      ? paged.items.map((item, i) => (
          <React.Fragment key={resolveRowKey(item, paged.offset + i, rowKey)}>{renderItem(item, paged.offset + i)}</React.Fragment>
        ))
      : children;
  const hasItems = React.Children.count(rendered) > 0;

  let body: React.ReactNode;
  if (hasItems) {
    body = (
      <ul
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        className={cn(gridClass, showSplit && "divide-y divide-mari-border", grid && bordered && rowPadding(ctx))}
      >
        {rendered}
      </ul>
    );
  } else if (skeleton) {
    body = <Placeholders count={Math.min(paged.pageSize, 10)} ctx={ctx} gridClass={gridClass && cn(gridClass, bordered && rowPadding(ctx))} />;
  } else {
    body = <div className={rowPadding(ctx)}>{empty ?? <Empty size="sm" title="Kayıt yok" />}</div>;
  }

  const pager = (placement: "top" | "bottom") =>
    config && (
      <ListPager
        config={config}
        paged={paged}
        placement={placement}
        skeleton={skeleton}
        className={cn(rowPadding(ctx), showSplit && (placement === "top" ? "border-b border-mari-border" : "border-t border-mari-border"))}
      />
    );

  return (
    <ListContext.Provider value={ctx}>
      <div
        aria-busy={skeleton || loading || undefined}
        className={cn("text-sm text-mari-foreground", bordered && "overflow-hidden rounded-lg border border-mari-border bg-mari-surface", className)}
      >
        {header && (
          <Region skeleton={skeleton} className={cn(rowPadding(ctx), "font-medium", split && "border-b border-mari-border")}>
            {header}
          </Region>
        )}
        {pager("top")}
        <Loading spinning={loading}>{body}</Loading>
        {infinite && !skeleton && hasItems && <InfiniteScrollFooter options={infinite} className={cn(showSplit && "border-t border-mari-border")} />}
        {loadMore && (
          <Region skeleton={skeleton} className={cn("flex justify-center", PAD_Y[size], showSplit && "border-t border-mari-border")}>
            {loadMore}
          </Region>
        )}
        {pager("bottom")}
        {footer && (
          <Region skeleton={skeleton} className={cn(rowPadding(ctx), "text-mari-muted", split && "border-t border-mari-border")}>
            {footer}
          </Region>
        )}
      </div>
    </ListContext.Provider>
  );
}

function ItemActions({ actions, className }: Readonly<{ actions: React.ReactNode[]; className?: string }>) {
  return (
    <ul className={cn("flex shrink-0 flex-wrap items-center text-mari-muted", className)}>
      {actions.map((action, i) => (
        <li
          // Eylemler sabit, sıralanmaz.
          key={i}
          className={cn(
            "relative flex items-center px-2 first:pl-0 last:pr-0",
            "not-last:after:absolute not-last:after:top-1/2 not-last:after:right-0 not-last:after:h-3.5 not-last:after:w-px not-last:after:-translate-y-1/2 not-last:after:bg-mari-border"
          )}
        >
          {action}
        </li>
      ))}
    </ul>
  );
}

function ItemLayout({ ctx, children, actions, extra }: Pick<ListItemProps, "children" | "actions" | "extra"> & { ctx: ListContextValue }) {
  const actionList = actions && actions.length > 0 ? actions : undefined;
  if (ctx.itemLayout === "vertical") {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {children}
          {actionList && <ItemActions actions={actionList} />}
        </div>
        {extra && <div className="order-first shrink-0 sm:order-last">{extra}</div>}
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      <div className="flex min-w-0 flex-1 basis-56 items-center gap-4">{children}</div>
      {actionList && <ItemActions actions={actionList} className="ml-auto" />}
      {extra && <div className="shrink-0">{extra}</div>}
    </div>
  );
}

/** Tek satır / ızgara hücresi. `List`in içinde kullanılır. */
export function ListItem({ children, actions, extra, className, ...rest }: Readonly<ListItemProps>) {
  const ctx = useContext(ListContext);

  if (ctx.grid) {
    return (
      <li className={cn("min-w-0", className)} {...rest}>
        <ContentSkeleton on={ctx.skeleton} fallback={CELL_PLACEHOLDER}>
          {children}
        </ContentSkeleton>
      </li>
    );
  }

  return (
    <li className={cn(rowPadding(ctx), className)} {...rest}>
      <ContentSkeleton on={ctx.skeleton} fallback={<PlaceholderRow layout={ctx.itemLayout} />}>
        <ItemLayout ctx={ctx} actions={actions} extra={extra}>
          {children}
        </ItemLayout>
      </ContentSkeleton>
    </li>
  );
}

/** Avatar + başlık + açıklama bloğu. */
export function ListItemMeta({ avatar, title, description, className }: Readonly<ListItemMetaProps>) {
  const { itemLayout } = useContext(ListContext);
  const vertical = itemLayout === "vertical";
  return (
    <div className={cn("flex min-w-0 flex-1 items-start gap-4", className)}>
      {avatar && <div className="flex shrink-0">{avatar}</div>}
      {/* Boşluksuz uzun metin (e-posta, URL) dar ekranda yandaki öğenin altına taşmasın. */}
      <div className="min-w-0 flex-1 break-words">
        {title && <div className={cn("font-medium text-mari-foreground", vertical ? "text-base" : "leading-5", description && (vertical ? "mb-1" : "mb-0.5"))}>{title}</div>}
        {description && <div className="leading-5 text-mari-muted">{description}</div>}
      </div>
    </div>
  );
}
