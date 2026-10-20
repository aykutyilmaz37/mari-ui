import React, { useId, useMemo } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, G, Image as SvgImage, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { neutralRamp } from "@mari-ui/tokens";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { CircleCheckIcon, RotateCcwIcon } from "../lib/icons";
import { SkeletonBox } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import { buildQRModel } from "./qrUtils";
import type { QRCodeProps as WebQRCodeProps, QRStatus } from "./types";

export type { QRCornerDotType, QRCornerSquareType, QRDotType, QRErrorLevel, QRStatus } from "./types";

export interface QRCodeProps extends Omit<WebQRCodeProps, "size" | "className" | "aria-label" | "icon"> {
  /** Kenar uzunluğu (pt). Varsayılan: 160. */
  size?: number;
  /** Ortadaki logo: URL ya da `require(...)`. */
  icon?: string | number;
  /** Erişilebilir ad. Varsayılan: `"QR kod"`. İçeriği metin olarak da verin (ör. altında URL). */
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

function StatusLayer({ status, onRefresh }: Readonly<{ status: Exclude<QRStatus, "active">; onRefresh?: () => void }>) {
  const theme = useTheme();
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const t = (size: number, color: string, weight: "400" | "500" = "400") => ({ fontFamily: font, fontSize: size, color, fontWeight: weight, textAlign: "center" as const });
  if (status === "loading")
    return (
      <>
        <Spinner size={28} color={theme.color.primary.solid} />
        <Text style={t(14, c.muted)}>Hazırlanıyor…</Text>
      </>
    );
  if (status === "scanned")
    return (
      <>
        <CircleCheckIcon size={28} color={theme.color.success.solid} />
        <Text style={t(14, c.foreground, "500")}>Tarandı</Text>
        <Text style={t(12, c.muted)}>Telefonunuzdan onaylayın</Text>
      </>
    );
  return (
    <>
      <Text style={t(14, c.foreground, "500")}>QR kodun süresi doldu</Text>
      {onRefresh ? (
        <Pressable accessibilityRole="button" onPress={onRefresh} hitSlop={10} style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: pressed ? theme.color.primary.subtle : "transparent" })}>
          <RotateCcwIcon size={14} color={theme.color.primary.text} />
          <Text style={t(14, theme.color.primary.text, "500")}>Yenile</Text>
        </Pressable>
      ) : null}
    </>
  );
}

interface GraphicProps {
  model: ReturnType<typeof buildQRModel>;
  size: number;
  gradientId: string;
  color: string;
  colorEnd?: string;
  bgColor: string;
  cornerColor?: string;
  icon?: string | number;
  iconSize: number;
}

/** SVG çizimi: zemin, veri modülleri, üç konum işareti, isteğe bağlı gradyan ve logo. */
function QRGraphic({ model, size, gradientId, color, colorEnd, bgColor, cornerColor, icon, iconSize }: Readonly<GraphicProps>) {
  const fill = colorEnd ? `url(#${gradientId})` : color;
  const cornerFill = cornerColor ?? fill;
  const iconEdge = model.size * Math.min(Math.max(iconSize, 0.1), 0.3);
  const iconPos = (model.size - iconEdge) / 2;
  const iconPad = iconEdge * 0.08;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${model.size} ${model.size}`}>
      {colorEnd ? (
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={colorEnd} />
          </LinearGradient>
        </Defs>
      ) : null}
      {bgColor === "transparent" ? null : <Rect width={model.size} height={model.size} fill={bgColor} />}
      <Path d={model.dataPath} fill={fill} />
      {model.corners.map((corner, i) => (
        <G key={i} fill={cornerFill}>
          <Path fillRule="evenodd" d={corner.ring} />
          <Path d={corner.dot} />
        </G>
      ))}
      {icon == null ? null : (
        <>
          <Rect x={iconPos - iconPad} y={iconPos - iconPad} width={iconEdge + iconPad * 2} height={iconEdge + iconPad * 2} rx={iconPad * 2} fill={bgColor === "transparent" ? "#ffffff" : bgColor} />
    <SvgImage href={typeof icon === "string" ? { uri: icon } : icon} x={iconPos} y={iconPos} width={iconEdge} height={iconEdge} preserveAspectRatio="xMidYMid meet" />
        </>
      )}
    </Svg>
  );
}

/**
 * QR kod: web QRCode ile aynı model (`qrcode-generator` + kullanıcının
 * renderer'ı — nokta stilleri, köşe şekilleri, gradyan, logo), çizim
 * `react-native-svg`. Durum katmanı: hazırlanıyor / süresi doldu (Yenile) /
 * tarandı. Türkçe içerik UTF-8 doğru kodlanır.
 */
export function QRCode({
  value,
  size = 160,
  errorLevel,
  // Her temada koyu-üstü-açık: bazı okuyucular ters (açık-üstü-koyu) QR'ı çözemez.
  color = neutralRamp[950],
  colorEnd,
  bgColor = "#ffffff",
  cornerColor,
  dotType = "square",
  cornerSquareType = "square",
  cornerDotType = "square",
  icon,
  iconSize = 0.22,
  margin = 2,
  bordered = true,
  status = "active",
  onRefresh,
  statusRender,
  accessibilityLabel = "QR kod",
  skeleton = false,
  style,
}: Readonly<QRCodeProps>) {
  const theme = useTheme();
  const gradientId = `qr-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const level = errorLevel ?? (icon ? "H" : "M");
  const model = useMemo(() => buildQRModel({ value, errorLevel: level, margin, dotType, cornerSquareType, cornerDotType }), [value, level, margin, dotType, cornerSquareType, cornerDotType]);
  const c = theme.color.canvas;
  const frame: ViewStyle = bordered ? { padding: 8, borderRadius: toPx(theme.radius.lg), borderWidth: 1, borderColor: c.border, backgroundColor: c.surface } : {};
  const busy = skeleton || status === "loading";

  return (
    <View accessibilityState={{ busy }} style={[{ alignSelf: "flex-start" }, frame, style]}>
      {skeleton ? (
        <SkeletonBox style={{ width: size, height: size, borderRadius: 6 }} />
      ) : (
        <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ opacity: status === "active" ? 1 : 0.1, borderRadius: 6, overflow: "hidden" }}>
          <QRGraphic model={model} size={size} gradientId={gradientId} color={color} colorEnd={colorEnd} bgColor={bgColor} cornerColor={cornerColor} icon={icon} iconSize={iconSize} />
        </View>
      )}
      {!skeleton && status !== "active" ? (
        <View accessibilityLiveRegion="polite" accessibilityRole="alert" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", gap: 6, padding: 8 }}>
          {statusRender ? statusRender(status) : <StatusLayer status={status} onRefresh={onRefresh} />}
        </View>
      ) : null}
    </View>
  );
}
