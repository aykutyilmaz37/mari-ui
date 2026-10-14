import type { ReactNode } from "react";
import { Pressable, Text, type TextStyle } from "react-native";
import { EyeIcon, EyeOffIcon, XIcon } from "../lib/icons";

/**
 * Web `_components/FieldAdornments` karşılığı — Input'un temizle düğmesi,
 * şifre göster/gizle düğmesi ve karakter sayacı. Ölçüler alanın ikon
 * boyutuna göre (native ölçek; web'de md: temizle 20px kutu + 14px X,
 * göz 24px kutu + 16px ikon). Native: temizle kutu = ikon + 4, X = ikon − 2; göz kutu = ikon + 8.
 */

export function ClearButton({ visible, label, icon, size, color, onClear }: Readonly<{ visible: boolean; label: string; icon?: ReactNode; size: number; color: string; onClear: () => void }>) {
  return (
    // Boşken görünmez ama yer kaplar — yazınca metin kaymaz (web `invisible`).
    <Pressable
      onPress={onClear}
      disabled={!visible}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityElementsHidden={!visible} aria-hidden={!visible}
      importantForAccessibility={visible ? "auto" : "no-hide-descendants"}
      hitSlop={12}
      style={{ width: size + 4, height: size + 4, alignItems: "center", justifyContent: "center", borderRadius: 4, opacity: visible ? 1 : 0 }}
    >
      {icon ?? <XIcon size={size - 2} color={color} />}
    </Pressable>
  );
}

export function PasswordToggle({ visible, disabled, size, color, onToggle, iconRender }: Readonly<{ visible: boolean; disabled: boolean; size: number; color: string; onToggle: () => void; iconRender?: (visible: boolean) => ReactNode }>) {
  let icon: ReactNode = visible ? <EyeIcon size={size} color={color} /> : <EyeOffIcon size={size} color={color} />;
  if (iconRender) icon = iconRender(visible);
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={visible ? "Şifreyi gizle" : "Şifreyi göster"}
      accessibilityState={{ disabled }}
      hitSlop={10}
      style={{ width: size + 8, height: size + 8, alignItems: "center", justifyContent: "center", borderRadius: 4 }}
    >
      {icon}
    </Pressable>
  );
}

export function CountText({ value, maxLength, formatter, style }: Readonly<{ value: string; maxLength?: number; formatter?: (info: { value: string; count: number; maxLength?: number }) => ReactNode; style: TextStyle }>) {
  let content: ReactNode = maxLength ? `${value.length} / ${maxLength}` : String(value.length);
  if (formatter) content = formatter({ value, count: value.length, maxLength });
  return <Text style={style}>{content}</Text>;
}
