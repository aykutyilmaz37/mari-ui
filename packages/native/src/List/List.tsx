import React, { createContext, useContext, useEffect, useRef } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import { Button } from "../Button";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { SkeletonBox } from "../lib/Skeleton";
import type { InfiniteScrollOptions, ListItemLayout, ListItemMetaProps, ListItemProps, ListProps } from "./types";

export type { InfiniteScrollOptions, ListItemLayout, ListItemMetaProps, ListItemProps, ListProps };

interface ListContextValue {
  size: Size;
  bordered: boolean;
  itemLayout: ListItemLayout;
}

const ListContext = createContext<ListContextValue>({ size: "md", bordered: false, itemLayout: "horizontal" });

function DefaultSeparator() {
  const theme = useTheme();
  const config = useNativeConfig();
  const { size } = useContext(ListContext);
  return <View style={{ height: StyleSheet.hairlineWidth, marginLeft: config.list[size].rowPaddingHorizontal, backgroundColor: theme.color.canvas.border }} />;
}

function DefaultEmpty() {
  const theme = useTheme();
  const config = useNativeConfig();
  const { size } = useContext(ListContext);
  const text = config.list[size];
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingHorizontal: text.rowPaddingHorizontal, paddingVertical: text.rowPaddingVertical * 2 }}>
      <Text style={{ color: theme.color.canvas.muted, fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: text.descriptionFontSize, lineHeight: text.descriptionLineHeight }}>
        Kayıt yok
      </Text>
    </View>
  );
}

/** Rows mirror `ListItem` + `ListItemMeta` geometry (line boxes, 2px gap, separators) so loading → loaded doesn't shift. */
function SkeletonRows({ count, separator }: { count: number; separator?: React.ComponentType | React.ReactElement | null }) {
  const config = useNativeConfig();
  const { size } = useContext(ListContext);
  const metrics = config.list[size];
  const line = (lineHeight: number, width: `${number}%`) => (
    <View style={{ height: lineHeight, justifyContent: "center" }}>
      <SkeletonBox style={{ width, height: Math.round(lineHeight * 0.65), borderRadius: 4 }} />
    </View>
  );
  return (
    <View accessibilityElementsHidden aria-hidden importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, index) => (
        <React.Fragment key={index}>
          {index > 0 ? renderListSlot(separator) : null}
          <View style={{ flexDirection: "row", alignItems: "center", minHeight: metrics.rowMinHeight, gap: metrics.metaGap, paddingHorizontal: metrics.rowPaddingHorizontal, paddingVertical: metrics.rowPaddingVertical }}>
            <SkeletonBox style={{ width: 40, height: 40, borderRadius: 20 }} />
            <View style={{ flex: 1 }}>
              {line(metrics.titleLineHeight, "44%")}
              <View style={{ marginTop: 2 }}>{line(metrics.descriptionLineHeight, "72%")}</View>
            </View>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function InfiniteFooter({ options, onLoadMore }: { options: InfiniteScrollOptions; onLoadMore: () => void }) {
  const theme = useTheme();
  const config = useNativeConfig();
  const { size } = useContext(ListContext);
  const metrics = config.list[size];
  const { hasMore, loading = false, endMessage = "Hepsi bu kadar", loadMoreLabel = "Daha fazla yükle" } = options;

  if (loading) {
    return (
      <View accessibilityRole="progressbar" accessibilityLabel="Yükleniyor" accessibilityLiveRegion="polite" style={{ minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 12 }}>
        <ActivityIndicator size="small" color={theme.color.primary.solid} />
        <Text style={{ color: theme.color.canvas.muted, fontSize: metrics.descriptionFontSize, lineHeight: metrics.descriptionLineHeight }}>Yükleniyor…</Text>
      </View>
    );
  }

  if (hasMore) {
    return (
      <View style={{ minHeight: 48, alignItems: "center", justifyContent: "center", padding: 8 }}>
        <Button size="sm" variant="outline" onPress={onLoadMore}>{loadMoreLabel}</Button>
      </View>
    );
  }

  if (endMessage == null) return null;
  return (
    <View accessibilityRole="text" style={{ minHeight: 48, alignItems: "center", justifyContent: "center", padding: 12 }}>
      {typeof endMessage === "string" || typeof endMessage === "number"
        ? <Text style={{ color: theme.color.canvas.muted, fontSize: metrics.descriptionFontSize, lineHeight: metrics.descriptionLineHeight }}>{endMessage}</Text>
        : endMessage}
    </View>
  );
}

function renderListSlot(slot: React.ComponentType | React.ReactElement | null | undefined) {
  if (slot == null) return null;
  return React.isValidElement(slot) ? slot : React.createElement(slot);
}

/** Alt bilgi / boş durum da `list` rolünün çocuğu: liste öğesi olarak sarılır. */
function asListItem(slot: React.ComponentType | React.ReactElement | null | undefined) {
  return slot == null ? undefined : <View role="listitem">{renderListSlot(slot)}</View>;
}

function ListInner<ItemT>(
  {
    data,
    renderItem,
    keyExtractor,
    ItemSeparatorComponent,
    ListHeaderComponent,
    ListFooterComponent,
    ListEmptyComponent,
    onEndReached,
    onEndReachedThreshold,
    infinite,
    split = true,
    size = "md",
    bordered = false,
    itemLayout = "horizontal",
    skeleton = false,
    skeletonRows = 3,
    style,
    contentContainerStyle,
    ...flatListProps
  }: ListProps<ItemT>,
  ref: React.ForwardedRef<FlatList<ItemT>>
) {
  const theme = useTheme();
  const context: ListContextValue = { size, bordered, itemLayout };
  const itemCount = skeleton ? 0 : data?.length ?? 0;
  const loadRequested = useRef(false);
  const previousItemCount = useRef(itemCount);
  useEffect(() => {
    if (previousItemCount.current !== itemCount || !infinite?.loading) loadRequested.current = false;
    previousItemCount.current = itemCount;
  }, [infinite?.loading, itemCount]);

  const requestMore = () => {
    if (!infinite || !infinite.hasMore || infinite.loading || itemCount === 0 || loadRequested.current) return;
    loadRequested.current = true;
    try {
      infinite.onLoadMore();
    } catch (error) {
      loadRequested.current = false;
      throw error;
    }
  };

  const safeSkeletonRows = Number.isFinite(skeletonRows) ? Math.max(1, Math.min(10, Math.floor(skeletonRows))) : 3;
  let separator = ItemSeparatorComponent;
  if (separator === undefined && split) separator = DefaultSeparator;
  let emptyComponent = ListEmptyComponent;
  if (skeleton) emptyComponent = () => <SkeletonRows count={safeSkeletonRows} separator={separator} />;
  else if (emptyComponent === undefined) emptyComponent = DefaultEmpty;
  const footerComponent = infinite && !skeleton && itemCount > 0
    ? () => <>{renderListSlot(ListFooterComponent)}<InfiniteFooter options={infinite} onLoadMore={requestMore} /></>
    : ListFooterComponent;
  const containerStyle: StyleProp<ViewStyle> = [
    { width: "100%" },
    bordered && {
      borderWidth: 1,
      borderColor: theme.color.canvas.border,
      borderRadius: toPx(theme.radius.lg),
      backgroundColor: theme.color.canvas.surface,
      overflow: "hidden",
    },
    style,
  ];

  return (
    <ListContext.Provider value={context}>
      <FlatList<ItemT>
        {...flatListProps}
        ref={ref}
        data={skeleton ? [] : data}
        renderItem={({ item, index }) => (skeleton ? null : renderItem(item, index))}
        CellRendererComponent={ListCell}
        keyExtractor={keyExtractor}
        ItemSeparatorComponent={separator}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={asListItem(footerComponent)}
        ListEmptyComponent={asListItem(emptyComponent)}
        onEndReached={(info) => {
          onEndReached?.(info);
          requestMore();
        }}
        onEndReachedThreshold={onEndReachedThreshold ?? (infinite ? 0.5 : undefined)}
        style={containerStyle}
        contentContainerStyle={[{ flexGrow: 1, width: "100%" }, contentContainerStyle]}
        accessibilityRole={flatListProps.accessibilityRole ?? "list"}
      />
    </ListContext.Provider>
  );
}

/** Native, virtualized list. Scroll, refresh and windowing props pass through to `FlatList`; `infinite` adds guarded paging. */
export const List = React.forwardRef(ListInner) as <ItemT>(props: ListProps<ItemT> & React.RefAttributes<FlatList<ItemT>>) => React.ReactElement;

/** A padded row rendered by `List`. */
/** Her hücre bir liste öğesi: `list` rolünün altında `listitem` (web'de ekran okuyucu "öğe 3/12" der). */
function ListCell(props: ViewProps) {
  return <View {...props} role="listitem" />;
}

export function ListItem({ children, actions, extra, style, ...viewProps }: ListItemProps) {
  const config = useNativeConfig();
  const { size, itemLayout } = useContext(ListContext);
  const metrics = config.list[size];
  const rowStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: itemLayout === "vertical" ? "stretch" : "center",
    width: "100%",
    minHeight: metrics.rowMinHeight,
    gap: metrics.contentGap,
    paddingHorizontal: metrics.rowPaddingHorizontal,
    paddingVertical: metrics.rowPaddingVertical,
  };
  const actionNodes = actions?.length ? (
    <View style={{ flexDirection: "row", alignItems: "center", gap: metrics.actionGap }}>
      {actions.map((action, index) => <React.Fragment key={index}>{action}</React.Fragment>)}
    </View>
  ) : null;

  if (itemLayout === "vertical") {
    return (
      <View {...viewProps} style={[rowStyle, { flexDirection: "column", alignItems: "stretch" }, style]}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: metrics.contentGap }}>
          <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
          {extra != null ? <View style={{ flexShrink: 0 }}>{extra}</View> : null}
        </View>
        {actionNodes}
      </View>
    );
  }

  return (
    <View {...viewProps} style={[rowStyle, style]}>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      {actionNodes}
      {extra != null ? <View style={{ flexShrink: 0 }}>{extra}</View> : null}
    </View>
  );
}

/** Native avatar + title + description block. */
export function ListItemMeta({ avatar, title, description, style }: ListItemMetaProps) {
  const theme = useTheme();
  const config = useNativeConfig();
  const { size } = useContext(ListContext);
  const metrics = config.list[size];
  const fontFamily = nativeFontFamily(theme.fontFamily.sans);
  const titleStyle = { color: theme.color.canvas.foreground, fontFamily, fontSize: metrics.titleFontSize, lineHeight: metrics.titleLineHeight, fontWeight: "600" as const };
  const descriptionStyle = { color: theme.color.canvas.muted, fontFamily, fontSize: metrics.descriptionFontSize, lineHeight: metrics.descriptionLineHeight };
  return (
    <View style={[{ flexDirection: "row", alignItems: "flex-start", gap: metrics.metaGap, flex: 1, minWidth: 0 }, style]}>
      {avatar != null ? <View style={{ flexShrink: 0 }}>{avatar}</View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title != null ? <MetaText value={title} textStyle={titleStyle} /> : null}
        {description != null ? <View style={title != null ? { marginTop: 2 } : undefined}><MetaText value={description} textStyle={descriptionStyle} /></View> : null}
      </View>
    </View>
  );
}

function MetaText({ value, textStyle }: { value: React.ReactNode; textStyle: { color: string; fontFamily?: string; fontSize: number; lineHeight: number; fontWeight?: "600" } }) {
  if (typeof value === "string" || typeof value === "number") return <Text style={textStyle}>{value}</Text>;
  return <View>{value}</View>;
}
