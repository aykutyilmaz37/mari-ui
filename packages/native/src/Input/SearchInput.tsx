import { ActivityIndicator, Pressable } from "react-native";
import { useControllableState } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { useTheme } from "../theme/useTheme";
import { SearchIcon } from "../lib/icons";
import { Input } from "./Input";
import type { InputProps } from "./types";

export type SearchInputProps = InputProps & {
  /** Klavyedeki "Ara" tuşu VE ara düğmesi, alanın o anki değeriyle çağırır. */
  onSearch?: (value: string) => void;
  /** Arama sürüyor — ara ikonu yerine dönen gösterge; alan yazılabilir kalır. */
  loading?: boolean;
  /** Ara düğmesinin erişilebilir adı. Varsayılan: `"Ara"`. */
  searchLabel?: string;
};

const MIN_TOUCH = 44;

/** Ara düğmesi — Input ikon yuvası `size`/`color` verir; dokunma alanı 44pt. */
function SearchButton({ label, loading, disabled, onPress, size = 16, color }: Readonly<{ label: string; loading: boolean; disabled?: boolean; onPress: () => void; size?: number; color?: string }>) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={(MIN_TOUCH - size) / 2}
      accessibilityRole="button"
      accessibilityLabel={label}
      aria-busy={loading || undefined}
      style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
    >
      {loading ? <ActivityIndicator size="small" color={color} style={{ width: size, height: size }} /> : <SearchIcon size={size} color={color} />}
    </Pressable>
  );
}

/** Web `SearchInput`: Input + sonda ara düğmesi; klavye dönüş tuşu "Ara". */
export function SearchInput({ icon, iconPosition = "end", onSearch, onPressEnter, loading = false, searchLabel = "Ara", value, defaultValue = "", onChangeText, size = "md", ...rest }: SearchInputProps) {
  const theme = useTheme();
  const iconSize = useNativeConfig().sizes[size].iconSize;
  const [current, setCurrent] = useControllableState({ value, defaultValue, onChange: onChangeText });

  const button = <SearchButton label={searchLabel} loading={loading} disabled={rest.disabled} onPress={() => onSearch?.(current)} size={iconSize} color={theme.color.canvas.muted} />;

  return (
    <Input
      {...rest}
      size={size}
      type="search"
      value={current}
      onChangeText={setCurrent}
      icon={icon ?? button}
      iconPosition={iconPosition}
      returnKeyType="search"
      onPressEnter={(text) => {
        onSearch?.(text);
        onPressEnter?.(text);
      }}
    />
  );
}
