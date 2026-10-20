"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { CheckIcon, PlayIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { Button } from "../button";
import { Segmented } from "../segmented";
import { InfiniteScrollFooter, type InfiniteScrollOptions } from "../lib/infiniteScroll";
import { skeletonBoxProps, type SkeletonableProps } from "../lib/skeleton";
import { Image } from "./Image";
import { ImageViewer, type ImageViewerItem, type ImageViewerProps } from "./ImageViewer";
import type { ImageLoader, ImageSource } from "./types";
import {
  DRILL_DOWN,
  drillDownTarget,
  MAX_COLUMNS,
  MIN_COLUMNS,
  autoColumns,
  buildLayout,
  clampColumns,
  formatDuration,
  gridKeyIntent,
  groupItems,
  rangeIndexes,
  renderedRows,
  sectionLabel,
  visibleRows,
  type GalleryLayout,
  type GalleryView,
} from "./galleryUtils";

export type { GalleryView };

export interface ImageGalleryItem {
  key: React.Key;
  /** Tam çözünürlüklü kaynak (video için video adresi). */
  src: ImageSource;
  alt: string;
  /** Çekim tarihi — bölümler buna göre. Hiçbir öğede yoksa galeri tek düz ızgaradır. */
  date?: Date | null;
  /** Varsayılan: `"image"`. */
  type?: "image" | "video";
  /** Video kapak görseli (ızgarada ve görüntüleyicide) — hazır adres, `loader`dan geçmez. */
  poster?: string;
  /** Video süresi (sn) — küçük resmin köşesinde. */
  duration?: number;
  /** Izgarada `src` yerine gösterilecek küçük kaynak (CDN `loader`ı yoksa önerilir). */
  thumbnail?: ImageSource;
  caption?: React.ReactNode;
  tracks?: Exclude<ImageViewerItem["tracks"], undefined>;
}

export interface ImageGalleryProps extends SkeletonableProps {
  items: ImageGalleryItem[];
  /** Bölümleme: `day` / `month` / `year` başlıklı, `all` başlıksız tek ızgara. Varsayılan: `"day"`. */
  view?: GalleryView;
  defaultView?: GalleryView;
  onViewChange?: (view: GalleryView) => void;
  /** Araç çubuğundaki görünüm seçenekleri (sırasıyla). Varsayılan: Yıllar, Aylar, Günler, Tümü. */
  views?: GalleryView[];
  /** Sütun sayısı. `"auto"`: genişlik ve görünüme göre (gün iri, yıl sık). Varsayılan: `"auto"`. */
  columns?: number | "auto";
  defaultColumns?: number | "auto";
  onColumnsChange?: (columns: number | "auto") => void;
  /** Küçük resimler arası boşluk (px, kıl payı). Varsayılan: `2`. */
  gap?: number;
  loader?: ImageLoader;
  /** Araç çubuğu (görünüm, sütun, seçim). Varsayılan: `true`. */
  toolbar?: boolean;
  /** Araç çubuğunun solundaki başlık. */
  title?: React.ReactNode;
  /** Bölüm başlıklarının düzeyi. Varsayılan: `3`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Sona yaklaşınca sonraki sayfayı ister (sanallaştırmayla birlikte çalışır). */
  infinite?: InfiniteScrollOptions;
  /** Araç çubuğunda "Seç" düğmesi; dokunmatikte uzun basış da seçim moduna alır. */
  selectable?: boolean;
  selectionMode?: boolean;
  defaultSelectionMode?: boolean;
  onSelectionModeChange?: (active: boolean) => void;
  selectedKeys?: React.Key[];
  defaultSelectedKeys?: React.Key[];
  onSelectionChange?: (keys: React.Key[]) => void;
  /** Seçim modunda araç çubuğuna eklenecek eylemler (paylaş, sil…). */
  selectionActions?: (keys: React.Key[]) => React.ReactNode;
  /** Görüntüleyicinin üst çubuğuna ek eylemler. */
  viewerActions?: Exclude<ImageViewerProps["actions"], undefined>;
  /** Tarih biçimi. Varsayılan: `"tr-TR"`. */
  locale?: string;
  /** Öğe yokken. Varsayılan: "Henüz fotoğraf yok". */
  emptyText?: React.ReactNode;
  "aria-label"?: string;
  className?: string;
}

const VIEW_LABEL: Record<GalleryView, string> = { year: "Yıllar", month: "Aylar", day: "Günler", all: "Tümü" };
const DEFAULT_VIEWS: GalleryView[] = ["year", "month", "day", "all"];
const TILE_WIDTHS = [96, 160, 256, 384, 640];
const HEADER_REM = 2.75;
const LONG_PRESS_MS = 500;
const SKELETON_ROWS = 4;

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function scrollParent(el: HTMLElement): HTMLElement | null {
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    if (/(auto|scroll|overlay)/.test(getComputedStyle(p).overflowY)) return p;
  }
  return null;
}

/** Galerinin görünen dikey aralığı (galeriye göre px): kaydırma atası ve pencere ile kesişim. */
function viewportOf(el: HTMLElement, scroller: HTMLElement | null): [number, number] {
  const rect = el.getBoundingClientRect();
  let top = 0;
  let bottom = window.innerHeight;
  if (scroller) {
    const s = scroller.getBoundingClientRect();
    top = Math.max(top, s.top);
    bottom = Math.min(bottom, s.bottom);
  }
  return [top - rect.top, bottom - rect.top];
}

function remToPx(rem: number): number {
  if (typeof window === "undefined") return rem * 16;
  return rem * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
}

/** Öğenin genişliği (ResizeObserver). `active` değişince (öğe DOM'a girince) yeniden bağlanır. */
function useWidth(ref: React.RefObject<HTMLElement | null>, active: boolean): number {
  const [width, setWidth] = useState(0);
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, active]);
  return width;
}

/**
 * Sanal ızgara: görünen aralık (sayfa ya da iç kaydırma alanı) kaydırma
 * olaylarıyla izlenir; yalnız görünen satırlar (+ birkaç yedek) render edilir.
 */
function useVisibleRows(gridRef: React.RefObject<HTMLDivElement | null>, layout: GalleryLayout, active: boolean) {
  const [range, setRange] = useState<[number, number]>([0, 20]);
  const layoutRef = useRef(layout);
  layoutRef.current = layout;
  const viewportHeight = useRef(0);
  const update = useRef<() => void>(() => {});

  useIsomorphicLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const scroller = scrollParent(el);
    let frame = 0;
    update.current = () => {
      const [top, bottom] = viewportOf(el, scroller);
      viewportHeight.current = bottom - top;
      const next = visibleRows(layoutRef.current.rows, top, bottom);
      setRange((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        update.current();
      });
    };
    // Yakalama aşaması: hangi ata kaydırırsa kaydırsın haber alınır.
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      update.current = () => {};
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [gridRef, active]);

  // Yerleşim değişince (genişlik, sütun, görünüm, yeni sayfa) aralığı yeniden hesapla.
  useIsomorphicLayoutEffect(() => update.current(), [layout, active]);

  return { range, viewportHeight };
}

function GalleryTile({
  item,
  index,
  active,
  selecting,
  selected,
  loader,
  cell,
  onActivate,
  onLongPress,
  onKeyDown,
}: Readonly<{
  item: ImageGalleryItem;
  index: number;
  active: boolean;
  selecting: boolean;
  selected: boolean;
  loader?: ImageLoader;
  cell: number;
  onActivate: (index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
  onLongPress: (index: number) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}>) {
  const press = useRef<{ timer: ReturnType<typeof setTimeout>; x: number; y: number; fired: boolean } | null>(null);
  const isVideo = item.type === "video";
  // Kapak görseli görüntüleyicideki gibi hazır bir adres: `loader`dan geçmez.
  const thumb = isVideo ? (item.poster ?? null) : (item.thumbnail ?? item.src);
  const thumbLoader = isVideo ? undefined : loader;

  const cancelPress = () => {
    const p = press.current;
    if (!p) return;
    clearTimeout(p.timer);
    // Uzun basış gerçekleştiyse bayrak, ardından gelen tıklamayı yutmak için kalır.
    if (!p.fired) press.current = null;
  };
  useEffect(() => cancelPress, []);

  return (
    <div
      role="gridcell"
      tabIndex={active ? 0 : -1}
      data-index={index}
      aria-selected={selecting ? selected : undefined}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        // Uzun basış seçimi zaten yaptı; ardından gelen tıklama geri almasın.
        if (press.current?.fired) {
          press.current = null;
          return;
        }
        onActivate(index, event);
      }}
      onPointerDown={(event) => {
        if (event.pointerType !== "touch" || selecting) return;
        cancelPress();
        const { clientX: x, clientY: y } = event;
        const timer = setTimeout(() => {
          if (press.current) press.current.fired = true;
          onLongPress(index);
        }, LONG_PRESS_MS);
        press.current = { timer, x, y, fired: false };
      }}
      onPointerMove={(event) => {
        const p = press.current;
        if (p && !p.fired && Math.hypot(event.clientX - p.x, event.clientY - p.y) > 10) cancelPress();
      }}
      onPointerUp={cancelPress}
      onPointerCancel={cancelPress}
      onContextMenu={(event) => {
        // Uzun basışta tarayıcının "görseli kaydet" menüsü açılmasın.
        if (press.current) event.preventDefault();
      }}
      className={cn(
        "relative block size-full cursor-pointer overflow-hidden bg-mari-surface-alt outline-none select-none [-webkit-touch-callout:none]",
        // Halka görselin üstünde kalsın: inset gölge içeriğin altında boyanır → ::after katmanı.
        "scroll-mt-14 after:pointer-events-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-mari-ring focus-visible:after:ring-inset"
      )}
    >
      <Image
        src={thumb}
        alt={item.alt}
        loader={thumbLoader}
        widths={TILE_WIDTHS}
        sizes={`${Math.max(1, Math.ceil(cell))}px`}
        draggable={false}
        wrapperClassName={cn(
          "block size-full rounded-none transition-[transform,opacity] duration-150 motion-reduce:transition-none",
          selected && "opacity-70"
        )}
      />
      {isVideo && (
        // Fotoğrafa bağlı, temadan bağımsız (native VIDEO_BADGE_BG ile aynı): açık temanın
        // yarı saydam scrim'i açık karede beyaz metni AA'nın altına düşürüyordu.
        <span className="pointer-events-none absolute right-1 bottom-1 inline-flex items-center gap-0.5 rounded-sm bg-black/72 px-1 text-xs font-medium text-white tabular-nums">
          <PlayIcon aria-hidden className="size-3 fill-current" />
          {item.duration !== undefined ? formatDuration(item.duration) : <span className="sr-only">Video</span>}
          {item.duration !== undefined && <span className="sr-only">, video</span>}
        </span>
      )}
      {selecting && (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute right-1.5 bottom-1.5 flex size-5 items-center justify-center rounded-full border-2 border-white",
            selected ? "bg-mari-primary-solid text-mari-primary-solid-contrast" : "bg-mari-scrim",
            isVideo && "bottom-6"
          )}
        >
          {selected && <CheckIcon className="size-3" strokeWidth={3} />}
        </span>
      )}
    </div>
  );
}

/**
 * Görünüm değişince (yıl → ay → gün) bir öğenin bölüm başlığını araç
 * çubuğunun hemen altına kaydırır. Yeni yerleşim hesaplandıktan sonra çalışır.
 */
function useSectionScroll(
  gridRef: React.RefObject<HTMLDivElement | null>,
  toolbarRef: React.RefObject<HTMLDivElement | null>,
  layout: GalleryLayout,
  width: number
) {
  const pending = useRef<number | null>(null);
  useIsomorphicLayoutEffect(() => {
    const el = gridRef.current;
    const index = pending.current;
    const row = index === null ? undefined : layout.rowOf[index];
    if (!el || !width || row === undefined) return;
    pending.current = null;
    const header = layout.rows[row - 1];
    const top = header?.kind === "header" ? header.top : layout.rows[row]!.top;
    const scroller = scrollParent(el);
    const [viewTop] = viewportOf(el, scroller);
    const delta = top - viewTop - (toolbarRef.current?.offsetHeight ?? 0);
    // jsdom'da `scrollBy` yok.
    (scroller ?? window).scrollBy?.({ top: delta });
  }, [layout, width]);
  return (index: number) => {
    pending.current = index;
  };
}

/** Seçim modu + seçili anahtarlar (kontrollü/kontrolsüz) ve Shift aralığının çapası. */
function useGallerySelection(
  flat: readonly ImageGalleryItem[],
  opts: {
    value?: React.Key[];
    defaultValue: React.Key[];
    onChange?: (keys: React.Key[]) => void;
    mode?: boolean;
    defaultMode: boolean;
    onModeChange?: (active: boolean) => void;
  }
) {
  const [selecting = false, setSelecting] = useControllableState({ value: opts.mode, defaultValue: opts.defaultMode, onChange: opts.onModeChange });
  const [keys = [], setKeysState] = useControllableState({ value: opts.value, defaultValue: opts.defaultValue, onChange: opts.onChange });
  // Render beklemeden art arda gelen güncellemeler (hızlı tıklama) birbirini ezmesin.
  const latest = useRef(keys);
  latest.current = keys;
  const setKeys = (next: React.Key[]) => {
    latest.current = next;
    setKeysState(next);
  };
  const set = useMemo(() => new Set(keys), [keys]);
  const anchor = useRef<number | null>(null);

  const addRange = (to: number) => {
    if (anchor.current === null) return;
    const added = rangeIndexes(anchor.current, to).map((i) => flat[i]!.key);
    setKeys([...new Set([...latest.current, ...added])]);
  };

  const exit = () => {
    setSelecting(false);
    if (keys.length) setKeys([]);
    anchor.current = null;
  };

  const selectAll = () => setKeys(flat.map((i) => i.key));

  return {
    selecting,
    keys,
    has: (key: React.Key) => set.has(key),
    enter: () => setSelecting(true),
    exit,
    selectAll,
    /** Tıklama/Space: tek öğeyi aç/kapa; Shift ile çapadan buraya kadar ekle. */
    toggle: (index: number, range: boolean) => {
      const key = flat[index]?.key;
      if (key === undefined) return;
      if (range && anchor.current !== null) {
        addRange(index);
        return;
      }
      const current = latest.current;
      setKeys(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
      anchor.current = index;
    },
    /** Shift+ok: çapadan hedefe kadar ekle. */
    extendTo: addRange,
    /** Uzun basış: seçim moduna gir, bu öğeyi seç. */
    startWith: (index: number) => {
      setSelecting(true);
      anchor.current = index;
      const key = flat[index]!.key;
      if (!latest.current.includes(key)) setKeys([...latest.current, key]);
    },
    /** Escape çıkar, Ctrl/⌘+A tümünü seçer. İşlendiyse `true`. */
    shortcut: (event: React.KeyboardEvent) => {
      const all = event.key.toLowerCase() === "a" && (event.ctrlKey || event.metaKey);
      if (event.key !== "Escape" && !all) return false;
      event.preventDefault();
      if (all) selectAll();
      else exit();
      return true;
    },
  };
}

/**
 * Fotoğraf/video galerisi. Yapı iPhone Fotoğraflar'dan: kare
 * küçük resimler kıl payı aralıkla, tarihe göre bölümler ve Yıllar / Aylar /
 * Günler / Tümü görünümleri (üst görünümün başlığına tıklayınca bir alta
 * inilir), sütun sayısı değiştirilebilir, seçim modu (uzun basış, Shift ile
 * aralık), tam ekran `ImageViewer` (video dahil). Binlerce öğe için sanal:
 * yalnız görünen satırlar DOM'da; `infinite` ile sonraki sayfalar istenir.
 *
 * Erişilebilirlik: APG `grid` — tek sekme durağı, ok tuşları / Home / End /
 * PageUp / PageDown ile gezinme (sanallaştırmada da: hedef satır render edilip
 * odaklanır), `aria-rowcount`/`aria-rowindex`; seçim modunda
 * `aria-multiselectable` + `aria-selected`.
 */
export function ImageGallery({
  items,
  view: viewProp,
  defaultView = "day",
  onViewChange,
  views = DEFAULT_VIEWS,
  columns: columnsProp,
  defaultColumns = "auto",
  onColumnsChange,
  gap = 2,
  loader,
  toolbar = true,
  title,
  headingLevel = 3,
  infinite,
  selectable = false,
  selectionMode: selectionModeProp,
  defaultSelectionMode = false,
  onSelectionModeChange,
  selectedKeys: selectedKeysProp,
  defaultSelectedKeys = [],
  onSelectionChange,
  selectionActions,
  viewerActions,
  locale = "tr-TR",
  emptyText = "Henüz fotoğraf yok",
  skeleton = false,
  "aria-label": ariaLabel = "Fotoğraflar",
  className,
}: Readonly<ImageGalleryProps>) {
  const [rawView, setViewState] = useControllableState({ value: viewProp, defaultValue: defaultView, onChange: onViewChange });
  const [columnsSetting = "auto", setColumns] = useControllableState<number | "auto">({
    value: columnsProp,
    defaultValue: defaultColumns,
    onChange: onColumnsChange,
  });
  const hasDates = useMemo(() => items.some((i) => i.date), [items]);
  const view: GalleryView = hasDates ? (rawView ?? "day") : "all";

  const sections = useMemo(() => groupItems(items, view, (i) => i.date), [items, view]);
  const flat = useMemo(() => sections.flatMap((s) => s.entries.map((e) => e.item)), [sections]);
  const count = flat.length;
  const sel = useGallerySelection(flat, {
    value: selectedKeysProp,
    defaultValue: defaultSelectedKeys,
    onChange: onSelectionChange,
    mode: selectionModeProp,
    defaultMode: defaultSelectionMode,
    onModeChange: onSelectionModeChange,
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const gridMounted = !skeleton && count > 0;
  const width = useWidth(gridRef, gridMounted);
  const columns = columnsSetting === "auto" ? autoColumns(width, view, gap) : clampColumns(columnsSetting);
  const headerHeight = view === "all" ? 0 : remToPx(HEADER_REM);
  const layout = useMemo(() => buildLayout(sections, { width, columns, gap, headerHeight }), [sections, width, columns, gap, headerHeight]);
  const virtual = useVisibleRows(gridRef, layout, gridMounted);

  const [rawActive, setActive] = useState(0);
  const activeIndex = Math.min(rawActive, Math.max(count - 1, 0));
  const pendingFocus = useRef(false);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const setView = (next: GalleryView) => {
    setViewState(next);
    // Kendiliğinden sütun sayısı yeni görünüme göre; tüketici kontrol ediyorsa ona kalır.
    if (columnsProp === undefined) setColumns("auto");
  };

  const cellOf = (index: number) => gridRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`) ?? null;

  // Odak taşınacaksa: hedef satır bu render'da DOM'a girdi → odakla (tarayıcı görünüme kaydırır).
  useIsomorphicLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    cellOf(activeIndex)?.focus();
  });

  const scrollToItemSection = useSectionScroll(gridRef, toolbarRef, layout, width);

  const drillDown = (sectionIndex: number) => {
    const target = drillDownTarget(items, sections, view, sectionIndex, (i) => i.date);
    if (!target) return;
    setView(target.view);
    scrollToItemSection(target.index);
    setActive(target.index);
  };

  const openViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const onActivate = (index: number, event: React.MouseEvent | React.KeyboardEvent) => {
    setActive(index);
    if (sel.selecting) sel.toggle(index, event.shiftKey);
    else openViewer(index);
  };

  const onLongPress = (index: number) => {
    if (!selectable) return;
    setActive(index);
    sel.startWith(index);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || (sel.selecting && sel.shortcut(event))) return;
    const index = Number(event.currentTarget.dataset.index);
    const pageRows = Math.floor(virtual.viewportHeight.current / (layout.cell + gap)) - 1;
    const intent = gridKeyIntent(layout, index, event.key, event.ctrlKey || event.metaKey, pageRows);
    if (intent === null) return;
    event.preventDefault();
    if (intent === "activate") {
      onActivate(index, event);
      return;
    }
    if (sel.selecting && event.shiftKey) sel.extendTo(intent);
    pendingFocus.current = true;
    setActive(intent);
  };

  const viewerItems = useMemo<ImageViewerItem[]>(
    () =>
      flat.map((i) => ({
        key: i.key,
        src: i.src,
        alt: i.alt,
        caption: i.caption,
        type: i.type,
        poster: i.poster,
        tracks: i.tracks,
      })),
    [flat]
  );

  // Görüntüleyicide gezinirken ızgara da izler (kapanınca küçük resme küçülerek dönebilsin).
  useEffect(() => {
    if (!viewerOpen) return;
    cellOf(viewerIndex)?.scrollIntoView?.({ block: "nearest" });
  }, [viewerOpen, viewerIndex]);

  // Görünür satırlar + odaktaki satır (uzakta olsa da DOM'da kalsın).
  const tileProps = { loader, cell: layout.cell, onActivate, onLongPress, onKeyDown };
  const rowIndexes = renderedRows(virtual.range, layout.rows.length, layout.rowOf[activeIndex]);

  if (skeleton) return <GallerySkeleton toolbar={toolbar} columns={columnsSetting} view={view} gap={gap} className={className} />;

  return (
    <div className={cn("relative", className)}>
      {toolbar && (
        <GalleryToolbar
          ref={toolbarRef}
          title={title}
          selecting={sel.selecting}
          selectedKeys={sel.keys}
          selectionActions={selectionActions}
          empty={!count}
          selectable={selectable}
          onSelectAll={sel.selectAll}
          onExitSelection={sel.exit}
          onEnterSelection={sel.enter}
          view={view}
          views={hasDates ? views : []}
          onViewChange={setView}
          columns={columns}
          cell={layout.cell}
          onColumnsChange={setColumns}
        />
      )}

      {count === 0 ? (
        <div className="flex min-h-40 items-center justify-center text-sm text-mari-muted">{emptyText}</div>
      ) : (
        <div
          ref={gridRef}
          role="grid"
          aria-label={ariaLabel}
          aria-rowcount={layout.rows.length}
          aria-colcount={columns}
          aria-multiselectable={sel.selecting || undefined}
          className="relative w-full"
          style={{ height: layout.height }}
        >
          {rowIndexes.map((r) => {
            const row = layout.rows[r]!;
            const style: React.CSSProperties = { position: "absolute", top: row.top, height: row.height, left: 0, right: 0 };
            if (row.kind === "header") {
              const section = sections[row.section]!;
              return (
                <SectionHeaderRow
                  key={`h-${section.key}`}
                  rowIndex={r}
                  style={style}
                  columns={columns}
                  headingLevel={headingLevel}
                  label={sectionLabel(section.date, view, locale)}
                  count={section.entries.length}
                  onDrillDown={DRILL_DOWN[view] ? () => drillDown(row.section) : undefined}
                />
              );
            }
            return (
              <ItemRow
                key={`r-${flat[row.start]!.key}`}
                rowIndex={r}
                style={style}
                columns={columns}
                gap={gap}
                items={flat.slice(row.start, row.end)}
                start={row.start}
                activeIndex={activeIndex}
                selecting={sel.selecting}
                isSelected={sel.has}
                tile={tileProps}
              />
            );
          })}
        </div>
      )}

      {infinite && count > 0 && <InfiniteScrollFooter options={infinite} className="mt-2" />}

      <ImageViewer
        items={viewerItems}
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        index={viewerIndex}
        onIndexChange={(i) => {
          setViewerIndex(i);
          setActive(i);
        }}
        loader={loader}
        actions={viewerActions}
        getOriginElement={cellOf}
      />
    </div>
  );
}

type TileShared = Pick<React.ComponentProps<typeof GalleryTile>, "loader" | "cell" | "onActivate" | "onLongPress" | "onKeyDown">;

function ItemRow({
  rowIndex,
  style,
  columns,
  gap,
  items,
  start,
  activeIndex,
  selecting,
  isSelected,
  tile,
}: Readonly<{
  rowIndex: number;
  style: React.CSSProperties;
  columns: number;
  gap: number;
  items: ImageGalleryItem[];
  start: number;
  activeIndex: number;
  selecting: boolean;
  isSelected: (key: React.Key) => boolean;
  tile: TileShared;
}>) {
  return (
    <div role="row" aria-rowindex={rowIndex + 1} style={{ ...style, display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap }}>
      {items.map((item, k) => (
        <GalleryTile
          key={item.key}
          {...tile}
          item={item}
          index={start + k}
          active={start + k === activeIndex}
          selecting={selecting}
          selected={isSelected(item.key)}
        />
      ))}
    </div>
  );
}

function SectionHeaderRow({
  rowIndex,
  style,
  columns,
  headingLevel,
  label,
  count,
  onDrillDown,
}: Readonly<{
  rowIndex: number;
  style: React.CSSProperties;
  columns: number;
  headingLevel: number;
  label: string;
  count: number;
  onDrillDown?: () => void;
}>) {
  const Heading = `h${headingLevel}` as "h3";
  return (
    <div role="row" aria-rowindex={rowIndex + 1} style={style} className="flex items-end px-1 pb-1.5">
      <div role="gridcell" aria-colspan={columns} className="flex w-full items-baseline gap-2">
        <Heading className="m-0 text-base font-semibold">
          {onDrillDown ? (
            // Fareyle kısayol; klavyede aynı iş görünüm seçicisiyle.
            <button type="button" tabIndex={-1} onClick={onDrillDown} className="cursor-pointer rounded-sm hover:text-mari-primary">
              {label}
            </button>
          ) : (
            label
          )}
        </Heading>
        <span className="text-sm text-mari-muted tabular-nums">{count} öğe</span>
      </div>
    </div>
  );
}

interface GalleryToolbarProps {
  title: React.ReactNode;
  selecting: boolean;
  selectedKeys: React.Key[];
  selectionActions?: (keys: React.Key[]) => React.ReactNode;
  empty: boolean;
  /** `false`sa "Seç" düğmesi yok. */
  selectable: boolean;
  onSelectAll: () => void;
  onExitSelection: () => void;
  onEnterSelection: () => void;
  view: GalleryView;
  /** Birden azsa görünüm seçici yok. */
  views: GalleryView[];
  onViewChange: (view: GalleryView) => void;
  columns: number;
  /** Geçerli küçük resim genişliği (px) — çok küçülmesin. */
  cell: number;
  onColumnsChange: (columns: number) => void;
}

/** Yapışkan üst çubuk: normalde başlık + görünüm + sütun + "Seç"; seçim modunda sayı + eylemler. */
const GalleryToolbar = /* @__PURE__ */ React.forwardRef<HTMLDivElement, GalleryToolbarProps>(function GalleryToolbar(
  {
    title,
    selecting,
    selectedKeys,
    selectionActions,
    empty,
    selectable,
    onSelectAll,
    onExitSelection,
    onEnterSelection,
    view,
    views,
    onViewChange,
    columns,
    cell,
    onColumnsChange,
  },
  ref
) {
  const canZoomOut = columns < MAX_COLUMNS && cell > 40;
  const canZoomIn = columns > MIN_COLUMNS;
  const selectionLabel = selectedKeys.length ? `${selectedKeys.length} öğe seçildi` : "Öğe seçin";
  return (
    <div ref={ref} className="sticky top-0 z-mari-sticky flex min-h-12 flex-wrap items-center gap-2 bg-mari-surface/85 px-1 py-2 backdrop-blur-md">
      {/* Seçim modunda sayı kırpılmasın: dar ekranda eylemler alt satıra sarar. */}
      <div
        className={cn("text-base font-semibold", selecting ? "flex-[1_0_auto]" : "min-w-0 flex-1 truncate")}
        aria-live={selecting ? "polite" : undefined}
      >
        {selecting ? selectionLabel : title}
      </div>
      {selecting ? (
        <>
          {selectionActions?.(selectedKeys)}
          <Button size="sm" variant="ghost" color="neutral" onClick={onSelectAll} disabled={empty}>
            Tümünü seç
          </Button>
          <Button size="sm" variant="outline" color="neutral" onClick={onExitSelection}>
            Vazgeç
          </Button>
        </>
      ) : (
        <>
          {views.length > 1 && (
            <Segmented
              size="sm"
              aria-label="Görünüm"
              value={view}
              onChange={(v) => onViewChange(v as GalleryView)}
              options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))}
            />
          )}
          <div className="flex items-center">
            <Button
              size="sm"
              variant="ghost"
              color="neutral"
              shape="circle"
              icon={<ZoomOutIcon />}
              aria-label="Küçük resimleri küçült"
              disabled={!canZoomOut}
              onClick={() => onColumnsChange(columns + 1)}
            />
            <Button
              size="sm"
              variant="ghost"
              color="neutral"
              shape="circle"
              icon={<ZoomInIcon />}
              aria-label="Küçük resimleri büyüt"
              disabled={!canZoomIn}
              onClick={() => onColumnsChange(columns - 1)}
            />
          </div>
          {selectable && (
            <Button size="sm" variant="outline" color="neutral" onClick={onEnterSelection} disabled={empty}>
              Seç
            </Button>
          )}
        </>
      )}
    </div>
  );
});

/** Yüklü hâliyle aynı ölçü: aynı sütun hesabı (`autoColumns`, ölçülen genişlik), aynı başlık yüksekliği. */
function GallerySkeleton({
  toolbar,
  columns,
  view,
  gap,
  className,
}: Readonly<{
  toolbar: boolean;
  columns: number | "auto";
  view: GalleryView;
  gap: number;
  className?: string;
}>) {
  const gridRef = useRef<HTMLDivElement>(null);
  const width = useWidth(gridRef, true);
  const cols = columns === "auto" ? autoColumns(width, view, gap) : clampColumns(columns);
  const box = skeletonBoxProps();
  return (
    <div aria-hidden aria-busy className={cn("relative", className)}>
      {toolbar && (
        <div className="flex min-h-12 items-center gap-2 px-1 py-2">
          <span {...box} className={cn(box.className, "h-5 w-32 rounded-sm")} />
          <span className="flex-1" />
          <span {...box} className={cn(box.className, "h-6 w-48 rounded-md")} />
        </div>
      )}
      {view !== "all" && (
        <div className="flex items-end px-1 pb-1.5" style={{ height: `${HEADER_REM}rem` }}>
          <span {...box} className={cn(box.className, "h-4 w-40 rounded-sm")} />
        </div>
      )}
      <div ref={gridRef} className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap }}>
        {Array.from({ length: SKELETON_ROWS * cols }, (_, i) => (
          <span key={i} {...box} className={cn(box.className, "aspect-square rounded-none")} />
        ))}
      </div>
    </div>
  );
}
