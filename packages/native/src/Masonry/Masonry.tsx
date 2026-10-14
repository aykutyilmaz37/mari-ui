import React, { useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View, type NativeScrollEvent, type StyleProp, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Button } from "../Button";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import type { InfiniteScrollOptions } from "../List";
import { computeLayout, resolveColumns, resolveGap, type MasonryColumns } from "./masonryUtils";

export type { MasonryColumns };

export interface MasonryItem {
  key: React.Key;
  children: React.ReactNode;
}

export interface MasonryProps extends SkeletonableProps {
  items: MasonryItem[];
  /** Sütun sayısı; nesne ile kapsayıcı genişliğine göre (mobil önce). Varsayılan: `{ base: 2, sm: 3, md: 4 }`. */
  columns?: MasonryColumns;
  /** Öğeler arası boşluk: sm 8 / md 16 / lg 24 ya da pt. Varsayılan: `sm`. */
  gutter?: Size | number;
  /** Sonsuz kaydırma: pano sonuna yaklaşınca `onLoadMore`; yeni öğeleri `items`a siz eklersiniz. */
  infinite?: InfiniteScrollOptions;
  /** Panonun üstünde (kayan içerikte) başlık / filtre alanı. */
  header?: React.ReactNode;
  /** İskelette yer tutucu sayısı (veri yokken). Varsayılan: 8. */
  skeletonCount?: number;
  /** Yerleşim her değiştiğinde (öğe yüksekliği, sütun sayısı). */
  onLayoutChange?: (info: { columns: number; height: number }) => void;
  accessibilityLabel?: string;
  /** Kayan kap (`flex: 1` varsayılan — ekranın kalanını doldurur). */
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

/** Sona bu kadar yaklaşınca (pt) sonraki sayfa istenir. */
const LOAD_THRESHOLD = 600;
const SKELETON_HEIGHTS = [180, 240, 150, 210, 260, 170, 230, 190];

function Footer({ infinite }: { infinite: InfiniteScrollOptions }) {
  const theme = useTheme();
  const { hasMore, loading = false, endMessage = "Hepsi bu kadar", loadMoreLabel = "Daha fazla yükle", onLoadMore } = infinite;
  const muted = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 14, color: theme.color.canvas.muted };
  if (loading)
    return (
      <View accessibilityRole="progressbar" accessibilityLabel="Yükleniyor" style={{ minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}>
        <ActivityIndicator size="small" color={theme.color.primary.solid} />
        <Text style={muted}>Yükleniyor…</Text>
      </View>
    );
  // Ekran okuyucu / kaydıramayan kullanıcı için açık düğme de var.
  if (hasMore)
    return (
      <View style={{ minHeight: 56, alignItems: "center", justifyContent: "center" }}>
        <Button size="sm" variant="ghost" onPress={onLoadMore}>{loadMoreLabel}</Button>
      </View>
    );
  if (endMessage == null) return null;
  return <View style={{ minHeight: 56, alignItems: "center", justifyContent: "center" }}>{typeof endMessage === "string" ? <Text style={muted}>{endMessage}</Text> : endMessage}</View>;
}

/** Hücre: veri yokken sabit yükseklikte yer tutucu; iskelette içerik kendi şeklinde; değilse içerik. */
function Cell({ placeholderHeight, skeleton, children }: { placeholderHeight?: number; skeleton: boolean; children: React.ReactNode }) {
  if (placeholderHeight !== undefined) return <SkeletonBox style={{ height: placeholderHeight, borderRadius: 12 }} />;
  if (skeleton) return <SkeletonBox style={{ borderRadius: 12 }}>{children}</SkeletonBox>;
  return <>{children}</>;
}

const nearEnd = ({ layoutMeasurement, contentOffset, contentSize }: NativeScrollEvent) => layoutMeasurement.height + contentOffset.y >= contentSize.height - LOAD_THRESHOLD;

/**
 * Farklı yükseklikteki kartları boşluksuz sütunlara dizen pano (Pinterest).
 * Her öğe o an en kısa sütuna yerleşir; okuma sırası öğe sırası kalır.
 * Kendi içinde kayar; `infinite` ile sona yaklaşınca sonraki sayfa. Mantık web
 * Masonry ile aynı (`masonryUtils`). Sanallaştırma yok — binlerce öğede FlatList.
 */
export function Masonry({ items, columns = { base: 2, sm: 3, md: 4 }, gutter = "sm", infinite, header, skeletonCount = 8, onLayoutChange, accessibilityLabel, skeleton = false, style, contentContainerStyle }: MasonryProps) {
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const requested = useRef(false);
  const gap = resolveGap(gutter);
  const cols = resolveColumns(columns, width);

  const shown = skeleton && items.length === 0 ? SKELETON_HEIGHTS.slice(0, skeletonCount).map((h, i) => ({ key: `sk-${i}`, h })) : items.map((it) => ({ key: String(it.key), h: undefined as number | undefined }));
  const measured = shown.map((s) => s.h ?? heights[s.key] ?? 0);
  const layout = computeLayout(measured, cols, gap, width);
  const lastReported = useRef("");
  const report = `${cols}:${Math.round(layout.height)}`;
  if (onLayoutChange && width > 0 && report !== lastReported.current) {
    lastReported.current = report;
    void Promise.resolve().then(() => onLayoutChange({ columns: cols, height: layout.height }));
  }

  const setHeight = (key: string, h: number) => setHeights((prev) => (prev[key] === h ? prev : { ...prev, [key]: h }));

  return (
    <ScrollView
      style={[{ flex: 1, alignSelf: "stretch" }, style]}
      contentContainerStyle={contentContainerStyle}
      scrollEventThrottle={64}
      onScroll={(e) => {
        if (!infinite?.hasMore || infinite.loading) {
          requested.current = false;
          return;
        }
        if (nearEnd(e.nativeEvent) && !requested.current) {
          requested.current = true;
          infinite.onLoadMore();
        }
      }}
    >
      {header}
      <View accessibilityRole="list" accessibilityLabel={accessibilityLabel} accessibilityState={{ busy: skeleton }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: layout.height }}>
        {width > 0
          ? shown.map((s, i) => {
              const p = layout.positions[i]!;
              const known = s.h !== undefined || heights[s.key] !== undefined;
              const item = items[i];
              return (
                <View
                  key={s.key}
                  // Ölçülmemiş öğe görünmez çizilir (yüksekliği alınır), sonra yerine oturur.
                  onLayout={s.h === undefined ? (e) => setHeight(s.key, e.nativeEvent.layout.height) : undefined}
                  style={{ position: "absolute", left: p.left, top: p.top, width: p.width, opacity: known ? 1 : 0 }}
                >
                  <Cell placeholderHeight={s.h} skeleton={skeleton}>{item?.children}</Cell>
                </View>
              );
            })
          : null}
      </View>
      {infinite && !skeleton ? <Footer infinite={infinite} /> : null}
    </ScrollView>
  );
}
