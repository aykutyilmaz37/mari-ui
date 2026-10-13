import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image as RNImage, PixelRatio, Platform, Pressable, Text, View, type ImageSourcePropType } from "react-native";
import { ImageOffIcon } from "../lib/icons";
import { SkeletonBox, useReduceMotion } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { nativeFontFamily } from "../theme/fontFamily";
import { toPx } from "../theme/toPx";
import { useTheme } from "../theme/useTheme";
import { motionMs } from "../theme/effects";
import { ImageViewer } from "./ImageViewer";
import type { ImagePreviewConfig, ImageProps, ImageSource, ImageStaticSource } from "./types";
import { getBoxStyle, imageButtonRole, normalizeSource, resizeModeFor, resolveBlurSource, resolveUri } from "./utils";

type Status = "loading" | "loaded" | "error";
type Natural = { width: number; height: number };

const FILL = { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0 };
const FADE_MS = 500;

/** `require(...)` görselinin boyutu (paketlenmiş görselde önceden bilinir). */
function assetSize(asset: number): Natural | null {
  const resolved = RNImage.resolveAssetSource?.(asset);
  return resolved?.width && resolved.height ? { width: resolved.width, height: resolved.height } : null;
}

/** Kaynak → RN `source` (+ statik kaynak bilgisi). `loader` varsa kutu ölçülene kadar `null`. */
function useResolvedSource(src: ImageSource | null | undefined, opts: { loader: ImageProps["loader"]; width: unknown; widths?: number[]; quality?: number; layoutWidth?: number }) {
  if (typeof src === "number") return { native: src as ImageSourcePropType, statik: null as ImageStaticSource | null, known: assetSize(src), key: `asset:${src}` };
  const statik = normalizeSource(src);
  const uri = statik ? resolveUri(statik, { ...opts, pixelRatio: PixelRatio.get() }) : null;
  const known = statik?.width && statik.height ? { width: statik.width, height: statik.height } : null;
  return { native: uri ? { uri } : null, statik, known, key: uri ?? "" };
}

function DefaultFallback() {
  const theme = useTheme();
  return (
    <View style={[FILL, { alignItems: "center", justifyContent: "center", gap: 4, padding: 8 }]}>
      <ImageOffIcon size={24} color={theme.color.canvas.muted} />
      <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: 12, lineHeight: 16, color: theme.color.canvas.muted, textAlign: "center" }}>Görsel yüklenemedi</Text>
    </View>
  );
}

/** Yüklenemezse: URL yedeği (o da yüklenemezse varsayılan), node ya da varsayılan. */
function FallbackLayer({ fallback, resizeMode }: { fallback: ImageProps["fallback"]; resizeMode: "cover" | "contain" | "stretch" | "center" }) {
  const [urlFailed, setUrlFailed] = useState(false);
  if (typeof fallback === "string" && !urlFailed) {
    return <RNImage source={{ uri: fallback }} resizeMode={resizeMode} onError={() => setUrlFailed(true)} style={FILL} accessibilityIgnoresInvertColors />;
  }
  if (typeof fallback !== "string" && fallback) return <View style={[FILL, { alignItems: "center", justifyContent: "center" }]}>{fallback}</View>;
  return <DefaultFallback />;
}

type LayoutHandler = (e: { nativeEvent: { layout: Natural } }) => void;

/** Kutunun ölçüsü (`loader` genişliği ve `scale-down` için); yarım pt altı oynamalar yok sayılır. */
function useLayoutSize(): [Natural | undefined, LayoutHandler] {
  const [layout, setLayout] = useState<Natural>();
  const onLayout: LayoutHandler = (e) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout((prev) => (prev && Math.abs(prev.width - width) <= 0.5 && Math.abs(prev.height - height) <= 0.5 ? prev : { width, height }));
  };
  return [layout, onLayout];
}

/** Süs görseli (`alt=""`) ekran okuyucudan gizlenir. */
function imageA11y(alt: string) {
  return {
    accessible: Boolean(alt),
    accessibilityRole: alt ? ("image" as const) : undefined,
    accessibilityLabel: alt || undefined,
    accessibilityElementsHidden: !alt,
    "aria-hidden": !alt,
    importantForAccessibility: alt ? ("yes" as const) : ("no-hide-descendants" as const),
  };
}

/** `placeholder` prop'u → katman parçaları. Varsayılan: `blurDataURL` varsa `true`. */
function placeholderParts(placeholder: ImageProps["placeholder"], statik: ImageStaticSource | null, loader: ImageProps["loader"]) {
  const effective = placeholder ?? (statik?.blurDataURL ? true : undefined);
  const isNode = effective !== undefined && typeof effective !== "boolean" && typeof effective !== "string";
  return {
    blurSrc: statik ? resolveBlurSource(effective, statik, loader) : null,
    custom: isNode ? effective : null,
    pulse: effective === true,
  };
}

/** Yüklenirken: bulanık ön izleme → özel içerik → nabız (öncelik sırasıyla). */
function PlaceholderLayer({ blurSrc, custom, pulse, resizeMode }: { blurSrc: string | null; custom: React.ReactNode; pulse: boolean; resizeMode: "cover" | "contain" | "stretch" | "center" }) {
  if (blurSrc) return <RNImage source={{ uri: blurSrc }} resizeMode={resizeMode} blurRadius={12} style={FILL} accessibilityIgnoresInvertColors />;
  if (custom) return <View style={[FILL, { alignItems: "center", justifyContent: "center" }]}>{custom}</View>;
  return pulse ? <SkeletonBox style={FILL} /> : null;
}

/**
 * Web `Image`ın native karşılığı (yapı ant.design Image): kademeli yükleme
 * (bulanık ön izleme → asıl görsel yumuşak geçişle), `fallback`, `preview`
 * (tam ekran `ImageViewer`). Kutu yeri önceden ayırır (`aspectRatio` ya da
 * `width`/`height`) → yüklenince ekran kaymaz. CDN boyutlandırma `loader` ile:
 * kutu genişliği × ekran piksel oranına en yakın aday istenir.
 */
export function Image({
  src,
  alt,
  width,
  height,
  aspectRatio,
  fit = "cover",
  loader,
  widths,
  quality,
  placeholder,
  fallback,
  preview = false,
  skeleton = false,
  style,
  imageStyle,
  onLoad,
  onError,
}: ImageProps) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const [layout, onLayout] = useLayoutSize();
  const resolved = useResolvedSource(src, { loader, width, widths, quality, layoutWidth: layout?.width });
  const [state, setState] = useState<{ key: string; status: Status; natural: Natural | null }>({ key: resolved.key, status: "loading", natural: null });
  // Kaynak değişince baştan (eski durumu yeni kaynağa taşımadan).
  const current = state.key === resolved.key ? state : { key: resolved.key, status: "loading" as Status, natural: null };
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    opacity.setValue(0);
  }, [resolved.key, opacity]);

  const natural = current.natural ?? resolved.known;
  const box = getBoxStyle({ width, height, aspectRatio, source: resolved.known, natural });
  const radius = toPx(theme.radius.md);
  const resizeMode = resizeModeFor(fit, natural, layout);

  if (skeleton) return <SkeletonBox style={[{ borderRadius: radius, maxWidth: "100%" }, box.style, style]} />;

  const ph = placeholderParts(placeholder, resolved.statik, loader);
  const noSource = src == null || (typeof src !== "number" && !resolved.statik);
  const loaded = current.status === "loaded";
  const failed = current.status === "error" || noSource;
  // `loader` varken kutu ölçülene kadar istek yok — o arada da yükleniyor sayılır.
  const waiting = !failed && !resolved.native;

  const content = (
    <>
      {!loaded && !failed ? <PlaceholderLayer blurSrc={ph.blurSrc} custom={ph.custom} pulse={ph.pulse || waiting} resizeMode={resizeMode} /> : null}
      {resolved.native && current.status !== "error" ? (
        <Animated.Image
          source={resolved.native}
          resizeMode={resizeMode}
          accessibilityIgnoresInvertColors
          onLoad={(e) => {
            const s = e.nativeEvent.source;
            const size = s?.width && s.height ? { width: s.width, height: s.height } : null;
            setState({ key: resolved.key, status: "loaded", natural: size });
            Animated.timing(opacity, { toValue: 1, duration: reduce ? 0 : motionMs(theme, FADE_MS), easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
            if (size) onLoad?.(size);
          }}
          onError={() => {
            setState({ key: resolved.key, status: "error", natural: null });
            onError?.();
          }}
          style={[FILL, { opacity }, imageStyle]}
        />
      ) : null}
      {failed ? <FallbackLayer key={resolved.key} fallback={fallback} resizeMode={resizeMode} /> : null}
    </>
  );

  const boxStyle = [
    { overflow: "hidden" as const, borderRadius: radius, maxWidth: "100%" as const },
    box.style,
    !loaded && { backgroundColor: theme.color.canvas.surfaceAlt },
    style,
  ];
  if (!preview) {
    return (
      <View onLayout={onLayout} {...imageA11y(alt)} style={boxStyle}>
        {content}
      </View>
    );
  }

  return (
    <PreviewFrame config={typeof preview === "object" ? preview : {}} src={src} alt={alt} loader={loader} disabled={failed} thumbnail={resolved.native && typeof resolved.native === "object" && "uri" in resolved.native ? resolved.native.uri : undefined} boxStyle={boxStyle} onLayout={onLayout}>
      {content}
    </PreviewFrame>
  );
}

/** `preview`: kutu bir düğme olur, tam ekran görüntüleyiciyi açar. */
function PreviewFrame({
  config,
  src,
  alt,
  loader,
  disabled,
  thumbnail,
  boxStyle,
  onLayout,
  children,
}: {
  config: ImagePreviewConfig;
  src: ImageProps["src"];
  alt: string;
  loader: ImageProps["loader"];
  disabled: boolean;
  thumbnail?: string;
  boxStyle: React.ComponentProps<typeof View>["style"][];
  onLayout: LayoutHandler;
  children: React.ReactNode;
}) {
  const [innerOpen, setInnerOpen] = useControllable(config.open, false);
  const setOpen = (next: boolean) => {
    setInnerOpen(next);
    config.onOpenChange?.(next);
  };
  const previewSource = config.src ?? src;
  return (
    <>
      <Pressable
        onLayout={onLayout}
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole={imageButtonRole(Platform.OS)}
        accessibilityLabel={alt || "Görsel"}
        accessibilityHint="Tam ekranda açar"
        accessibilityState={{ disabled }}
        aria-disabled={disabled}
        style={({ pressed }) => [...boxStyle, pressed && { opacity: 0.85 }]}
      >
        {children}
      </Pressable>
      {previewSource != null ? (
        <ImageViewer open={innerOpen} onClose={() => setOpen(false)} loader={loader} items={[{ key: "preview", src: previewSource, alt, caption: config.caption, thumbnail }]} />
      ) : null}
    </>
  );
}
