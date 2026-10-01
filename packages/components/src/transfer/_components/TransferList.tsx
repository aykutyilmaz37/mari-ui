"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { SearchIcon, XIcon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { Checkbox } from "../../checkbox";
import { Input } from "../../input";
import { borderStrongColorClass } from "../../lib/colorClasses";
import { skeletonBoxProps } from "../../lib/skeleton";
import { SkeletonSlot } from "../../lib/SkeletonSlot";
import type { TransferDirection, TransferItem, TransferProps } from "../types";
import { countLabel, filterItems, itemText, rangeSelect, selectAllState, toggleAll } from "../utils";

export interface TransferListProps {
  direction: TransferDirection;
  title: React.ReactNode;
  items: TransferItem[];
  /** Bu listedeki seçili anahtarlar. */
  selected: string[];
  onSelect: (keys: string[]) => void;
  /** oneWay hedef listesi: işaret kutusu yok, satırda "kaldır". */
  onRemove?: (keys: string[]) => void;
  showSearch: boolean;
  searchPlaceholder: string;
  filterOption: TransferProps["filterOption"];
  onSearch: TransferProps["onSearch"];
  render: TransferProps["render"];
  showSelectAll: boolean;
  footer: TransferProps["footer"];
  notFoundContent: React.ReactNode;
  listHeight: string;
  disabled: boolean;
  color?: ColorRole;
  skeleton: boolean;
}

const plainTitle = (title: React.ReactNode, fallback: string) => (typeof title === "string" ? title : fallback);

function RowContent({ item, render }: { item: TransferItem; render: TransferProps["render"] }) {
  if (render) return <>{render(item)}</>;
  return <span className="block truncate">{item.title}</span>;
}

/** Liste gövdesi iskeleti: kutu + değişken uzunlukta satır (gövde yüksekliği `listHeight` ile sabit). */
function SkeletonRows({ count }: { count: number }) {
  const widths = ["w-32", "w-24", "w-40", "w-28", "w-36"];
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        // Konumsal yer tutucular.
        <li key={i} className="flex items-center gap-2 px-3 py-2">
          <span {...skeletonBoxProps("size-4 shrink-0 rounded-sm")} />
          <span {...skeletonBoxProps(cn("h-3.5 rounded-sm", widths[i % widths.length]))} />
        </li>
      ))}
    </>
  );
}

/**
 * Tek liste: başlık (tümünü seç + sayaç + ad), isteğe bağlı arama, satırlar,
 * alt bilgi. Liste bir `section`, adı başlık; satırlar gerçek işaret kutuları
 * (Tab ile tek tek, Boşluk ile seçilir; Shift ile aralık seçimi).
 */
export function TransferList(props: TransferListProps) {
  const { direction, title, items, selected, onSelect, onRemove, showSearch, searchPlaceholder, filterOption, onSearch, render, showSelectAll, footer, notFoundContent, listHeight, disabled, color, skeleton } = props;
  const titleId = useId();
  const [query, setQuery] = useState("");
  const visible = filterItems(items, query, direction, filterOption);
  const selectedSet = new Set(selected);
  const all = selectAllState(visible, selectedSet);
  const anchor = useRef<string | null>(null);
  const shift = useRef(false);
  const listRef = useRef<HTMLUListElement>(null);
  const name = plainTitle(title, direction === "left" ? "Kaynak" : "Hedef");
  const removable = onRemove !== undefined;

  // oneWay'de satır kaldırılınca odak bir sonraki satırın "kaldır"ına (yoksa listeye) geçer — DOM'dan kalkan düğmeyle body'ye düşmesin.
  const [refocusIndex, setRefocusIndex] = useState<number | null>(null);
  useEffect(() => {
    if (refocusIndex === null) return;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button");
    const target = buttons?.[Math.min(refocusIndex, buttons.length - 1)];
    (target ?? listRef.current)?.focus();
    setRefocusIndex(null);
  }, [refocusIndex]);

  const toggleItem = (key: string, checked: boolean) => {
    if (shift.current) onSelect(rangeSelect(visible, selected, anchor.current, key, checked));
    else onSelect(checked ? [...selected, key] : selected.filter((k) => k !== key));
    anchor.current = key;
  };

  const empty = query.trim() ? "Sonuç bulunamadı" : notFoundContent;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "flex min-w-0 flex-1 flex-col overflow-hidden rounded-lg border bg-mari-surface text-sm",
        color ? borderStrongColorClass[color] : "border-mari-border",
        // Bölümün tamamı soluklaştırılmaz (başlık/sayaç kontrastı düşerdi); kutular kendi devre dışı görünümünde.
        disabled && "bg-mari-surface-alt"
      )}
    >
      <div className="relative flex h-10 shrink-0 items-center gap-2 border-b border-mari-border px-3">
        {!skeleton && showSelectAll && !removable && (
          <Checkbox
            checked={all.checked}
            indeterminate={all.indeterminate}
            disabled={disabled || visible.every((i) => i.disabled)}
            label={<span className="sr-only">{`${name}: görünen öğelerin tümünü seç`}</span>}
            onChange={(e) => onSelect(toggleAll(visible, selected, e.target.checked))}
          />
        )}
        {!skeleton && <span className="text-mari-muted tabular-nums">{countLabel(removable ? 0 : selected.length, items.length)}</span>}
        {!skeleton && removable && items.length > 0 && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onRemove(visible.filter((i) => !i.disabled).map((i) => i.key));
              listRef.current?.focus();
            }}
            className="relative rounded-sm text-xs text-mari-primary outline-none pointer-coarse:before:absolute pointer-coarse:before:inset-x-0 pointer-coarse:before:-inset-y-3.5 hover:underline focus-visible:ring-2 focus-visible:ring-mari-ring disabled:cursor-not-allowed"
          >
            Tümünü kaldır
          </button>
        )}
        <span id={titleId} className={cn("ml-auto truncate font-medium text-mari-foreground", skeleton && "invisible")}>
          {title}
        </span>
        {skeleton && (
          // Başlık yüksekliği sabit (h-10): yalnız çubuklar.
          <span aria-hidden className="absolute inset-x-3 inset-y-0 flex items-center gap-2">
            <span {...skeletonBoxProps("size-4 rounded-sm")} />
            <span {...skeletonBoxProps("h-3.5 w-12 rounded-sm")} />
            <span {...skeletonBoxProps("ml-auto h-3.5 w-20 rounded-sm")} />
          </span>
        )}
      </div>

      {showSearch && (
        <div className="shrink-0 border-b border-mari-border p-2">
          <Input
            skeleton={skeleton}
            size="sm"
            aria-label={`${name} listesinde ara`}
            placeholder={searchPlaceholder}
            icon={<SearchIcon aria-hidden size={14} />}
            allowClear
            disabled={disabled}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(direction, e.target.value);
            }}
            onClear={() => {
              setQuery("");
              onSearch?.(direction, "");
            }}
          />
        </div>
      )}

      <ul
        ref={listRef}
        // Programatik odak hedefi (kaldırma sonrası). Devre dışıyken içinde odaklanacak öğe kalmaz → liste kendisi
        // sekme durağı olur ki klavyeyle kaydırılabilsin.
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- kaydırılabilir bölge (axe scrollable-region-focusable)
        tabIndex={disabled ? 0 : -1}
        aria-labelledby={titleId}
        className="shrink-0 overflow-y-auto py-1 outline-none focus-visible:ring-2 focus-visible:ring-mari-ring focus-visible:ring-inset"
        style={{ height: listHeight }}
      >
        {skeleton && <SkeletonRows count={Math.max(items.length, 5)} />}
        {!skeleton && visible.length === 0 && <li className="flex h-full items-center justify-center px-3 text-center text-mari-muted">{empty}</li>}
        {!skeleton && visible.map((item, index) => {
          const isSelected = selectedSet.has(item.key);
          if (removable) {
            return (
              <li key={item.key} className="flex items-center gap-2 px-3 py-1.5 pointer-coarse:py-2.5 hover:bg-mari-surface-alt">
                <div className="min-w-0 flex-1">
                  <RowContent item={item} render={render} />
                  {item.description && !render && <span className="block truncate text-xs text-mari-muted">{item.description}</span>}
                </div>
                <button
                  type="button"
                  aria-label={`${itemText(item) || "Öğeyi"} kaldır`}
                  disabled={disabled || item.disabled}
                  onClick={() => {
                    onRemove([item.key]);
                    setRefocusIndex(index);
                  }}
                  className="relative grid size-6 shrink-0 place-items-center rounded-sm text-mari-muted outline-none hover:bg-mari-surface-alt hover:text-mari-foreground focus-visible:ring-2 focus-visible:ring-mari-ring disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:before:absolute pointer-coarse:before:-inset-2.5"
                >
                  <XIcon aria-hidden size={14} />
                </button>
              </li>
            );
          }
          return (
            // Shift durumunu değişiklik olayından önce yakala (change olayı shiftKey taşımaz).
            <li
              key={item.key}
              onClickCapture={(e) => (shift.current = e.shiftKey)}
              onKeyDownCapture={(e) => (shift.current = e.shiftKey)}
              className={cn("flex", isSelected && "bg-mari-primary-subtle")}
            >
              <Checkbox
                checked={isSelected}
                disabled={disabled || item.disabled}
                label={<RowContent item={item} render={render} />}
                description={render ? undefined : item.description}
                onChange={(e) => toggleItem(item.key, e.target.checked)}
                classNames={{
                  wrapper: cn("flex w-full min-w-0 px-3 py-1.5 pointer-coarse:py-3", !isSelected && !item.disabled && !disabled && "hover:bg-mari-surface-alt"),
                  label: "min-w-0 flex-1",
                }}
              />
            </li>
          );
        })}
      </ul>

      {footer && (
        <div className="shrink-0 border-t border-mari-border p-2">
          <SkeletonSlot on={skeleton} placeholder={<span {...skeletonBoxProps("block h-full min-h-6 w-24 rounded-md")} />}>
            {footer({ direction })}
          </SkeletonSlot>
        </div>
      )}
    </section>
  );
}
