import React, { useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, KeyboardAvoidingView, Modal as RNModal, PanResponder, Platform, Pressable, ScrollView, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { overlaySurface, scrimColor } from "../lib/overlay";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { releaseTarget, resolveSnapPoints, type SnapPoint } from "./snap";

export type { SnapPoint };

export interface BottomSheetProps extends SkeletonableProps {
  open: boolean;
  /** Kapatma isteği: aşağı sürükleme, karartmaya dokunma, Android geri tuşu, VoiceOver "geri". */
  onClose: () => void;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** Sabit alt bölüm (ör. "Uygula" düğmesi); her durakta görünür, içerik kaysa da yerinde. */
  footer?: React.ReactNode;
  /**
   * Durak noktaları: pt ya da yüzde (`["50%", "90%"]`). Verilmezse panel içerik
   * kadar yüksek (en fazla ekranın %90'ı) ve tek durak.
   */
  snapPoints?: SnapPoint[];
  /** Açılıştaki durak (küçükten büyüğe sıra). Varsayılan: 0. */
  initialSnap?: number;
  onSnapChange?: (index: number) => void;
  /** Karartmaya dokununca kapanır. Varsayılan: `true`. */
  maskClosable?: boolean;
  /** Aşağı sürükleyerek kapatılabilir. Varsayılan: `true`. */
  closable?: boolean;
  /** Android geri tuşu kapatır. Varsayılan: `true`. */
  keyboard?: boolean;
  /** Alt güvenli alan payı (iOS ev çubuğu). Varsayılan: iOS 28, Android 16. */
  bottomInset?: number;
  /**
   * Kapanış animasyonu bitip panel kaldırıldıktan sonra. Kapanışta başka bir
   * pencere (Dialog) açacaksanız burada açın — iOS, kapanmakta olan bir
   * Modal varken yenisini göstermez.
   */
  onAfterClose?: () => void;
  /** Başlık yoksa erişilebilir ad. */
  accessibilityLabel?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

const HANDLE_AREA = 24;
const OPEN_MS = 280;
const KEYBOARD_BEHAVIOR = Platform.OS === "ios" ? ("padding" as const) : undefined;
const DEFAULT_INSET = Platform.OS === "ios" ? 28 : 16;
const noop = () => undefined;

function useReduceMotion() {
  const ref = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((v) => (ref.current = v)).catch(() => undefined);
  }, []);
  return ref;
}

/**
 * Panelin GÖRÜNEN YÜKSEKLİĞİ canlandırılır (0 = kapalı, durak = o yükseklik).
 * Kaydırma (translateY) yerine yükseklik: her durakta panel o boya sığar —
 * alt bölüm (footer) yarım durakta da görünür, içerik görünen alanda kayar
 * (iOS sheet duraklarıyla aynı). Bedeli: native driver yok (yerleşim değişir).
 */
function useSheetMotion(open: boolean, snaps: number[], initialSnap: number, onAfterClose?: () => void) {
  const height = useRef(new Animated.Value(0)).current;
  const current = useRef(0);
  const [mounted, setMounted] = useState(open);
  const reduce = useReduceMotion();
  const afterClose = useRef(onAfterClose);
  afterClose.current = onAfterClose;
  // Yalnız gerçekten açılmış bir panel kapanınca (ilk yüklemede değil).
  const wasOpen = useRef(false);

  useEffect(() => {
    const id = height.addListener(({ value }) => (current.current = value));
    return () => height.removeListener(id);
  }, [height]);

  const animateTo = (to: number, done?: () => void, velocity = 0) => {
    if (reduce.current) {
      height.setValue(to);
      done?.();
      return;
    }
    const anim = velocity
      ? Animated.spring(height, { toValue: to, velocity: -velocity, damping: 26, stiffness: 260, overshootClamping: true, useNativeDriver: false })
      : Animated.timing(height, { toValue: to, duration: OPEN_MS, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    anim.start(({ finished }) => finished && done?.());
  };

  const unmount = () => {
    setMounted(false);
    if (wasOpen.current) afterClose.current?.();
    wasOpen.current = false;
  };

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      setMounted(true);
      return;
    }
    if (current.current > 0) animateTo(0, unmount);
    else unmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Duraklar belli olunca (açılış ya da içerik ölçüldü): başlangıç durağına büyü.
  const ready = snaps.length > 0;
  useEffect(() => {
    if (!open || !ready) return;
    height.setValue(0);
    animateTo(snaps[Math.min(initialSnap, snaps.length - 1)] ?? 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ready]);

  return { height, current, mounted, animateTo };
}

type Motion = ReturnType<typeof useSheetMotion>;

/**
 * İçerik kadar yükseklik: başlık + içeriğin TAM yüksekliği + alt bölüm.
 * Panel kutusunu ölçmek yanlış — kayan alan içerik kadar uzamaz, daralır.
 * İçerik `onContentSizeChange` ile kaydırma alanından bağımsız ölçülür.
 */
function useContentHeight(hasFooter: boolean) {
  const [header, setHeader] = useState<number>();
  const [content, setContent] = useState<number>();
  const [footer, setFooter] = useState<number>();
  const known = header !== undefined && content !== undefined && (!hasFooter || footer !== undefined);
  const footerHeight = hasFooter ? (footer ?? 0) : 0;
  const total = known ? Math.ceil((header ?? 0) + (content ?? 0) + footerHeight) : undefined;
  const reset = () => {
    setHeader(undefined);
    setContent(undefined);
    setFooter(undefined);
  };
  return { total, setHeader, setContent, setFooter, reset };
}

/** Duraklar (pt): `snapPoints` ya da ölçülen içerik yüksekliği. */
function useSnaps(snapPoints: SnapPoint[] | undefined, screenHeight: number, measured: number | undefined) {
  const fixed = snapPoints !== undefined && snapPoints.length > 0;
  const snaps = useMemo(() => {
    if (fixed) return resolveSnapPoints(snapPoints, screenHeight);
    return measured ? [measured] : [];
  }, [fixed, snapPoints, screenHeight, measured]);
  return { fixed, snaps };
}

/** Durağa oturma / kapatma, tutamaçla sonraki durak, karartmanın panel yüksekliğine bağlı opaklığı. */
function useSnapControl(motion: Motion, snaps: number[], onClose: () => void, onSnapChange?: (index: number) => void) {
  const settle = (index: number, velocity = 0) => {
    if (index < 0) return onClose();
    motion.animateTo(snaps[index] ?? 0, undefined, velocity);
    onSnapChange?.(index);
  };
  const nextSnap = () => {
    if (snaps.length < 2) return;
    const index = snaps.findIndex((s) => s > motion.current.current + 1);
    settle(index === -1 ? 0 : index);
  };
  const scrimOpacity = motion.height.interpolate({ inputRange: [0, snaps[0] ?? 1], outputRange: [0, 1], extrapolate: "clamp" });
  return { settle, nextSnap, scrimOpacity };
}

/** Tutamaç + başlıktan sürükleme; bırakınca durağa oturur ya da kapanır. */
function useSheetPan(motion: Motion, snaps: number[], closable: boolean, settle: (index: number, velocity?: number) => void) {
  const { height, current } = motion;
  return useMemo(() => {
    let start = 0;
    const top = snaps[snaps.length - 1] ?? 0;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderGrant: () => {
        height.stopAnimation();
        start = current.current;
      },
      // Yukarı çekiş yüksekliği artırır; en üst durağın üstünde direnç (yarım hız).
      onPanResponderMove: (_, g) => {
        const next = Math.max(0, start - g.dy);
        height.setValue(next > top ? top + (next - top) / 2 : next);
      },
      onPanResponderRelease: (_, g) => settle(releaseTarget(current.current, g.vy, snaps, closable), g.vy),
      onPanResponderTerminate: () => settle(0),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snaps, closable]);
}

function SheetHeader({ title, skeleton, multiSnap, onHandlePress }: { title: React.ReactNode; skeleton: boolean; multiSnap: boolean; onHandlePress: () => void }) {
  const theme = useTheme();
  const t = useNativeConfig().typography.h5;
  const titleStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: t.fontSize, lineHeight: t.lineHeight, fontWeight: "600" as const, color: theme.color.canvas.foreground, textAlign: "center" as const };
  let titleNode: React.ReactNode = null;
  if (title != null) {
    titleNode = skeleton ? (
      <SkeletonBox style={{ alignSelf: "center", borderRadius: 4 }}><Text style={titleStyle}>{title}</Text></SkeletonBox>
    ) : (
      <Text accessibilityRole="header" style={titleStyle}>{title}</Text>
    );
  }
  return (
    <>
      {/* iOS sheet tutamacı: dokununca bir sonraki durak. */}
      <Pressable onPress={onHandlePress} accessible={multiSnap} accessibilityRole={multiSnap ? "button" : undefined} accessibilityLabel={multiSnap ? "Panel boyutunu değiştir" : undefined} style={{ height: HANDLE_AREA, alignItems: "center", justifyContent: "center" }}>
        <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: theme.color.canvas.border }} />
      </Pressable>
      {titleNode ? <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>{titleNode}</View> : null}
    </>
  );
}

/**
 * İçerik görünen alanda kayar. Panelin yüksekliği belliyken (ölçüldükten
 * sonra) `flex: 1`; ilk ölçümde içerik kadar (`flexShrink`, esneme değil —
 * Card dersi). İskelette görünmez yer tutar.
 */
function SheetBody({ children, sized, skeleton, bottom, style, onContentHeight }: { children: React.ReactNode; sized: boolean; skeleton: boolean; bottom: number; style?: StyleProp<ViewStyle>; onContentHeight: (h: number) => void }) {
  return (
    <ScrollView style={sized ? { flex: 1 } : { flexShrink: 1 }} contentContainerStyle={[{ paddingHorizontal: 20, paddingBottom: bottom }, style]} onContentSizeChange={(_, h) => onContentHeight(h)} keyboardShouldPersistTaps="handled">
      <View aria-hidden={skeleton} accessibilityElementsHidden={skeleton} style={{ opacity: skeleton ? 0 : 1 }}>{children}</View>
      {skeleton ? <SkeletonBox style={{ position: "absolute", top: 0, left: 20, right: 20, bottom, borderRadius: 8 }} /> : null}
    </ScrollView>
  );
}

/** Sabit alt bölüm (her durakta görünür). */
function SheetFooter({ inset, children, onHeight }: { inset: number; children: React.ReactNode; onHeight: (h: number) => void }) {
  const theme = useTheme();
  if (children == null) return null;
  return <View onLayout={(e) => onHeight(e.nativeEvent.layout.height)} style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: inset, borderTopWidth: 1, borderColor: theme.color.canvas.border }}>{children}</View>;
}

/** Prop'lardan türeyen kapatma işleyicileri, erişilebilir ad ve alt pay. */
function sheetHandlers(props: BottomSheetProps) {
  return {
    onRequestClose: props.keyboard === false ? noop : props.onClose,
    onMaskPress: props.maskClosable === false ? undefined : props.onClose,
    label: typeof props.title === "string" ? props.title : props.accessibilityLabel,
    inset: props.bottomInset ?? DEFAULT_INSET,
  };
}

/** Pencere yüzeyi: üst köşeler yuvarlak. Ölçümden önce içerik kadar ve görünmez (en fazla %90); sonra canlı yükseklik. */
function sheetStyle(theme: ReturnType<typeof useTheme>, ready: boolean, height: Animated.Value, screenHeight: number): StyleProp<ViewStyle> {
  const radius = toPx(theme.radius.xl);
  return [
    overlaySurface(theme),
    { borderTopLeftRadius: radius, borderTopRightRadius: radius, borderBottomWidth: 0, overflow: "hidden" },
    ready ? { height: height as unknown as number } : { maxHeight: screenHeight * 0.9, opacity: 0 },
  ];
}

export function BottomSheet(props: BottomSheetProps) {
  const { open, onClose, title, children, footer, snapPoints, initialSnap = 0, onSnapChange, closable = true, contentStyle, skeleton = false } = props;
  const h = sheetHandlers(props);
  const theme = useTheme();
  const window = useWindowDimensions();
  const parts = useContentHeight(Boolean(footer));
  const measured = parts.total === undefined ? undefined : Math.min(parts.total, window.height * 0.9);
  const { fixed, snaps } = useSnaps(snapPoints, window.height, measured);
  const ready = snaps.length > 0;
  const motion = useSheetMotion(open, snaps, initialSnap, props.onAfterClose);
  const { settle, nextSnap, scrimOpacity } = useSnapControl(motion, snaps, onClose, onSnapChange);
  const pan = useSheetPan(motion, snaps, closable, settle);

  // Kapanınca bir sonraki açılışta içerik yeniden ölçülsün (içerik değişmiş olabilir).
  useEffect(() => {
    if (!motion.mounted && !fixed) parts.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [motion.mounted, fixed]);

  return (
    <RNModal transparent visible={motion.mounted} animationType="none" statusBarTranslucent onRequestClose={h.onRequestClose}>
      <Animated.View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: scrimColor(theme), opacity: scrimOpacity }}>
        <Pressable accessible={false} style={{ flex: 1 }} onPress={h.onMaskPress} />
      </Animated.View>
      <KeyboardAvoidingView behavior={KEYBOARD_BEHAVIOR} pointerEvents="box-none" style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          accessibilityViewIsModal
          aria-modal
          accessibilityLabel={h.label}
          onAccessibilityEscape={onClose}
          style={sheetStyle(theme, ready, motion.height, window.height)}
        >
          {/* Sürükleme yalnız tutamaç + başlıktan: içerikteki kaydırma bozulmasın. */}
          <View {...pan.panHandlers} onLayout={(e) => parts.setHeader(e.nativeEvent.layout.height)}>
            <SheetHeader title={title} skeleton={skeleton} multiSnap={snaps.length > 1} onHandlePress={nextSnap} />
          </View>
          <SheetBody sized={ready} skeleton={skeleton} bottom={footer ? 12 : h.inset} style={contentStyle} onContentHeight={parts.setContent}>{children}</SheetBody>
          <SheetFooter inset={h.inset} onHeight={parts.setFooter}>{footer}</SheetFooter>
        </Animated.View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
