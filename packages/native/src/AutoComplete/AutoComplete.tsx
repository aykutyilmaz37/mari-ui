import React, { useState } from "react";
import { Pressable, Text, View, type StyleProp, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useStyles } from "../styles/useStyles";
import { BottomSheet, type SnapPoint } from "../BottomSheet";
import { Input } from "../Input";
import type { InputShape, InputVariant } from "../Input/types";
import { SearchIcon, XIcon } from "../lib/icons";
import { SkeletonBox } from "../lib/Skeleton";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import { foldForSearch, getFilteredOption, splitMatch, type AutoCompleteOption } from "./autoCompleteUtils";

export type { AutoCompleteOption };

export interface AutoCompleteProps {
  options: AutoCompleteOption[];
  /** Alanın değeri (seçilen öneri ya da kabul edilen serbest metin). */
  value?: string;
  defaultValue?: string;
  /** Paneldeki arama metni her değiştiğinde (sunucu tarafı öneri için). */
  onSearch?: (query: string) => void;
  /** Değer kesinleşince: öneri seçildi (`option` dolu) ya da serbest metin kabul edildi (`option` yok). */
  onSelect?: (value: string, option?: AutoCompleteOption) => void;
  placeholder?: string;
  /** Listede olmayan metin de değer olabilir ("…" kullan satırı, klavyede "bitti"). Varsayılan: `true`. */
  allowFreeText?: boolean;
  /** Serbest metin satırının etiketi. Varsayılan: `(t) => "“t” kullan"`. */
  freeTextLabel?: (text: string) => string;
  /** Hiçbir öneri eşleşmezken (serbest metin satırının altında). */
  notFoundContent?: React.ReactNode;
  /** Panelde en fazla bu kadar öneri. Varsayılan: `50`. */
  maxResults?: number;
  /** Alanın başında ikon (ör. konum). */
  icon?: React.ReactNode;
  allowClear?: boolean;
  /** Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  /** Panel başlığı. Varsayılan: Field etiketi, yoksa `placeholder`. */
  title?: React.ReactNode;
  /** Alan Input ölçeğinde (md 44). */
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu ya da vurgu rengi — Input'la aynı kural. */
  color?: ColorRole;
  disabled?: boolean;
  skeleton?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

/** Arama alanı yazarken panel zıplamasın: sabit uzun durak (Select ile aynı); sabit dizi. */
const SNAPS: SnapPoint[] = ["85%"];
const defaultFreeTextLabel = (t: string) => `“${t}” kullan`;

interface RowProps {
  label: string;
  query: string;
  highlight: string;
  onPress: () => void;
  emphasized?: boolean;
}

/** Panel satırı: eşleşen kısım kalın ve rol renginde. */
function SuggestionRow({ label, query, highlight, onPress, emphasized = false }: RowProps) {
  const theme = useTheme();
  const s = useNativeConfig().select;
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const parts = emphasized ? null : splitMatch(label, query);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: s.optionMinHeight, justifyContent: "center", paddingVertical: 8, paddingHorizontal: 12, marginHorizontal: -12, borderRadius: 10, backgroundColor: pressed ? c.surfaceAlt : "transparent" })}
    >
      <Text numberOfLines={2} style={{ fontFamily: font, fontSize: s.fontSize, lineHeight: s.lineHeight, color: emphasized ? highlight : c.foreground, fontWeight: emphasized ? "600" : "400" }}>
        {parts ? (
          <>
            {parts[0]}
            <Text style={{ fontWeight: "700", color: highlight }}>{parts[1]}</Text>
            {parts[2]}
          </>
        ) : (
          label
        )}
      </Text>
    </Pressable>
  );
}

interface PanelProps {
  options: AutoCompleteOption[];
  query: string;
  maxResults: number;
  allowFreeText: boolean;
  freeTextLabel: (t: string) => string;
  notFoundContent: React.ReactNode;
  highlight: string;
  onPick: (value: string, option?: AutoCompleteOption) => void;
}

/** Öneriler: (listede birebir yoksa) serbest metin satırı, eşleşenler, hiç yoksa boş içerik. */
function SuggestionList({ options, query, maxResults, allowFreeText, freeTextLabel, notFoundContent, highlight, onPick }: PanelProps) {
  const theme = useTheme();
  const font = nativeFontFamily(theme.fontFamily.sans);
  const trimmed = query.trim();
  const hits = trimmed ? getFilteredOption(options, query).slice(0, maxResults) : options.slice(0, maxResults);
  const exact = hits.some((o) => foldForSearch(o.value) === foldForSearch(trimmed));
  return (
    <View accessibilityLiveRegion="polite">
      {allowFreeText && trimmed && !exact ? <SuggestionRow label={freeTextLabel(trimmed)} query="" highlight={highlight} emphasized onPress={() => onPick(trimmed)} /> : null}
      {hits.map((o) => (
        <SuggestionRow key={o.id} label={o.value} query={query} highlight={highlight} onPress={() => onPick(o.value, o)} />
      ))}
      {hits.length === 0 && notFoundContent != null ? <Text style={{ fontFamily: font, fontSize: 15, color: theme.color.canvas.muted, paddingVertical: 16 }}>{notFoundContent}</Text> : null}
    </View>
  );
}

/**
 * Yazarken öneri sunan alan. Mobilde öneriler alanın altında değil, dokununca
 * açılan BottomSheet'te (kullanıcı kararı): üstte kendiliğinden odaklanan arama
 * alanı, altında vurgulu öneriler — klavye hiçbirini örtmez. Listede yoksa
 * serbest metin kabul edilir. Türkçe / aksansız arama (`autoCompleteUtils`).
 */
export function AutoComplete(props: AutoCompleteProps) {
  const { options, value, defaultValue = "", onSearch, onSelect, placeholder = "Ara", allowFreeText = true, freeTextLabel = defaultFreeTextLabel, notFoundContent, maxResults = 50, icon, allowClear = false, clearLabel = "Temizle", title, size = "md", variant = "outline", shape = "default", color, open: openProp, onOpenChange, style } = props;
  const field = useFieldControl({ disabled: props.disabled, skeleton: props.skeleton, accessibilityLabel: props.accessibilityLabel, accessibilityHint: props.accessibilityHint });
  const theme = useTheme();
  const [current, setCurrent] = useControllable<string>(value, defaultValue);
  const [open, setOpenState] = useControllable<boolean>(openProp, false);
  const [query, setQuery] = useState("");
  const styles = useStyles("input", { color: field.status ?? color, variant, size, shape, disabled: field.disabled, focused: open });

  if (field.skeleton) return <SkeletonBox style={[styles.container, style]} />;

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
    // Panel açılırken arama alanı mevcut değerle başlar.
    if (next) setQuery(current);
  };
  const commit = (next: string, option?: AutoCompleteOption) => {
    setCurrent(next);
    onSelect?.(next, option);
    setOpen(false);
  };
  const changeQuery = (t: string) => {
    setQuery(t);
    onSearch?.(t);
  };

  const hasValue = current.length > 0;
  const sheetTitle = title ?? field.accessibilityLabel?.replace(/, zorunlu$/, "") ?? placeholder;
  const highlight = theme.color[color ?? "primary"].text;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={field.accessibilityLabel ?? placeholder}
        accessibilityHint={field.accessibilityHint ?? "Arama panelini açar"}
        accessibilityValue={hasValue ? { text: current } : undefined}
        accessibilityState={{ expanded: open, disabled: field.disabled }}
        aria-expanded={open}
        disabled={field.disabled}
        onPress={() => setOpen(true)}
        hitSlop={styles.hitSlop}
        style={[styles.container, style]}
      >
        {icon == null ? null : <View>{icon}</View>}
        <Text numberOfLines={1} style={[styles.input, hasValue ? null : { color: styles.mutedColor }]}>{hasValue ? current : placeholder}</Text>
        {allowClear && hasValue && !field.disabled ? (
          <Pressable accessibilityRole="button" accessibilityLabel={clearLabel} hitSlop={12} onPress={() => commit("")}>
            <XIcon size={styles.iconSize - 2} color={styles.mutedColor} />
          </Pressable>
        ) : null}
      </Pressable>
      <BottomSheet open={open} onClose={() => setOpen(false)} title={sheetTitle} snapPoints={SNAPS}>
        <View style={{ paddingBottom: 8 }}>
          <Input
            value={query}
            onChangeText={changeQuery}
            placeholder={placeholder}
            icon={<SearchIcon size={styles.iconSize} color={styles.mutedColor} />}
            allowClear
            autoFocus
            autoComplete="off"
            returnKeyType="done"
            // Klavyede "bitti": yazılan değer olur (serbest metin açıksa).
            onSubmitEditing={() => (allowFreeText && query.trim() ? commit(query.trim()) : setOpen(false))}
            accessibilityLabel={`${typeof sheetTitle === "string" ? sheetTitle : "Öneriler"} içinde ara`}
          />
        </View>
        <SuggestionList options={options} query={query} maxResults={maxResults} allowFreeText={allowFreeText} freeTextLabel={freeTextLabel} notFoundContent={notFoundContent} highlight={highlight} onPick={commit} />
      </BottomSheet>
    </>
  );
}
