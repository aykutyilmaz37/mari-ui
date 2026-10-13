import React, { cloneElement, isValidElement, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { BottomSheet } from "./BottomSheet";

export interface ActionSheetAction {
  label: string;
  onPress?: () => void;
  /** Satırın solunda (renk/boyut verilmemişse satır rengine uyar). */
  icon?: React.ReactNode;
  /** Geri alınamaz işlem — hata renginde. */
  destructive?: boolean;
  disabled?: boolean;
}

export interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Başlığın altında kısa açıklama. */
  message?: string;
  actions: ActionSheetAction[];
  /** En altta ayrı, kalın. Varsayılan: "Vazgeç". `null` → yok. */
  cancelLabel?: string | null;
  /**
   * Panel tamamen kapandıktan sonra (seçilen eylemin `onPress`inden SONRA).
   * Vazgeçmeyi eylemden ayırmak için: eylem çalışmadıysa kullanıcı vazgeçmiştir.
   */
  onAfterClose?: () => void;
}

const ROW = 56;

function ActionRow({ action, onSelect }: { action: ActionSheetAction; onSelect: () => void }) {
  const theme = useTheme();
  const body = useNativeConfig().typography.body;
  let color = theme.color.canvas.foreground;
  if (action.destructive) color = theme.color.error.text;
  if (action.disabled) color = theme.color.canvas.disabled;
  const icon = isValidElement<{ size?: number; color?: string }>(action.icon) ? cloneElement(action.icon, { size: action.icon.props.size ?? 22, color: action.icon.props.color ?? color }) : action.icon;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: action.disabled }}
      aria-disabled={action.disabled || undefined}
      disabled={action.disabled}
      onPress={onSelect}
      style={({ pressed }) => ({ minHeight: ROW, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 4, borderRadius: 12, backgroundColor: pressed ? theme.color.canvas.surfaceAlt : "transparent" })}
    >
      {icon}
      <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: body.fontSize, lineHeight: body.lineHeight, color }}>{action.label}</Text>
    </Pressable>
  );
}

/**
 * Bir öğe için eylem listesi (Paylaş / Düzenle / Sil). BottomSheet üzerinde,
 * iki platformda aynı görünüm; sürükleyerek ya da karartmaya dokunarak kapanır.
 * Bir eyleme basılınca panel kapanır, kapanış bitince eylem çalışır.
 */
export function ActionSheet({ open, onClose, title, message, actions, cancelLabel = "Vazgeç", onAfterClose }: ActionSheetProps) {
  const theme = useTheme();
  const t = useNativeConfig().typography;
  const font = nativeFontFamily(theme.fontFamily.sans);
  // Eylem panel tamamen kapandıktan sonra çalışır: "Sil" bir onay Dialog'u açarsa
  // iOS, kapanmakta olan Modal varken yenisini göstermez.
  const pending = useRef<ActionSheetAction | null>(null);
  const select = (action: ActionSheetAction) => {
    pending.current = action;
    onClose();
  };
  const runPending = () => {
    const action = pending.current;
    pending.current = null;
    action?.onPress?.();
    onAfterClose?.();
  };
  return (
    <BottomSheet open={open} onClose={onClose} onAfterClose={runPending} accessibilityLabel={title ?? "Eylemler"}>
      {title || message ? (
        <View style={{ paddingBottom: 8, gap: 2 }}>
          {title ? <Text accessibilityRole="header" style={{ fontFamily: font, fontSize: t.h6.fontSize, lineHeight: t.h6.lineHeight, fontWeight: "600", color: theme.color.canvas.foreground }}>{title}</Text> : null}
          {message ? <Text style={{ fontFamily: font, fontSize: 13, lineHeight: 18, color: theme.color.canvas.muted }}>{message}</Text> : null}
        </View>
      ) : null}
      {actions.map((action) => <ActionRow key={action.label} action={action} onSelect={() => select(action)} />)}
      {cancelLabel ? (
        <View style={{ marginTop: 8, borderTopWidth: 1, borderColor: theme.color.canvas.border, paddingTop: 8 }}>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => ({ minHeight: ROW, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: pressed ? theme.color.canvas.surfaceAlt : "transparent" })}
          >
            <Text style={{ fontFamily: font, fontSize: t.body.fontSize, fontWeight: "600", color: theme.color.primary.text }}>{cancelLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </BottomSheet>
  );
}
