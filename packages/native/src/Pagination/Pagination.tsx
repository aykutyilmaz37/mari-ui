import React, { useState } from "react";
import { Pressable, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { ChevronLeftIcon, ChevronRightIcon } from "../lib/icons";
import { SkeletonBox, SkeletonText, type SkeletonableProps } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { clampPage, fitSiblingCount, getItemRange, getPageItems, getTotalPages, resolvePageClickTarget, type PageItem } from "./paginationUtils";

export type PaginationVariant = "outline" | "soft" | "solid";

export interface PaginationProps extends SkeletonableProps {
  /** Aktif sayfa (1 tabanlı). Verilirse kontrollü. */
  currentPage?: number;
  /** Varsayılan: `1`. */
  defaultPage?: number;
  /** Sayfa başına öğe. Varsayılan: `10`. */
  pageSize?: number;
  totalItems: number;
  /** Sayfa gerçekten DEĞİŞTİĞİNDE. */
  onPageChange?: (page: number, pageSize: number) => void;
  /**
   * `true` (varsayılan): `‹ 3 / 10 ›` — mobilde yaygın biçim. `false`: sayfa
   * numaraları; kaç komşu sığacağı genişliğe göre ayarlanır, `…` ileri / geri atlar.
   */
  simple?: boolean;
  /** `true`: "11–20 / 95 kayıt". Fonksiyon: kendi metniniz. */
  showTotal?: boolean | ((total: number, range: [number, number]) => React.ReactNode);
  /** Sayfa numaralarında en fazla komşu sayısı. Varsayılan: `1`. */
  siblingCount?: number;
  /** Düğme sm 32 · md 40 · lg 44 (dokunma alanı hep ≥ 44). Varsayılan: `md`. */
  size?: Size;
  /** Varsayılan: `primary`. */
  color?: ColorRole;
  /** Aktif sayfa görünümü. Varsayılan: `outline`. */
  variant?: PaginationVariant;
  disabled?: boolean;
  /** Varsayılan: `"Sayfalama"`. */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const BOX: Record<Size, number> = { sm: 32, md: 40, lg: 44 };
const GAP = 4;

function activeStyle(variant: PaginationVariant, color: ColorRole, theme: Theme): { box: ViewStyle; ink: string } {
  const r = theme.color[color];
  if (variant === "solid") return { box: { backgroundColor: r.solid, borderColor: r.solid }, ink: r.solidContrast };
  if (variant === "soft") return { box: { backgroundColor: r.subtle, borderColor: r.subtle }, ink: r.subtleContrast };
  return { box: { borderColor: r.solid }, ink: r.text };
}

interface CellProps {
  label: string;
  onPress?: () => void;
  disabled: boolean;
  active?: boolean;
  children: React.ReactNode;
  size: number;
  activeBox?: ViewStyle;
  theme: Theme;
}

/** Kare düğme; görünür kutu `size`, dokunma alanı 44'e tamamlanır. */
function Cell({ label, onPress, disabled, active = false, children, size, activeBox, theme }: Readonly<CellProps>) {
  const slop = Math.max(0, (44 - size) / 2);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled || active}
      onPress={onPress}
      hitSlop={{ top: slop, bottom: slop, left: GAP / 2, right: GAP / 2 }}
      style={({ pressed }) => [
        { minWidth: size, height: size, paddingHorizontal: 6, borderRadius: toPx(theme.radius.md), borderWidth: 1, borderColor: "transparent", alignItems: "center", justifyContent: "center", opacity: disabled ? 0.35 : 1 },
        pressed && !active ? { backgroundColor: theme.color.canvas.surfaceAlt } : null,
        active ? activeBox : null,
      ]}
    >
      {children}
    </Pressable>
  );
}

/**
 * Sayfalama. Varsayılan `‹ 3 / 10 ›` (mobil); `simple={false}` sayfa numaraları
 * — sığan komşu sayısı genişliğe göre, `…` beş sayfa atlar. Sayfa boyutu seçici
 * ve "Git" alanı yok (mobilde Select / InputNumber ile ayrıca). Mantık web
 * Pagination ile aynı (`paginationUtils`).
 */
export function Pagination({ currentPage, defaultPage = 1, pageSize = 10, totalItems, onPageChange, simple = true, showTotal = false, siblingCount = 1, size = "md", color = "primary", variant = "outline", disabled = false, accessibilityLabel = "Sayfalama", skeleton = false, style }: Readonly<PaginationProps>) {
  const theme = useTheme();
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const total = getTotalPages(totalItems, pageSize);
  const [pageRaw, setPage] = useControllable<number>(currentPage, defaultPage);
  const page = clampPage(pageRaw, total);
  const [measured, setWidth] = useState(0);
  // Ölçülene kadar pencere genişliği (ilk karede taşmasın; gizli web panelinde onLayout gelmiyor).
  const windowWidth = useWindowDimensions().width;
  const width = measured || windowWidth - 32;
  const box = BOX[size];
  const fontSize = size === "sm" ? 14 : 15;
  const text = (color2: string, weight: "400" | "600" = "400") => ({ fontFamily: font, fontSize, fontWeight: weight, color: color2, fontVariant: ["tabular-nums" as const] });
  const go = (next: number) => {
    const target = clampPage(next, total);
    if (target === page) return;
    setPage(target);
    onPageChange?.(target, pageSize);
  };
  const act = activeStyle(variant, color, theme);
  const sk = (node: React.ReactNode) => (skeleton ? <SkeletonBox style={{ width: box, height: box, borderRadius: toPx(theme.radius.md) }} /> : node);

  const prev = sk(
    <Cell label="Önceki sayfa" onPress={() => go(page - 1)} disabled={disabled || page <= 1} size={box} theme={theme}>
      <ChevronLeftIcon size={18} color={c.foreground} />
    </Cell>
  );
  const next = sk(
    <Cell label="Sonraki sayfa" onPress={() => go(page + 1)} disabled={disabled || page >= total} size={box} theme={theme}>
      <ChevronRightIcon size={18} color={c.foreground} />
    </Cell>
  );

  let middle: React.ReactNode;
  if (simple) {
    const label = `${page} / ${total}`;
    middle = skeleton ? (
      <SkeletonText fontSize={fontSize}>
        <Text style={text(c.foreground)}>{label}</Text>
      </SkeletonText>
    ) : (
      <Text accessibilityLabel={`Sayfa ${page}, toplam ${total}`} style={[text(c.foreground), { minWidth: 64, textAlign: "center" }]}>
        <Text style={text(c.foreground, "600")}>{page}</Text>
        <Text style={text(c.muted)}>{` / ${total}`}</Text>
      </Text>
    );
  } else {
    // Ok düğmeleri hariç sığan hücre sayısına göre komşu sayısı (dar ekranda taşmasın).
    const slots = Math.max(0, width - 2 * (box + GAP));
    const siblings = fitSiblingCount(slots, box, GAP, total, siblingCount);
    const items: PageItem[] = getPageItems(total, page, siblings);
    middle = items.map((it, i) => {
      if (typeof it === "number") {
        return (
          <React.Fragment key={it}>
            {sk(
              <Cell label={`Sayfa ${it}`} onPress={() => go(it)} disabled={disabled} active={it === page} size={box} activeBox={act.box} theme={theme}>
                <Text style={text(it === page ? act.ink : c.foreground, it === page ? "600" : "400")}>{it}</Text>
              </Cell>
            )}
          </React.Fragment>
        );
      }
      const target = resolvePageClickTarget(it, page, total, siblings);
      return (
        <React.Fragment key={`e${i}`}>
          {sk(
            <Cell label={it.direction === "left" ? `Geri atla, sayfa ${target}` : `İleri atla, sayfa ${target}`} onPress={() => go(target)} disabled={disabled} size={box} theme={theme}>
              <Text style={text(c.muted)}>…</Text>
            </Cell>
          )}
        </React.Fragment>
      );
    });
  }

  const range = getItemRange(page, pageSize, totalItems);
  let totalNode: React.ReactNode = null;
  if (showTotal) totalNode = typeof showTotal === "function" ? showTotal(totalItems, range) : `${range[0]}–${range[1]} / ${totalItems} kayıt`;

  return (
    <View accessibilityRole="toolbar" accessibilityLabel={accessibilityLabel} onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={[{ alignSelf: "stretch", gap: 8 }, style]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: GAP }}>
        {prev}
        {middle}
        {next}
      </View>
      {typeof totalNode === "string" ? <Text style={[text(c.muted), { fontSize: 13, textAlign: "center" }]}>{totalNode}</Text> : totalNode}
    </View>
  );
}
