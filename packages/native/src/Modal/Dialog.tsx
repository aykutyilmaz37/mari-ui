import React, { useState } from "react";
import { ActivityIndicator, Modal as RNModal, Pressable, StyleSheet, Text, View } from "react-native";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { toPx } from "../theme/toPx";
import { overlaySurface, scrimColor } from "../lib/overlay";

export interface DialogAction {
  label: string;
  /** Promise dönerse çözülene kadar düğmede gösterge, sonra pencere kapanır. */
  onPress?: () => void | Promise<unknown>;
  /** `cancel`: kalın (iOS), Android geri tuşu bunu çağırır. `destructive`: hata renginde. */
  style?: "default" | "cancel" | "destructive";
}

export interface DialogProps {
  open: boolean;
  /** Bir eyleme basıldıktan (ve Promise çözüldükten) sonra çağrılır. */
  onClose: () => void;
  title: string;
  message?: string;
  /** 1–3 eylem. İki eylem yan yana, bir ya da üç alt alta. Varsayılan: tek "Tamam". */
  actions?: DialogAction[];
}

/** Eylemler arası saç teli çizgi: yan yanaysa solda, alt altaysa üstte. */
function separator(index: number, horizontal: boolean) {
  if (index === 0) return null;
  return horizontal ? { borderLeftWidth: StyleSheet.hairlineWidth } : { borderTopWidth: StyleSheet.hairlineWidth };
}

const WIDTH = 270; // iOS UIAlertController
const ROW = 44;

/**
 * Kısa onay penceresi — iOS uyarısının ölçüleri (270pt, ortalanmış metin,
 * eylemler çizgilerle ayrılmış), kendi temamızla. Karartmaya dokununca
 * KAPANMAZ (karar bekler); Android geri tuşu `cancel` eylemini çağırır.
 * Uzun içerik ya da form için `Modal`.
 */
export function Dialog({ open, onClose, title, message, actions = [{ label: "Tamam" }] }: DialogProps) {
  const theme = useTheme();
  const t = useNativeConfig().typography;
  const [pending, setPending] = useState<number | null>(null);
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const horizontal = actions.length === 2;
  const cancelIndex = actions.findIndex((a) => a.style === "cancel");

  const run = async (index: number) => {
    const result = actions[index]?.onPress?.();
    if (result instanceof Promise) {
      setPending(index);
      try {
        await result;
      } finally {
        setPending(null);
      }
    }
    onClose();
  };

  return (
    <RNModal transparent visible={open} animationType="fade" statusBarTranslucent onRequestClose={() => (cancelIndex >= 0 ? run(cancelIndex) : undefined)}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16, backgroundColor: scrimColor(theme) }}>
        <View accessibilityViewIsModal aria-modal accessibilityRole="alert" accessibilityLabel={title} style={[overlaySurface(theme), { width: WIDTH, maxWidth: "100%", borderRadius: toPx(theme.radius.xl), overflow: "hidden" }]}>
          <View style={{ paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16, gap: 4 }}>
            <Text style={{ fontFamily: font, fontSize: t.h5.fontSize, lineHeight: t.h5.lineHeight, fontWeight: "600", textAlign: "center", color: c.foreground }}>{title}</Text>
            {message ? <Text style={{ fontFamily: font, fontSize: 13, lineHeight: 18, textAlign: "center", color: c.muted }}>{message}</Text> : null}
          </View>
          <View style={{ flexDirection: horizontal ? "row" : "column", borderTopWidth: StyleSheet.hairlineWidth, borderColor: c.border }}>
            {actions.map((action, index) => {
              const destructive = action.style === "destructive";
              const color = destructive ? theme.color.error.text : theme.color.primary.text;
              return (
                <Pressable
                  key={action.label}
                  accessibilityRole="button"
                  disabled={pending !== null}
                  onPress={() => run(index)}
                  style={({ pressed }) => ({
                    flex: horizontal ? 1 : undefined,
                    minHeight: ROW,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 12,
                    backgroundColor: pressed ? c.surfaceAlt : "transparent",
                    ...separator(index, horizontal),
                    borderColor: c.border,
                  })}
                >
                  {pending === index ? (
                    <ActivityIndicator size="small" color={color} />
                  ) : (
                    <Text style={{ fontFamily: font, fontSize: t.body.fontSize, fontWeight: action.style === "cancel" ? "600" : "400", color }}>{action.label}</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </RNModal>
  );
}
