import type { ReactNode } from "react";
import { Pressable, Text, type TextStyle } from "react-native";
import { EyeIcon, EyeOffIcon, XIcon } from "../lib/icons";

/**
 * Web `_components/FieldAdornments` karşılığı — Input'un temizle düğmesi,
 * şifre göster/gizle düğmesi ve karakter sayacı. Ölçüler web ile aynı:
 * temizle 20px kutu + 14px X, göz 24px kutu + 16px ikon.
 */

export function ClearButton({ visible, label, icon, color, onClear }: { visible: boolean; label: string; icon?: ReactNode; color: string; onClear: () => void }) {
  return (
    // Boşken görünmez ama yer kaplar — yazınca metin kaymaz (web `invisible`).
    <Pressable
      onPress={onClear}
      disabled={!visible}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      hitSlop={12}
      style={{ width: 20, height: 20, alignItems: "center", justifyContent: "center", borderRadius: 4, opacity: visible ? 1 : 0 }}
    >
      {icon ?? <XIcon size={14} color={color} />}
    </Pressable>
  );
}

export function PasswordToggle({ visible, disabled, color, onToggle, iconRender }: { visible: boolean; disabled: boolean; color: string; onToggle: () => void; iconRender?: (visible: boolean) => ReactNode }) {
  let icon: ReactNode = visible ? <EyeIcon color={color} /> : <EyeOffIcon color={color} />;
  if (iconRender) icon = iconRender(visible);
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Şifreyi gizle" : "Şifreyi göster"}
      accessibilityState={{ selected: visible, disabled }}
      hitSlop={10}
      style={{ width: 24, height: 24, alignItems: "center", justifyContent: "center", borderRadius: 4 }}
    >
      {icon}
    </Pressable>
  );
}

export function CountText({ value, maxLength, formatter, style }: { value: string; maxLength?: number; formatter?: (info: { value: string; count: number; maxLength?: number }) => ReactNode; style: TextStyle }) {
  let content: ReactNode = maxLength ? `${value.length} / ${maxLength}` : String(value.length);
  if (formatter) content = formatter({ value, count: value.length, maxLength });
  return <Text style={style}>{content}</Text>;
}
