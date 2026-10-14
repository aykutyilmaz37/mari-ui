import React, { useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Platform, Pressable, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { Button } from "../Button";
import { Segmented } from "../Segmented";
import type { InfiniteScrollOptions } from "../List";
import { CheckIcon, PlayIcon, ZoomInIcon, ZoomOutIcon } from "../lib/icons";
import { scrimColor } from "../lib/overlay";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import { useControllable } from "../lib/useControllable";
import { nativeFontFamily } from "../theme/fontFamily";
import { toPx } from "../theme/toPx";
import { useTheme } from "../theme/useTheme";
import { Image } from "./Image";
import { ImageViewer, type ImageViewerItem, type ImageViewerProps } from "./ImageViewer";
import type { ImageLoader, ImageSource } from "./types";
import { imageButtonRole } from "./utils";
import {
  DRILL_DOWN,
  MAX_COLUMNS,
  MIN_COLUMNS,
  autoColumns,
  buildLayout,
  clampColumns,
  drillDownTarget,
  formatDuration,
  groupItems,
  sectionLabel,
  type GalleryLayout,
  type GalleryRow,
  type GallerySection,
  type GalleryView,
} from "./galleryUtils";

export type { GalleryView };

export interface ImageGalleryItem {
  key: React.Key;
  /** Tam çözünürlüklü kaynak. */
  src: ImageSource;
  alt: string;
  /** Çekim tarihi — bölümler buna göre. Hiçbir öğede yoksa galeri tek düz ızgaradır. */
  date?: Date | null;
  /** Varsayılan: `"image"`. Native görüntüleyicide video OYNATILMAZ — kapak görseli gösterilir. */
  type?: "image" | "video";
  /** Video kapak görseli (ızgarada ve görüntüleyicide) — hazır adres, `loader`dan geçmez. */
  poster?: string;
  /** Video süresi (sn) — küçük resmin köşesinde. */
  duration?: number;
  /** Izgarada `src` yerine gösterilecek küçük kaynak (CDN `loader`ı yoksa önerilir). */
  thumbnail?: ImageSource;
  caption?: React.ReactNode;
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
  /** Küçük resimler arası boşluk (pt, kıl payı). Varsayılan: `2`. */
  gap?: number;
  loader?: ImageLoader;
  /** Araç çubuğu (görünüm, sütun, seçim). Varsayılan: `true`. */
  toolbar?: boolean;
  /** Araç çubuğunun solundaki başlık. */
  title?: React.ReactNode;
  /** Sona yaklaşınca sonraki sayfayı ister (FlatList sanallaştırmasıyla). */
  infinite?: InfiniteScrollOptions;
  /** Araç çubuğunda "Seç" düğmesi; uzun basış da seçim moduna alır. */
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
  viewerActions?: ImageViewerProps["actions"];
  /** Tarih biçimi. Varsayılan: `"tr-TR"`. */
  locale?: string;
  /** Öğe yokken. Varsayılan: "Henüz fotoğraf yok". */
  emptyText?: React.ReactNode;
  accessibilityLabel?: string;
  /** Dış kutu. Galeri kendi içinde kayar: ekranı doldurun (`flex: 1`) ya da yükseklik verin. */
  style?: StyleProp<ViewStyle>;
}

const VIEW_LABEL: Record<GalleryView, string> = { year: "Yıllar", month: "Aylar", day: "Günler", all: "Tümü" };
const DEFAULT_VIEWS: GalleryView[] = ["year", "month", "day", "all"];
const TILE_WIDTHS = [96, 160, 256, 384, 640];
const HEADER_HEIGHT = 44;
const LONG_PRESS_MS = 500;
const SKELETON_ROWS = 4;

/** `value` + `onChange` ile kontrollü, yoksa kendi durumu (web `useControllableState` gibi). */
function useControlled<T>(value: T | undefined, defaultValue: T, onChange?: (next: T) => void): [T, (next: T) => void] {
  const [current, setInner] = useControllable(value, defaultValue);
  return [
    current,
    (next) => {
      setInner(next);
      onChange?.(next);
    },
  ];
}

/** Seçim modu + seçili anahtarlar. Art arda gelen dokunuşlar birbirini ezmesin diye son değer ref'te. */
function useGallerySelection(flat: readonly ImageGalleryItem[], props: ImageGalleryProps) {
  const [selecting, setSelecting] = useControlled(props.selectionMode, props.defaultSelectionMode ?? false, props.onSelectionModeChange);
  const [keys, setKeysState] = useControlled<React.Key[]>(props.selectedKeys, props.defaultSelectedKeys ?? [], props.onSelectionChange);
  const latest = useRef(keys);
  latest.current = keys;
  const setKeys = (next: React.Key[]) => {
    latest.current = next;
    setKeysState(next);
  };
  const set = useMemo(() => new Set(keys), [keys]);
  return {
    selecting,
    keys,
    has: (key: React.Key) => set.has(key),
    enter: () => setSelecting(true),
    exit: () => {
      setSelecting(false);
      if (latest.current.length) setKeys([]);
    },
    selectAll: () => setKeys(flat.map((i) => i.key)),
    toggle: (index: number) => {
      const key = flat[index]?.key;
      if (key === undefined) return;
      const current = latest.current;
      setKeys(current.includes(key) ? current.filter((k) => k !== key) : [...current, key]);
    },
    /** Uzun basış: seçim moduna gir, bu öğeyi seç. */
    startWith: (index: number) => {
      const key = flat[index]?.key;
      if (key === undefined) return;
      setSelecting(true);
      if (!latest.current.includes(key)) setKeys([...latest.current, key]);
    },
  };
}

type Selection = ReturnType<typeof useGallerySelection>;

/** Sona yaklaşınca tek istek (yeni sayfa gelene ya da yükleme bitene kadar tekrar sormaz). */
function useInfinite(infinite: InfiniteScrollOptions | undefined, count: number) {
  const requested = useRef(false);
  useEffect(() => {
    requested.current = false;
  }, [count, infinite?.loading]);
  return () => {
    if (!infinite?.hasMore || infinite.loading || count === 0 || requested.current) return;
    requested.current = true;
    infinite.onLoadMore();
  };
}

/**
 * Üst görünümde başlığa dokununca bir alta in (yıl → ay → gün) ve o bölümün
 * başlığını en üste kaydır — yeni yerleşim hesaplandıktan sonra.
 */
function useDrillDown({ items, sections, view, layout, width, listRef, setView }: { items: ImageGalleryItem[]; sections: GallerySection<ImageGalleryItem>[]; view: GalleryView; layout: GalleryLayout; width: number; listRef: React.RefObject<FlatList<GalleryRow> | null>; setView: (v: GalleryView) => void }) {
  const pending = useRef<number | null>(null);
  useEffect(() => {
    const index = pending.current;
    const row = index === null ? undefined : layout.rowOf[index];
    if (row === undefined || !width) return;
    pending.current = null;
    const header = layout.rows[row - 1];
    listRef.current?.scrollToOffset({ offset: header?.kind === "header" ? header.top : layout.rows[row]!.top, animated: false });
  }, [layout, width, listRef]);
  return (sectionIndex: number) => {
    const target = drillDownTarget(items, sections, view, sectionIndex, (i) => i.date);
    if (!target) return;
    pending.current = target.index;
    setView(target.view);
  };
}

/**
 * Izgara genişliği: ölçülene kadar pencere genişliği — ilk karede boş ızgara
 * çizilmez (ölçüm bir kare sonra gelir; gizli pencerede hiç gelmeyebilir).
 */
function useGridWidth(): [number, (w: number) => void] {
  const window = useWindowDimensions();
  const [measured, setMeasured] = useState(0);
  return [measured || window.width, setMeasured];
}

/** Native görüntüleyicide video oynatılmaz: kapak görseli gösterilir. */
function toViewerItem(item: ImageGalleryItem): ImageViewerItem {
  return { key: item.key, src: item.type === "video" && item.poster ? item.poster : item.src, alt: item.alt, caption: item.caption };
}

/** Satırın kapladığı dikey alan: bir sonraki satırın başına kadar (aradaki boşluk dahil). */
function rowSpan(layout: GalleryLayout, index: number): number {
  const next = layout.rows[index + 1];
  return (next ? next.top : layout.height) - layout.rows[index]!.top;
}

/**
 * Web `ImageGallery`ın native karşılığı (yapı iPhone Fotoğraflar): kare küçük
 * resimler kıl payı aralıkla, tarihe göre bölümler, Yıllar / Aylar / Günler /
 * Tümü (üst görünümde başlığa dokununca bir alta inilir), sütun sayısı, seçim
 * modu (uzun basış), tam ekran `ImageViewer`. Satırlar FlatList'te sanal;
 * konumlar önceden bilindiği için `getItemLayout` ile ölçümsüz.
 */
export function ImageGallery(props: ImageGalleryProps) {
  const {
    items,
    defaultView = "day",
    views = DEFAULT_VIEWS,
    gap = 2,
    loader,
    toolbar = true,
    title,
    infinite,
    selectable = false,
    selectionActions,
    viewerActions,
    locale = "tr-TR",
    emptyText = "Henüz fotoğraf yok",
    skeleton = false,
    accessibilityLabel = "Fotoğraflar",
    style,
  } = props;
  const [rawView, setViewState] = useControlled(props.view, defaultView, props.onViewChange);
  const [columnsSetting, setColumns] = useControlled<number | "auto">(props.columns, props.defaultColumns ?? "auto", props.onColumnsChange);
  const hasDates = useMemo(() => items.some((i) => i.date), [items]);
  const view: GalleryView = hasDates ? rawView : "all";
  const sections = useMemo(() => groupItems(items, view, (i) => i.date), [items, view]);
  const flat = useMemo(() => sections.flatMap((s) => s.entries.map((e) => e.item)), [sections]);
  const sel = useGallerySelection(flat, props);
  const [width, setWidth] = useGridWidth();
  const columns = columnsSetting === "auto" ? autoColumns(width, view, gap) : clampColumns(columnsSetting);
  const layout = useMemo(() => buildLayout(sections, { width, columns, gap, headerHeight: view === "all" ? 0 : HEADER_HEIGHT }), [sections, width, columns, gap, view]);
  const [viewer, setViewer] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const listRef = useRef<FlatList<GalleryRow>>(null);
  const requestMore = useInfinite(infinite, flat.length);

  const setView = (next: GalleryView) => {
    setViewState(next);
    // Kendiliğinden sütun sayısı yeni görünüme göre; tüketici kontrol ediyorsa ona kalır.
    if (props.columns === undefined) setColumns("auto");
  };
  const drillDown = useDrillDown({ items, sections, view, layout, width, listRef, setView });

  const viewerItems = useMemo(() => flat.map(toViewerItem), [flat]);

  if (skeleton) return <GallerySkeleton toolbar={toolbar} views={hasDates ? views : []} columns={columnsSetting} view={view} gap={gap} style={style} />;

  const tile: TileShared = {
    loader,
    selection: sel,
    onOpen: (index) => setViewer({ open: true, index }),
    onLongPress: selectable ? sel.startWith : undefined,
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      {toolbar ? (
        <GalleryToolbar
          title={title}
          selection={sel}
          selectable={selectable}
          selectionActions={selectionActions}
          empty={flat.length === 0}
          view={view}
          views={hasDates ? views : []}
          onViewChange={setView}
          columns={columns}
          cell={layout.cell}
          onColumnsChange={setColumns}
        />
      ) : null}
      {flat.length === 0 ? (
        <EmptyState text={emptyText} />
      ) : (
        <View style={{ flex: 1 }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} accessibilityLabel={accessibilityLabel}>
          {width > 0 ? (
            <GalleryGrid
              listRef={listRef}
              layout={layout}
              sections={sections}
              flat={flat}
              view={view}
              locale={locale}
              gap={gap}
              tile={tile}
              selection={sel}
              onDrillDown={DRILL_DOWN[view] ? drillDown : undefined}
              infinite={infinite}
              requestMore={requestMore}
            />
          ) : null}
        </View>
      )}
      <ImageViewer
        items={viewerItems}
        open={viewer.open}
        onClose={() => setViewer((v) => ({ ...v, open: false }))}
        index={viewer.index}
        onIndexChange={(index) => setViewer((v) => ({ ...v, index }))}
        loader={loader}
        actions={viewerActions}
      />
    </View>
  );
}

/** Sanal satırlar: başlık + öğe satırları; konumlar `buildLayout`tan (ölçümsüz). */
function GalleryGrid({ listRef, layout, sections, flat, view, locale, gap, tile, selection, onDrillDown, infinite, requestMore }: {
  listRef: React.RefObject<FlatList<GalleryRow> | null>;
  layout: GalleryLayout;
  sections: GallerySection<ImageGalleryItem>[];
  flat: ImageGalleryItem[];
  view: GalleryView;
  locale: string;
  gap: number;
  tile: TileShared;
  selection: Selection;
  onDrillDown?: (section: number) => void;
  infinite?: InfiniteScrollOptions;
  requestMore: () => void;
}) {
  return (
    <FlatList
      ref={listRef}
      data={layout.rows}
      keyExtractor={(row) => (row.kind === "header" ? `h-${sections[row.section]!.key}` : `r-${String(flat[row.start]!.key)}`)}
      getItemLayout={(_, index) => ({ length: rowSpan(layout, index), offset: layout.rows[index]!.top, index })}
      renderItem={({ item: row, index }) =>
        row.kind === "header" ? (
          <SectionHeader section={sections[row.section]!} view={view} locale={locale} height={rowSpan(layout, index)} onDrillDown={onDrillDown ? () => onDrillDown(row.section) : undefined} />
        ) : (
          <ItemRow items={flat.slice(row.start, row.end)} start={row.start} cell={layout.cell} gap={gap} height={rowSpan(layout, index)} tile={tile} />
        )
      }
      extraData={selection.selecting ? selection.keys : null}
      initialNumToRender={12}
      windowSize={7}
      onEndReached={requestMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={infinite ? <InfiniteFooter options={infinite} onLoadMore={requestMore} /> : undefined}
    />
  );
}

interface TileShared {
  loader?: ImageLoader;
  selection: Selection;
  onOpen: (index: number) => void;
  onLongPress?: (index: number) => void;
}

function ItemRow({ items, start, cell, gap, height, tile }: { items: ImageGalleryItem[]; start: number; cell: number; gap: number; height: number; tile: TileShared }) {
  return (
    <View style={{ height, flexDirection: "row", gap }}>
      {items.map((item, k) => (
        <GalleryTile key={item.key} item={item} index={start + k} cell={cell} {...tile} />
      ))}
    </View>
  );
}

function tileLabel(item: ImageGalleryItem): string {
  if (item.type !== "video") return item.alt;
  return item.duration === undefined ? `${item.alt}, video` : `${item.alt}, video, ${formatDuration(item.duration)}`;
}

/** Dokunma: seçimde aç/kapa, değilse görüntüleyici; uzun basış (ve ekran okuyucu eylemi) seçim modunu başlatır. */
function tileInteraction({ item, index, selecting, selected, selection, onOpen, onLongPress }: { item: ImageGalleryItem; index: number; selecting: boolean; selected: boolean; selection: Selection; onOpen: (i: number) => void; onLongPress?: (i: number) => void }) {
  const canStart = Boolean(onLongPress) && !selecting;
  return {
    onPress: () => (selecting ? selection.toggle(index) : onOpen(index)),
    onLongPress: canStart ? () => onLongPress?.(index) : undefined,
    delayLongPress: LONG_PRESS_MS,
    accessibilityRole: selecting ? ("button" as const) : imageButtonRole(Platform.OS),
    accessibilityLabel: tileLabel(item),
    accessibilityState: selecting ? { selected } : undefined,
    "aria-selected": selecting ? selected : undefined,
    accessibilityActions: canStart ? [{ name: "longpress", label: "Seç" }] : undefined,
    onAccessibilityAction: (e: { nativeEvent: { actionName: string } }) => {
      if (e.nativeEvent.actionName === "longpress") onLongPress?.(index);
    },
  };
}

function GalleryTile({ item, index, cell, loader, selection, onOpen, onLongPress }: TileShared & { item: ImageGalleryItem; index: number; cell: number }) {
  const theme = useTheme();
  const isVideo = item.type === "video";
  // Kapak görseli görüntüleyicideki gibi hazır bir adres: `loader`dan geçmez.
  const thumb = isVideo ? (item.poster ?? null) : (item.thumbnail ?? item.src);
  const selecting = selection.selecting;
  const selected = selecting && selection.has(item.key);
  return (
    <Pressable
      {...tileInteraction({ item, index, selecting, selected, selection, onOpen, onLongPress })}
      style={{ width: cell, height: cell, overflow: "hidden", backgroundColor: theme.color.canvas.surfaceAlt }}
    >
      <Image src={thumb} alt="" loader={isVideo ? undefined : loader} widths={TILE_WIDTHS} width="100%" aspectRatio={1} style={{ borderRadius: 0, opacity: selected ? 0.7 : 1 }} />
      {isVideo ? <VideoBadge duration={item.duration} /> : null}
      {selecting ? <SelectMark selected={selected} raised={isVideo} /> : null}
    </Pressable>
  );
}

/** Fotoğrafa bağlı, temadan bağımsız: en açık karede bile beyaz metin AA'yı geçer. */
const VIDEO_BADGE_BG = "rgba(0, 0, 0, 0.72)";

function VideoBadge({ duration }: { duration?: number }) {
  const theme = useTheme();
  return (
    <View pointerEvents="none" style={{ position: "absolute", right: 4, bottom: 4, flexDirection: "row", alignItems: "center", gap: 2, borderRadius: 4, paddingHorizontal: 4, backgroundColor: VIDEO_BADGE_BG }}>
      <PlayIcon size={12} color="#fff" />
      {duration !== undefined ? <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 12, lineHeight: 16, fontWeight: "500", color: "#fff", fontVariant: ["tabular-nums"] }}>{formatDuration(duration)}</Text> : null}
    </View>
  );
}

function SelectMark({ selected, raised }: { selected: boolean; raised: boolean }) {
  const theme = useTheme();
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        right: 6,
        bottom: raised ? 24 : 6,
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected ? theme.color.primary.solid : scrimColor(theme),
      }}
    >
      {selected ? <CheckIcon size={12} color={theme.color.primary.solidContrast} /> : null}
    </View>
  );
}

function SectionHeader({ section, view, locale, height, onDrillDown }: { section: GallerySection<ImageGalleryItem>; view: GalleryView; locale: string; height: number; onDrillDown?: () => void }) {
  const theme = useTheme();
  const font = nativeFontFamily(theme.fontFamily.sans);
  const label = sectionLabel(section.date, view, locale);
  const heading = <Text style={{ fontFamily: font, fontSize: 17, lineHeight: 22, fontWeight: "600", color: theme.color.canvas.foreground }}>{label}</Text>;
  return (
    <View style={{ height, flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 4, paddingBottom: 6 }}>
      {onDrillDown ? (
        <Pressable onPress={onDrillDown} accessibilityRole="header" accessibilityHint="Bu bölümü açar" hitSlop={8}>
          {heading}
        </Pressable>
      ) : (
        <View accessibilityRole="header">{heading}</View>
      )}
      <Text style={{ fontFamily: font, fontSize: 14, lineHeight: 20, color: theme.color.canvas.muted, fontVariant: ["tabular-nums"] }}>{`${section.entries.length} öğe`}</Text>
    </View>
  );
}

interface ToolbarProps {
  title: React.ReactNode;
  selection: Selection;
  selectable: boolean;
  selectionActions?: (keys: React.Key[]) => React.ReactNode;
  empty: boolean;
  view: GalleryView;
  views: GalleryView[];
  onViewChange: (view: GalleryView) => void;
  columns: number;
  cell: number;
  onColumnsChange: (columns: number) => void;
}

/** Araç çubuğu satırları SABİT yükseklikte — sarma yok, iskelet birebir aynı ölçüde (kayma olmaz). */
const ROW1: ViewStyle = { height: 48, flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 4 };
const ROW2: ViewStyle = { height: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 4 };

function useBarText() {
  const theme = useTheme();
  return { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 17, lineHeight: 22, fontWeight: "600" as const, color: theme.color.canvas.foreground };
}

/**
 * İki satır: üstte başlık + büyüteçler + "Seç", altta tam genişlik görünüm
 * seçici. Seçim modunda üstte sayı + "Vazgeç", altta eylemler + "Tümünü seç".
 */
function GalleryToolbar({ title, selection, selectable, selectionActions, empty, view, views, onViewChange, columns, cell, onColumnsChange }: ToolbarProps) {
  const textStyle = useBarText();
  const second = views.length > 1;
  if (selection.selecting) return <SelectionBar selection={selection} selectionActions={selectionActions} empty={empty} textStyle={textStyle} twoRows={second} />;
  return (
    <View>
      <View style={ROW1}>
        <View style={{ flex: 1, minWidth: 0 }}>{typeof title === "string" ? <Text numberOfLines={1} style={textStyle}>{title}</Text> : title}</View>
        <Button size="sm" variant="ghost" color="neutral" shape="circle" icon={<ZoomOutIcon />} accessibilityLabel="Küçük resimleri küçült" disabled={columns >= MAX_COLUMNS || cell <= 40} onPress={() => onColumnsChange(columns + 1)} />
        <Button size="sm" variant="ghost" color="neutral" shape="circle" icon={<ZoomInIcon />} accessibilityLabel="Küçük resimleri büyüt" disabled={columns <= MIN_COLUMNS} onPress={() => onColumnsChange(columns - 1)} />
        {selectable ? (
          <Button size="sm" variant="outline" color="neutral" onPress={selection.enter} disabled={empty}>
            Seç
          </Button>
        ) : null}
      </View>
      {second ? (
        <View style={ROW2}>
          <Segmented block size="md" accessibilityLabel="Görünüm" value={view} onChange={(v) => onViewChange(v as GalleryView)} options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))} style={{ flex: 1 }} />
        </View>
      ) : null}
    </View>
  );
}

/** Normal çubukla aynı satır sayısı (`twoRows`) — seçime girince ızgara kaymaz. */
function SelectionBar({ selection, selectionActions, empty, textStyle, twoRows }: { selection: Selection; selectionActions?: ToolbarProps["selectionActions"]; empty: boolean; textStyle: object; twoRows: boolean }) {
  const count = selection.keys.length;
  const tools = (
    <>
      {selectionActions?.(selection.keys)}
      <Button size="sm" variant="ghost" color="neutral" onPress={selection.selectAll} disabled={empty}>
        Tümünü seç
      </Button>
    </>
  );
  return (
    <View>
      <View style={ROW1}>
        <Text accessibilityLiveRegion="polite" numberOfLines={1} style={[textStyle, { flex: 1 }]}>
          {count ? `${count} öğe seçildi` : "Öğe seçin"}
        </Text>
        {twoRows ? null : tools}
        <Button size="sm" variant="outline" color="neutral" onPress={selection.exit}>
          Vazgeç
        </Button>
      </View>
      {twoRows ? (
        <View style={[ROW2, { justifyContent: "flex-end" }]}>{tools}</View>
      ) : null}
    </View>
  );
}

function EmptyState({ text }: { text: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ minHeight: 160, alignItems: "center", justifyContent: "center" }}>
      {typeof text === "string" ? <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 14, color: theme.color.canvas.muted }}>{text}</Text> : text}
    </View>
  );
}

function InfiniteFooter({ options, onLoadMore }: { options: InfiniteScrollOptions; onLoadMore: () => void }) {
  const theme = useTheme();
  const { hasMore, loading = false, endMessage = "Hepsi bu kadar", loadMoreLabel = "Daha fazla yükle" } = options;
  const muted = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 14, color: theme.color.canvas.muted };
  let content: React.ReactNode = null;
  if (loading) {
    content = (
      <View accessibilityRole="progressbar" accessibilityLabel="Yükleniyor" style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Spinner size={18} color={theme.color.canvas.muted} />
        <Text style={muted}>Yükleniyor…</Text>
      </View>
    );
  } else if (hasMore) {
    // Ekran okuyucu kaydırmadan da sonraki sayfaya ulaşabilsin.
    content = (
      <Button size="sm" variant="outline" color="neutral" onPress={onLoadMore}>
        {loadMoreLabel}
      </Button>
    );
  } else if (endMessage != null) {
    content = typeof endMessage === "string" ? <Text style={muted}>{endMessage}</Text> : endMessage;
  }
  return content ? <View style={{ minHeight: 56, alignItems: "center", justifyContent: "center", padding: 12 }}>{content}</View> : null;
}

/** Yüklü hâliyle aynı ölçü: aynı araç çubuğu yüksekliği, aynı sütun hesabı, aynı başlık yüksekliği. */
function GallerySkeleton({ toolbar, views, columns, view, gap, style }: { toolbar: boolean; views: GalleryView[]; columns: number | "auto"; view: GalleryView; gap: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const [width, setWidth] = useGridWidth();
  const cols = columns === "auto" ? autoColumns(width, view, gap) : clampColumns(columns);
  const cell = width > 0 ? (width - gap * (cols - 1)) / cols : 0;
  const radius = toPx(theme.radius.sm);
  return (
    <View style={[{ flex: 1 }, style]} accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants" accessibilityState={{ busy: true }} aria-busy>
      {toolbar ? (
        <View>
          <View style={ROW1}>
            <View style={{ flex: 1 }}>
              <SkeletonBox style={{ height: 20, width: 128, borderRadius: radius }} />
            </View>
            <SkeletonBox style={{ height: 32, width: 72, borderRadius: toPx(theme.radius.md) }} />
          </View>
          {views.length > 1 ? (
            <View style={ROW2}>
              <Segmented block skeleton size="md" options={views.map((v) => ({ value: v, label: VIEW_LABEL[v] }))} style={{ flex: 1 }} />
            </View>
          ) : null}
        </View>
      ) : null}
      {view !== "all" ? (
        <View style={{ height: HEADER_HEIGHT, justifyContent: "flex-end", paddingHorizontal: 4, paddingBottom: 6 }}>
          <SkeletonBox style={{ height: 16, width: 160, borderRadius: radius }} />
        </View>
      ) : null}
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: "row", flexWrap: "wrap", gap }}>
        {cell > 0 ? Array.from({ length: SKELETON_ROWS * cols }, (_, i) => <SkeletonBox key={i} style={{ width: cell, height: cell }} />) : null}
      </View>
    </View>
  );
}
