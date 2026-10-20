"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, MoreHorizontalIcon } from "lucide-react";
import { cn, useControllableState, type ColorRole, type Size } from "@mari-ui/core";
import {
  bgSolidClass,
  bgSubtleClass,
  borderStrongColorClass,
  textClass,
  textSolidContrastClass,
  textSubtleContrastClass,
} from "../lib/colorClasses";
import { touchTargetClass } from "../lib/sizeClasses";
import { skeletonFill } from "../lib/skeleton";
import { SkeletonSlot } from "../lib/SkeletonSlot";
import type { PaginationAlign, PaginationProps, PaginationVariant } from "./types";
import { clampPage, fitSiblingCount, getItemRange, getJumpSize, getPageAfterSizeChange, getPageItems, getTotalPages, resolvePageClickTarget } from "./utils";

/**
 * Kapsayıcı genişliğini izleyip sığan komşu sayısını seçer (`-1` → `simple`).
 * Slot genişliği gerçek DOM'dan ölçülür (iki/üç basamaklı sayılar kareyi
 * genişletir) ve saklanır — `simple`e geçildiğinde de yeniden hesap yapılabilsin.
 * `ResizeObserver` yoksa (SSR, jsdom) istenen `siblingCount` aynen kullanılır.
 */
function useFittedSiblings(rootRef: React.RefObject<HTMLDivElement | null>, navRef: React.RefObject<HTMLElement | null>, totalPages: number, siblingCount: number, size: Size): number {
  const [fitted, setFitted] = useState(siblingCount);
  const slotRef = useRef<{ width: number; gap: number } | null>(null);

  useEffect(() => {
    // Boyut değişince eski ölçü geçersiz.
    slotRef.current = null;
    setFitted(siblingCount);
  }, [siblingCount, size]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const list = navRef.current?.querySelector("ul");
      if (list && list.children.length > 0) {
        const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
        slotRef.current = { width: (list.scrollWidth + gap) / list.children.length - gap, gap };
      }
      const slot = slotRef.current;
      if (!slot) return;
      setFitted(fitSiblingCount(root.clientWidth, slot.width, slot.gap, totalPages, siblingCount));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef, navRef, totalPages, siblingCount, size]);

  return fitted;
}

export type { PaginationProps };

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100, 1000];

/**
 * Öğeler `Button` yerine yerel bir `<button>` — Button'ın `px-*` dolgusu
 * sayı düğmelerini genişliğe göre farklı boyutlara itiyordu; burada her
 * öğe `min-w` = yükseklik olan bir karedir, iki basamaklı sayılar büyür.
 */
const itemSizeClass: Record<Size, string> = {
  sm: "h-6 min-w-6 px-1 text-xs rounded-sm",
  md: "h-8 min-w-8 px-1.5 text-sm rounded-md",
  lg: "h-10 min-w-10 px-2 text-base rounded-md",
};

const gapClass: Record<Size, string> = {
  sm: "gap-1",
  md: "gap-2",
  lg: "gap-2",
};

const textSizeClass: Record<Size, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const iconSize: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

const alignClass: Record<PaginationAlign, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
};

function activeClasses(color: ColorRole, variant: PaginationVariant): string {
  switch (variant) {
    case "solid":
      return cn("border-transparent", bgSolidClass[color], textSolidContrastClass[color]);
    case "soft":
      return cn("border-transparent", bgSubtleClass[color], textSubtleContrastClass[color]);
    default:
      return cn("bg-mari-surface", borderStrongColorClass[color], textClass[color]);
  }
}

const itemBaseClass =
  "relative inline-flex shrink-0 items-center justify-center border tabular-nums select-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring";
/*
 * Dokunma hedefi `touchTargetClass[size]`: dokunmatikte yalnızca DİKEY genişleme —
 * öğeler arası 8px boşluk yatayda 44px'e tamamlamaya yetmiyor, kare genişleme
 * komşunun alanına binerdi.
 */
/** İskelette düğme: kendi kare kutusunda dolgu, içerik görünmez, etkileşimsiz. */
const skeletonItemClass = /* @__PURE__ */ cn("pointer-events-none border-transparent text-transparent [&_svg]:invisible", /* @__PURE__ */ skeletonFill(true));
const idleItemClass = "border-transparent text-mari-foreground hover:bg-mari-neutral-subtle cursor-pointer";
// Sadece ok/"…" düğmelerinde hover geçişi. Sayfa numaralarında BİLİNÇLİ
// OLARAK geçiş yok: aktif vurgu bir slottan diğerine geçerken 150ms'lik
// solma, eski kutu kaybolurken yenisinin geç belirmesi olarak görünüyordu.
const hoverTransitionClass = "transition-colors duration-150";
// `disabled` yerine `aria-disabled`: son sayfaya ulaşınca "Sonraki" düğmesi
// gerçekten `disabled` olursa odak `<body>`'ye düşer, klavye kullanıcısı
// yerini kaybeder. `aria-disabled` odağı korur, tıklama no-op olur.
const disabledItemClass = "aria-disabled:opacity-40 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent";

const fieldClass =
  "border border-mari-input bg-mari-surface text-mari-foreground transition-colors hover:border-mari-primary " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring";

/*
 * Faz 13.5'ten beri `TablePagination` bu component'i sarmalıyor — tek gerçek
 * sayfa-listesi mantığı burada (bkz. `utils.ts`).
 *
 * Faz 13.6:
 * - Sayfa listesi artık SABİT sayıda slot üretir; genişlik zıplamaz.
 * - "…" asla tek bir sayfayı gizlemez.
 * - Sayfa aralık dışına düşerse (toplam azaldı, sayfa boyutu büyüdü) son
 *  geçerli sayfaya çekilir; eskiden "901-247 / 247 kayıt" yazıyordu.
 * - Kayıt yokken "Sonraki" düğmesi `onPageChange(0)` çağırabiliyordu.
 * - Aktif sayfaya tekrar tıklamak `onPageChange`'i çağırmaz (gereksiz fetch).
 * - Controlled + uncontrolled (`defaultPage`/`defaultPageSize`).
 */
/**
 * Sayfalama: önceki/sonraki, sayfa numaraları (uzun listede `…` ile kısaltılır), isteğe
 * bağlı sayfa boyutu seçici ve sayfaya atlama; `simple` ile sade görünüm.
 */
export function Pagination({
  currentPage,
  defaultPage = 1,
  pageSize: pageSizeProp,
  defaultPageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  showSizeChanger,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  showTotal = false,
  showQuickJumper = false,
  simple = false,
  siblingCount = 1,
  size = "md",
  color = "primary",
  variant = "outline",
  disabled = false,
  hideOnSinglePage = false,
  align = "between",
  className,
  "aria-label": ariaLabel = "Sayfalama",
  skeleton = false,
}: Readonly<PaginationProps>) {
  const [rawPage, setRawPage] = useControllableState<number>({ value: currentPage, defaultValue: defaultPage });
  const [pageSize, setPageSize] = useControllableState<number>({ value: pageSizeProp, defaultValue: defaultPageSize });

  const totalPages = getTotalPages(totalItems, pageSize);
  const page = clampPage(rawPage, totalPages);
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  // Dar kapsayıcıda komşu sayısı azalır; 0 komşu bile sığmazsa `simple` görünüme geçilir.
  const fitted = useFittedSiblings(rootRef, navRef, totalPages, siblingCount, size);
  const siblings = Math.max(0, fitted);
  const compact = simple || fitted < 0;

  const goTo = (target: number, nextPageSize = pageSize) => {
    // İskelette toplam henüz gerçek değil — hiçbir yol (programatik tıklama dahil) sayfa değiştirmez.
    if (skeleton) return;
    const next = clampPage(target, getTotalPages(totalItems, nextPageSize));
    if (next === page && nextPageSize === pageSize) return;
    setRawPage(next);
    onPageChange?.(next, nextPageSize);
  };

  // Toplam kayıt azalınca (filtre, silme) mevcut sayfa aralık dışına
  // düşebilir. Ekranda zaten `clampPage` ile düzeltilmiş sayfa gösteriliyor;
  // burada tüketiciye de bildiriyoruz ki verisini o sayfaya göre getirsin.
  useEffect(() => {
    if (rawPage !== page) {
      setRawPage(page);
      onPageChange?.(page, pageSize);
    }
    // `onPageChange`/`setRawPage` her render'da yeni referans olabilir —
    // sadece sayfa gerçekten aralık dışına düştüğünde çalışsın.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawPage, page]);

  const handlePageSizeChange = (nextSize: number) => {
    const nextPage = getPageAfterSizeChange(page, pageSize, nextSize, totalItems);
    setPageSize(nextSize);
    // Önce sayfa, sonra boyut: `onPageSizeChange` içinde `setPage(1)` yapan
    // eski tüketicilerin açık tercihi son sözü söylesin.
    if (nextPage !== page) {
      setRawPage(nextPage);
      onPageChange?.(nextPage, nextSize);
    }
    onPageSizeChange?.(nextSize, nextPage);
  };

  if (hideOnSinglePage && totalPages <= 1) return null;

  const range = getItemRange(page, pageSize, totalItems);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;
  const sizeChangerVisible = showSizeChanger ?? onPageSizeChange !== undefined;
  const icon = iconSize[size];
  // İskelette düğmeler yerinde kalır (aynı kare kutu) ama dolgu olur, Tab sırasından çıkar.
  const itemClass = (stateClass: string) => cn(itemBaseClass, itemSizeClass[size], touchTargetClass[size], skeleton ? skeletonItemClass : stateClass);
  const skeletonTab = skeleton ? -1 : undefined;
  const barPlaceholder = <span className={cn("block size-full min-h-[1lh] rounded-md", skeletonFill(true))} />;

  const navButton = (direction: "prev" | "next") => {
    const isEdge = direction === "prev" ? isFirst : isLast;
    const Icon = direction === "prev" ? ChevronLeftIcon : ChevronRightIcon;
    return (
      <button
        type="button"
        tabIndex={skeletonTab}
        className={itemClass(cn(hoverTransitionClass, idleItemClass, disabledItemClass))}
        aria-label={direction === "prev" ? "Önceki sayfa" : "Sonraki sayfa"}
        aria-disabled={isEdge || disabled || undefined}
        onClick={() => {
          if (!isEdge && !disabled) goTo(direction === "prev" ? page - 1 : page + 1);
        }}
      >
        <Icon size={icon} aria-hidden />
      </button>
    );
  };

  const totalNode =
    showTotal === false ? null : (
      // Slot da metnin yazı boyutunu taşır: yer tutucunun `1lh`'si o satır yüksekliğine eşit olsun (yoksa 2px kayar).
      <SkeletonSlot on={skeleton} placeholder={barPlaceholder} className={textSizeClass[size]}>
        <p className={cn("text-mari-muted tabular-nums", textSizeClass[size])}>
          {typeof showTotal === "function" ? showTotal(totalItems, range) : `${range[0]}-${range[1]} / ${totalItems} kayıt`}
        </p>
      </SkeletonSlot>
    );

  const pager = compact ? (
    <nav ref={navRef} aria-label={ariaLabel} aria-hidden={skeleton || undefined} className={cn("flex items-center", gapClass[size])}>
      {navButton("prev")}
      <SkeletonSlot on={skeleton} placeholder={barPlaceholder}>
        <SimplePageInput page={page} totalPages={totalPages} size={size} disabled={disabled} onCommit={goTo} />
      </SkeletonSlot>
      {navButton("next")}
    </nav>
  ) : (
    <nav ref={navRef} aria-label={ariaLabel} aria-hidden={skeleton || undefined}>
      <ul className={cn("flex items-center", gapClass[size])}>
        <li>{navButton("prev")}</li>
        {/*
          Anahtar = SLOT SIRASI (sayfa numarası değil). Slot sayısı sabit
          olduğu için ortadaki aktif slot aynı DOM düğmesi kalır, sadece
          metni değişir. Eskiden anahtar sayfa numarasıydı: "Sonraki"ye
          basınca React "6" düğmesini bir slot sola TAŞIYOR, "7"yi ortaya
          getiriyordu — numaralar kayıyor, vurgu sönüp yeniden yanıyordu
          (Faz 13.6 kullanıcı bulgusu: "next/prev'de kayıyor gibi").
        */}
        {getPageItems(totalPages, page, siblings).map((item, slot) => {
          if (typeof item === "object") {
            const jump = getJumpSize(siblings);
            const JumpIcon = item.direction === "left" ? ChevronsLeftIcon : ChevronsRightIcon;
            return (
              <li key={slot}>
                <button
                  type="button"
                  tabIndex={skeletonTab}
                  className={itemClass(cn(hoverTransitionClass, idleItemClass, "group text-mari-muted hover:text-mari-primary focus-visible:text-mari-primary"))}
                  aria-label={item.direction === "left" ? `${jump} sayfa geri` : `${jump} sayfa ileri`}
                  title={item.direction === "left" ? `Önceki ${jump} sayfa` : `Sonraki ${jump} sayfa`}
                  aria-disabled={disabled || undefined}
                  onClick={() => !disabled && goTo(resolvePageClickTarget(item, page, totalPages, siblings))}
                >
                  <MoreHorizontalIcon size={icon} aria-hidden className="group-hover:hidden group-focus-visible:hidden" />
                  <JumpIcon size={icon} aria-hidden className="hidden group-hover:block group-focus-visible:block" />
                </button>
              </li>
            );
          }

          const isActive = item === page;
          return (
            <li key={slot}>
              <button
                type="button"
                tabIndex={skeletonTab}
                className={itemClass(isActive ? cn("font-semibold cursor-default", activeClasses(color, variant)) : idleItemClass)}
                aria-label={`${item}. sayfa`}
                aria-current={isActive ? "page" : undefined}
                aria-disabled={disabled || undefined}
                onClick={() => !disabled && goTo(item)}
              >
                {item}
              </button>
            </li>
          );
        })}
        <li>{navButton("next")}</li>
      </ul>
    </nav>
  );

  const controls = (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-2", align !== "between" && alignClass[align])}>
      {pager}
      {!simple && sizeChangerVisible && (
        <SkeletonSlot on={skeleton} placeholder={barPlaceholder}>
          <SizeChanger value={pageSize} options={pageSizeOptions} size={size} disabled={disabled} onChange={handlePageSizeChange} />
        </SkeletonSlot>
      )}
      {!simple && showQuickJumper && (
        <SkeletonSlot on={skeleton} placeholder={barPlaceholder}>
          <QuickJumper totalPages={totalPages} size={size} disabled={disabled} onCommit={goTo} />
        </SkeletonSlot>
      )}
    </div>
  );

  return (
    <div
      ref={rootRef}
      aria-busy={skeleton || undefined}
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-2",
        alignClass[align],
        disabled && "pointer-events-none opacity-60",
        className
      )}
    >
      {totalNode}
      {controls}
    </div>
  );
}

const fieldHeightClass: Record<Size, string> = {
  sm: "h-6 rounded-sm text-xs",
  md: "h-8 rounded-md text-sm",
  lg: "h-10 rounded-md text-base",
};

function SizeChanger({
  value,
  options,
  size,
  disabled,
  onChange,
}: Readonly<{
  value: number;
  options: number[];
  size: Size;
  disabled: boolean;
  onChange: (size: number) => void;
}>) {
  // Mevcut boyut listede yoksa (ör. controlled `pageSize={15}`) yine de
  // seçili görünsün — native `<select>` aksi halde ilk seçeneği gösterir.
  const allOptions = options.includes(value) ? options : [...options, value].sort((a, b) => a - b);
  return (
    <div className="relative inline-flex">
      <select
        value={value}
        disabled={disabled}
        aria-label="Sayfa başına kayıt"
        onChange={(e) => onChange(Number(e.target.value))}
        className={cn(fieldClass, fieldHeightClass[size], "cursor-pointer appearance-none pl-3 pr-8 tabular-nums")}
      >
        {allOptions.map((option) => (
          <option key={option} value={option}>
            {option} / sayfa
          </option>
        ))}
      </select>
      <ChevronDownIcon size={iconSize[size] - 2} aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-mari-muted" />
    </div>
  );
}

/** Sadece rakam kabul eden, Enter/blur'da atlayan küçük alan. */
function usePageDraft(onCommit: (page: number) => void, initial = "") {
  const [draft, setDraft] = useState(initial);
  const commit = () => {
    const parsed = Number.parseInt(draft, 10);
    if (Number.isFinite(parsed)) onCommit(parsed);
    return parsed;
  };
  return { draft, setDraft, commit };
}

function QuickJumper({ totalPages, size, disabled, onCommit }: Readonly<{ totalPages: number; size: Size; disabled: boolean; onCommit: (page: number) => void }>) {
  const { draft, setDraft, commit } = usePageDraft(onCommit);
  const submit = () => {
    commit();
    setDraft("");
  };
  return (
    <label className={cn("flex items-center gap-2 text-mari-muted", textSizeClass[size])}>
      Git
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        aria-label={`Sayfaya git (1-${totalPages})`}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        onBlur={submit}
        className={cn(fieldClass, fieldHeightClass[size], "w-14 px-2 text-center tabular-nums")}
      />
    </label>
  );
}

function SimplePageInput({
  page,
  totalPages,
  size,
  disabled,
  onCommit,
}: Readonly<{
  page: number;
  totalPages: number;
  size: Size;
  disabled: boolean;
  onCommit: (page: number) => void;
}>) {
  const { draft, setDraft, commit } = usePageDraft(onCommit, String(page));
  // Dışarıdan (ok düğmeleri, controlled prop) sayfa değişince alanı eşitle.
  useEffect(() => setDraft(String(page)), [page, setDraft]);
  const submit = () => {
    commit();
    // Geçersiz/aralık dışı girişte gerçek sayfaya geri dön.
    setDraft(String(page));
  };
  return (
    <span className={cn("flex items-center gap-2 text-mari-muted tabular-nums", textSizeClass[size])}>
      <input
        type="text"
        inputMode="numeric"
        value={draft}
        disabled={disabled}
        aria-label={`Sayfa (1-${totalPages})`}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        onBlur={submit}
        className={cn(fieldClass, fieldHeightClass[size], "w-12 px-1 text-center")}
      />
      <span aria-hidden>/</span>
      <span>{totalPages}</span>
    </span>
  );
}
