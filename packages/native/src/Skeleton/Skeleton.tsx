import React from "react";
import { View, type DimensionValue, type StyleProp, type ViewStyle } from "react-native";
import type { Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { SkeletonBox, SkeletonLine } from "../lib/Skeleton";

export type SkeletonAvatarShape = "circle" | "square";

export interface SkeletonAvatarProps {
  active?: boolean;
  /** Varsayılan: `"circle"` (Avatar gibi). */
  shape?: SkeletonAvatarShape;
  /** `sm`/`md`/`lg` (Avatar ölçeği 32/40/56) ya da pt. Varsayılan: `md`. */
  size?: number | Size;
}

export interface SkeletonTitleProps {
  width?: DimensionValue;
}

export interface SkeletonParagraphProps {
  rows?: number;
  /** Tek değer → son satır; dizi → satır satır. */
  width?: DimensionValue | DimensionValue[];
}

export interface SkeletonProps {
  /** Nabız animasyonu. Varsayılan: `true` (native component iskeletleriyle aynı; hareket azaltmada durur). */
  active?: boolean;
  /**
   * Verilirse iskelet bu adla "meşgul" olarak duyurulur. Varsayılan: ekran
   * okuyucudan gizli — ekranda 12 iskelet varken 12 kez "yükleniyor" okunmasın.
   */
  label?: string;
  avatar?: boolean | SkeletonAvatarProps;
  /** `false` → `children` gösterilir. */
  loading?: boolean;
  paragraph?: boolean | SkeletonParagraphProps;
  /** Satır çubukları hap köşeli. */
  round?: boolean;
  title?: boolean | SkeletonTitleProps;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export interface SkeletonBlockProps {
  width?: DimensionValue;
  /** Varsayılan: 16. */
  height?: DimensionValue;
  /** Tema köşe anahtarı. Varsayılan: `"md"`. */
  radius?: "none" | "sm" | "md" | "lg" | "xl" | "full";
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

function paragraphWidths(width: SkeletonParagraphProps["width"], rows: number): DimensionValue[] {
  return Array.from({ length: rows }, (_, i) => {
    if (Array.isArray(width)) return width[i] ?? "100%";
    if (i === rows - 1) return width ?? (rows > 1 ? "60%" : "100%");
    return "100%";
  });
}

/**
 * Ekran ya da bölüm iskeleti: avatar + başlık + paragraf. Satırlar Typography
 * ölçeğinde (başlık = Headline 17/22, paragraf = Body 17/22) — yerine gelecek
 * `Title level={5}` + `Paragraph` ile aynı yükseklik.
 */
export function Skeleton({ active = true, label, avatar = false, loading, paragraph = true, round = false, title = true, style, children }: SkeletonProps) {
  const theme = useTheme();
  const config = useNativeConfig();
  if (loading === false) return <>{children}</>;

  const avatarProps: SkeletonAvatarProps = typeof avatar === "object" ? avatar : {};
  const titleProps: SkeletonTitleProps = typeof title === "object" ? title : {};
  const paragraphProps: SkeletonParagraphProps = typeof paragraph === "object" ? paragraph : {};
  const rows = Math.max(1, Math.floor(paragraphProps.rows ?? 3));
  const head = config.typography.h5;
  const body = config.typography.body;
  const avatarSize = avatarProps.size ?? "md";
  const avatarScale = typeof avatarSize === "number" ? undefined : config.avatar[avatarSize];
  const avatarDimension = avatarScale?.size ?? (avatarSize as number);
  const avatarRadius = (avatarProps.shape ?? "circle") === "circle" ? avatarDimension / 2 : toPx(theme.radius[avatarScale?.radius ?? "lg"]);
  const roundStyle: ViewStyle | undefined = round ? { borderRadius: 999 } : undefined;

  const a11y = label
    ? { accessible: true, accessibilityLabel: label, accessibilityState: { busy: true }, "aria-busy": true }
    : { accessibilityElementsHidden: true, "aria-hidden": true, importantForAccessibility: "no-hide-descendants" as const };

  return (
    <View {...a11y} style={[{ flexDirection: "row", gap: 16, alignSelf: "stretch" }, style]}>
      {avatar ? <SkeletonBox animated={avatarProps.active ?? active} style={{ width: avatarDimension, height: avatarDimension, borderRadius: avatarRadius }} /> : null}
      <View style={{ flex: 1, gap: 8 }}>
        {title ? <RoundLine fontSize={head.fontSize} lineHeight={head.lineHeight} width={titleProps.width ?? "40%"} animated={active} round={roundStyle} /> : null}
        {paragraph ? (
          <View>
            {paragraphWidths(paragraphProps.width, rows).map((width, i) => (
              <RoundLine key={i} fontSize={body.fontSize} lineHeight={body.lineHeight} width={width} animated={active} round={roundStyle} />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function RoundLine({ round, ...line }: { fontSize: number; lineHeight: number; width: DimensionValue; animated: boolean; round?: ViewStyle }) {
  if (!round) return <SkeletonLine {...line} />;
  return (
    <View style={{ height: line.lineHeight, justifyContent: "center" }}>
      <SkeletonBox animated={line.animated} style={[{ width: line.width, height: Math.round(line.fontSize * 0.7) }, round]} />
    </View>
  );
}

/** Serbest biçimli yer tutucu (görsel, grafik, özel kutu). */
export function SkeletonBlock({ width = "100%", height = 16, radius = "md", active = true, style }: SkeletonBlockProps) {
  const theme = useTheme();
  return <SkeletonBox animated={active} style={[{ width, height, borderRadius: toPx(theme.radius[radius]) }, style]} />;
}
