import React, { useState } from "react";
import { KeyboardAvoidingView, Modal as RNModal, Platform, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { Button } from "../Button";
import { XIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { overlaySurface, scrimColor } from "../lib/overlay";

export type ModalButtonPosition = "left" | "right";

export interface ModalProps extends SkeletonableProps {
  open: boolean;
  /** Kapatma isteği: × düğmesi, karartmaya dokunma, Android geri tuşu. */
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Başlığın solunda, rol renginde yumuşak daire içinde. */
  icon?: React.ReactNode;
  /** Onay düğmesinin ve ikon dairesinin rengi. error/warning → yıkıcı onay. */
  color?: ColorRole;
  children?: React.ReactNode;
  /** Varsayılan: `true`. */
  showCloseButton?: boolean;
  closeButtonPosition?: ModalButtonPosition;
  /** Özel alt bölüm; verilirse varsayılan düğmeler çizilmez. `null` → alt bölüm yok. */
  footer?: React.ReactNode;
  /** Onay düğmesi sağda (varsayılan) ya da solda. */
  footerButtonPosition?: ModalButtonPosition;
  confirmButtonText?: string;
  /** Varsayılan: "Vazgeç". */
  cancelButtonText?: string;
  /** Promise dönerse çözülene kadar onay düğmesi "yükleniyor". */
  onConfirm?: () => void | Promise<unknown>;
  /** Varsayılan: `onClose`. */
  onCancel?: () => void;
  confirmLoading?: boolean;
  confirmDisabled?: boolean;
  /** Genişlik sm 320 · md 400 · lg 520 (ekranı aşmaz). Varsayılan: `md`. */
  size?: Size;
  /** pt; `size`'ı ezer. */
  width?: number;
  /** Karartmaya dokununca kapanır. Varsayılan: `true`. */
  maskClosable?: boolean;
  /** Android geri tuşu kapatır (web'de Escape). Varsayılan: `true`. */
  keyboard?: boolean;
  /** Başlık yoksa erişilebilir ad. */
  accessibilityLabel?: string;
  bodyStyle?: StyleProp<ViewStyle>;
}

const WIDTH: Record<Size, number> = { sm: 320, md: 400, lg: 520 };
const GUTTER = 16;
const MIN_TOUCH = 44;

/** `onConfirm` Promise dönerse çözülene kadar "yükleniyor" (web ile aynı). */
function useConfirm(onConfirm: ModalProps["onConfirm"]) {
  const [pending, setPending] = useState(false);
  const handleConfirm = async () => {
    const result = onConfirm?.();
    if (!(result instanceof Promise)) return;
    setPending(true);
    try {
      await result;
    } finally {
      setPending(false);
    }
  };
  return { pending, handleConfirm };
}

/** Düz metin → `Text`; iskelette görünmez metnin boyutunda kutu (yüklenince kayma yok). */
function Slot({ node, style, skeleton }: { node: React.ReactNode; style: object; skeleton: boolean }) {
  if (node == null || node === false) return null;
  const content = typeof node === "string" || typeof node === "number" ? <Text style={style}>{node}</Text> : node;
  return skeleton ? <SkeletonBox style={{ borderRadius: 4, alignSelf: "flex-start", maxWidth: "100%" }}>{content}</SkeletonBox> : <>{content}</>;
}

function CloseButton({ onPress, color, left }: { onPress: () => void; color: string; left: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={(MIN_TOUCH - 32) / 2}
      accessibilityRole="button"
      accessibilityLabel="Kapat"
      style={({ pressed }) => ({ position: "absolute", top: 12, [left ? "left" : "right"]: 12, width: 32, height: 32, borderRadius: 8, alignItems: "center", justifyContent: "center", zIndex: 1, opacity: pressed ? 0.6 : 1 })}
    >
      <XIcon size={18} color={color} />
    </Pressable>
  );
}

interface FooterProps {
  position: ModalButtonPosition;
  cancelText: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  color?: ColorRole;
  loading: boolean;
  disabled: boolean;
  skeleton: boolean;
}

/** Telefonda iki eşit genişlikte düğme; onay varsayılan olarak sağda. */
function FooterButtons({ position, cancelText, confirmText, onCancel, onConfirm, color, loading, disabled, skeleton }: FooterProps) {
  const cancel = <Button key="cancel" style={{ flex: 1 }} variant="outline" color="neutral" onPress={onCancel} skeleton={skeleton}>{cancelText}</Button>;
  const confirm = (
    <Button key="confirm" style={{ flex: 1 }} color={color === "neutral" || !color ? "primary" : color} onPress={onConfirm} loading={loading} disabled={disabled} skeleton={skeleton}>
      {confirmText}
    </Button>
  );
  return <View style={{ flexDirection: "row", gap: 12 }}>{position === "right" ? [cancel, confirm] : [confirm, cancel]}</View>;
}

function ModalHeader({ title, description, iconNode, skeleton, closeOn }: { title: React.ReactNode; description: React.ReactNode; iconNode: React.ReactNode; skeleton: boolean; closeOn?: ModalButtonPosition }) {
  const theme = useTheme();
  const t = useNativeConfig().typography;
  const c = theme.color.canvas;
  const titleStyle = { fontFamily: nativeFontFamily(theme.fontFamily.heading ?? theme.fontFamily.sans), fontSize: t.h4.fontSize, lineHeight: t.h4.lineHeight, fontWeight: "600" as const, color: c.foreground };
  const descriptionStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: t.h6.fontSize, lineHeight: t.h6.lineHeight, color: c.muted };
  // × düğmesinin tarafında metin altına girmesin diye pay.
  const side = { paddingLeft: closeOn === "left" ? 52 : 20, paddingRight: closeOn === "right" ? 52 : 20 };
  let icon: React.ReactNode = null;
  if (iconNode) icon = skeleton ? <SkeletonBox style={{ width: 40, height: 40, borderRadius: 20 }} /> : iconNode;
  return (
    <View style={[{ flexDirection: "row", gap: 12, paddingTop: 20 }, side]}>
      {icon}
      <View style={{ flex: 1, gap: 4, paddingTop: iconNode ? 8 : 0 }}>
        <Slot node={title} style={titleStyle} skeleton={skeleton} />
        <Slot node={description} style={descriptionStyle} skeleton={skeleton} />
      </View>
    </View>
  );
}

/** Uzun içerik kendi içinde kayar. İskelette içerik görünmez yer tutar, üstünde blok. */
function ModalBody({ children, skeleton, top, bottom, style }: { children: React.ReactNode; skeleton: boolean; top: number; bottom: number; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  const t = useNativeConfig().typography.body;
  const content = (typeof children === "string" || typeof children === "number") ? <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: t.fontSize, lineHeight: t.lineHeight, color: theme.color.canvas.foreground }}>{children}</Text> : children;
  return (
    <ScrollView keyboardShouldPersistTaps="handled" style={{ flexGrow: 0, flexShrink: 1, minHeight: 0 }} contentContainerStyle={[{ paddingHorizontal: 20, paddingTop: top, paddingBottom: bottom }, style]}>
      <View aria-hidden={skeleton} accessibilityElementsHidden={skeleton} style={{ opacity: skeleton ? 0 : 1 }}>{content}</View>
      {skeleton ? <SkeletonBox style={{ position: "absolute", top, left: 20, right: 20, bottom, borderRadius: 8 }} /> : null}
    </ScrollView>
  );
}

/** Özel `footer` > varsayılan Vazgeç/Onay düğmeleri (onay metni ya da `onConfirm` varsa) > yok. */
function resolveFooter(props: ModalProps, confirm: { pending: boolean; handleConfirm: () => void }): React.ReactNode {
  if (props.footer !== undefined) return props.footer;
  if (!props.confirmButtonText && !props.onConfirm) return null;
  return (
    <FooterButtons
      position={props.footerButtonPosition ?? "right"}
      cancelText={props.cancelButtonText ?? "Vazgeç"}
      confirmText={props.confirmButtonText ?? "Tamam"}
      onCancel={props.onCancel ?? props.onClose}
      onConfirm={confirm.handleConfirm}
      color={props.color}
      loading={props.confirmLoading ?? confirm.pending}
      disabled={props.confirmDisabled ?? false}
      skeleton={props.skeleton ?? false}
    />
  );
}

/** Pencerenin içi: × düğmesi, başlık, kayan gövde, alt bölüm. */
function ModalPanel({ props, footerNode }: { props: ModalProps; footerNode: React.ReactNode }) {
  const { onClose, title, description, icon, color, children, showCloseButton = true, closeButtonPosition = "right", skeleton = false, bodyStyle } = props;
  const theme = useTheme();
  const iconNode = icon ? <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: theme.color[color ?? "primary"].subtle }}>{icon}</View> : null;
  const hasHeader = title != null || description != null || iconNode != null;
  const showClose = showCloseButton && !skeleton;
  const hasBody = children != null;
  return (
    <>
      {showClose ? <CloseButton onPress={onClose} color={theme.color.canvas.muted} left={closeButtonPosition === "left"} /> : null}
      {hasHeader ? <ModalHeader title={title} description={description} iconNode={iconNode} skeleton={skeleton} closeOn={showClose ? closeButtonPosition : undefined} /> : null}
      {hasBody ? <ModalBody skeleton={skeleton} top={hasHeader ? 12 : 20} bottom={footerNode ? 4 : 20} style={bodyStyle}>{children}</ModalBody> : null}
      {footerNode ? <View style={{ padding: 20, paddingTop: 16 }}>{footerNode}</View> : null}
      {!footerNode && !hasBody ? <View style={{ height: 20 }} /> : null}
    </>
  );
}

export function Modal(props: ModalProps) {
  const { open, onClose, title, color, size = "md", width, maskClosable = true, keyboard = true, accessibilityLabel } = props;
  const theme = useTheme();
  const window = useWindowDimensions();
  const confirm = useConfirm(props.onConfirm);
  const isAlert = (color === "error" || color === "warning") && Boolean(props.confirmButtonText);
  const panelWidth = Math.min(width ?? WIDTH[size], window.width - GUTTER * 2);

  return (
    <RNModal transparent visible={open} animationType="fade" statusBarTranslucent onRequestClose={keyboard ? onClose : () => undefined}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: GUTTER }}>
          {/* Karartma kardeş katmandır; içerideki kaydırma hareketlerini yakalamaz. */}
          <Pressable accessible={false} importantForAccessibility="no" onPress={maskClosable ? onClose : undefined} style={[StyleSheet.absoluteFill, { backgroundColor: scrimColor(theme) }]} />
          <View
            accessible={false}
            accessibilityViewIsModal
            aria-modal
            accessibilityLabel={typeof title === "string" ? title : accessibilityLabel}
            accessibilityRole={isAlert ? "alert" : undefined}
            style={[overlaySurface(theme), { width: panelWidth, maxHeight: "85%", flexShrink: 1, borderRadius: toPx(theme.radius.xl), overflow: "hidden" }]}
          >
            <ModalPanel props={props} footerNode={resolveFooter(props, confirm)} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
