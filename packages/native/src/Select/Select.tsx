import React, { useState } from "react";
import { Pressable, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useStyles } from "../styles/useStyles";
import { BottomSheet } from "../BottomSheet";
import { Button } from "../Button";
import { SearchInput } from "../Input";
import type { InputShape, InputVariant } from "../Input/types";
import { Tag } from "../Tag";
import { CheckIcon, ChevronDownIcon, XIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import { buildSections, flattenOptions, toggleValue, type SelectOption, type SelectOptionGroup, type SelectValue } from "./utils";

export type { SelectOption, SelectOptionGroup, SelectValue };

interface SelectBaseProps extends SkeletonableProps {
  options: Array<SelectOption | SelectOptionGroup>;
  placeholder?: string;
  /** Panelin üstünde arama alanı (Türkçe/aksansız). */
  showSearch?: boolean;
  allowClear?: boolean;
  /** Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  /** Seçenekler yükleniyor: panelde spinner, alanda dönen ikon. */
  loading?: boolean;
  /** Varsayılan: `"Sonuç bulunamadı"`. */
  notFoundContent?: React.ReactNode;
  disabled?: boolean;
  /** Alan Input ölçeğinde (md 44). */
  size?: Size;
  variant?: InputVariant;
  shape?: InputShape;
  /** Doğrulama durumu ya da vurgu rengi — Input'la aynı kural. */
  color?: ColorRole;
  /** Panel başlığı. Varsayılan: Field etiketi, yoksa `placeholder`. */
  title?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Aramada yazılan metin (sunucu tarafı arama). */
  onSearch?: (text: string) => void;
  /** Seçenek satırını özelleştir. */
  optionRender?: (option: SelectOption, state: { selected: boolean; active: boolean }) => React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export interface SelectSingleProps extends SelectBaseProps {
  mode?: undefined;
  value?: SelectValue | null;
  defaultValue?: SelectValue | null;
  onChange?: (value: SelectValue | null, option: SelectOption | null) => void;
}

export interface SelectMultipleProps extends SelectBaseProps {
  /** Çoklu: seçilenler etiket olur, panel seçimden sonra açık kalır ("Tamam" ile kapanır). */
  mode: "multiple";
  value?: SelectValue[];
  defaultValue?: SelectValue[];
  onChange?: (value: SelectValue[], options: SelectOption[]) => void;
  /** En fazla bu kadar etiket, kalanı "+N". */
  maxTagCount?: number;
}

export type SelectProps = SelectSingleProps | SelectMultipleProps;

const plain = (node: React.ReactNode) => (typeof node === "string" || typeof node === "number" ? String(node) : undefined);

interface OptionRowProps {
  option: SelectOption;
  selected: boolean;
  multiple: boolean;
  onPress: () => void;
  render?: SelectBaseProps["optionRender"];
}

/** Satırın varsayılan içeriği: ikon, etiket + açıklama, seçiliyse sağda ✓ (iOS liste seçimi). */
function OptionContent({ option, selected }: { option: SelectOption; selected: boolean }) {
  const theme = useTheme();
  const s = useNativeConfig().select;
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  const label = option.label ?? String(option.value);
  const text = plain(label);
  return (
    <>
      {option.icon == null ? null : <View>{option.icon}</View>}
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        {text === undefined ? label : <Text style={{ fontFamily: font, fontSize: s.fontSize, lineHeight: s.lineHeight, color: option.disabled ? c.muted : c.foreground, fontWeight: selected ? "600" : "400" }}>{text}</Text>}
        {option.description == null ? null : <Text style={{ fontFamily: font, fontSize: s.descriptionFontSize, lineHeight: s.descriptionLineHeight, color: c.muted }}>{option.description}</Text>}
      </View>
      <View style={{ width: 22, alignItems: "flex-end" }}>{selected ? <CheckIcon size={20} color={theme.color.primary.solid} strokeWidth={2.5} /> : null}</View>
    </>
  );
}

function OptionRow({ option, selected, multiple, onPress, render }: OptionRowProps) {
  const theme = useTheme();
  const s = useNativeConfig().select;
  const c = theme.color.canvas;
  return (
    <Pressable
      accessibilityRole={multiple ? "checkbox" : "radio"}
      accessibilityLabel={plain(option.label) ?? option.searchText ?? String(option.value)}
      accessibilityState={{ checked: selected, selected, disabled: option.disabled }}
      aria-checked={selected}
      aria-disabled={option.disabled || undefined}
      disabled={option.disabled}
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: s.optionMinHeight, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderRadius: 8, opacity: option.disabled ? 0.5 : 1, backgroundColor: pressed ? c.surfaceAlt : "transparent" })}
    >
      {render ? render(option, { selected, active: false }) : <OptionContent option={option} selected={selected} />}
    </Pressable>
  );
}

const labelOf = (o: SelectOption) => plain(o.label) ?? o.searchText ?? String(o.value);
const notNull = (v: SelectValue | null | undefined): v is SelectValue => v != null;

/** Tekli ve çoklu değer tek dizi olarak tutulur; dışarıya kipine göre verilir. */
function resolveValues(props: SelectProps): { initial: SelectValue[]; controlled: SelectValue[] | undefined } {
  if (props.mode === "multiple") return { initial: props.defaultValue ?? [], controlled: props.value };
  return { initial: [props.defaultValue].filter(notNull), controlled: props.value === undefined ? undefined : [props.value].filter(notNull) };
}

interface DisplayProps {
  selected: SelectOption[];
  multiple: boolean;
  maxTagCount?: number;
  placeholder: string;
  disabled: boolean;
  textStyle: TextStyle;
  mutedColor: string;
  onRemove: (value: SelectValue) => void;
}

/** Alanın içi: yer tutucu, tekli seçimde etiket (+ikon), çokluda kaldırılabilir etiketler ve "+N". */
function SelectDisplay({ selected, multiple, maxTagCount, placeholder, disabled, textStyle, mutedColor, onRemove }: DisplayProps) {
  if (selected.length === 0) return <Text numberOfLines={1} style={[textStyle, { color: mutedColor }]}>{placeholder}</Text>;
  if (!multiple) {
    const o = selected[0]!;
    return (
      <View style={{ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 }}>
        {o.icon == null ? null : <View>{o.icon}</View>}
        <Text numberOfLines={1} style={textStyle}>{labelOf(o)}</Text>
      </View>
    );
  }
  const shown = selected.slice(0, maxTagCount ?? selected.length);
  const rest = selected.length - shown.length;
  return (
    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6, paddingVertical: 6 }}>
      {shown.map((o) => (
        <Tag key={String(o.value)} onClose={disabled ? undefined : () => onRemove(o.value)} closeLabel={`${labelOf(o)} seçimini kaldır`}>
          {labelOf(o)}
        </Tag>
      ))}
      {rest > 0 ? <Tag>{`+${rest}`}</Tag> : null}
    </View>
  );
}

interface ListProps {
  sections: ReturnType<typeof buildSections>;
  loading: boolean;
  notFoundContent: React.ReactNode;
  values: SelectValue[];
  multiple: boolean;
  onChoose: (option: SelectOption) => void;
  render?: SelectBaseProps["optionRender"];
}

/** Paneldeki liste: yükleniyor, boş sonuç ya da (başlıklı) bölümler. */
function OptionList({ sections, loading, notFoundContent, values, multiple, onChoose, render }: ListProps) {
  const theme = useTheme();
  const s = useNativeConfig().select;
  const c = theme.color.canvas;
  const font = nativeFontFamily(theme.fontFamily.sans);
  if (loading) {
    return (
      <View accessibilityRole="progressbar" accessibilityLabel="Yükleniyor" style={{ paddingVertical: 24, alignItems: "center" }}>
        <Spinner size={20} color={c.muted} />
      </View>
    );
  }
  if (sections.length === 0) return <Text style={{ fontFamily: font, fontSize: s.fontSize, color: c.muted, paddingVertical: 24, textAlign: "center" }}>{notFoundContent}</Text>;
  const groupStyle: TextStyle = { fontFamily: font, fontSize: s.groupFontSize, fontWeight: "600", color: c.muted, letterSpacing: 0.5, textTransform: "uppercase", paddingTop: 12, paddingBottom: 4 };
  return (
    <View accessibilityRole={multiple ? undefined : "radiogroup"}>
      {sections.map((section) => (
        <View key={section.key} accessibilityRole={section.label == null ? undefined : "list"} accessibilityLabel={plain(section.label)}>
          {section.label == null ? null : <Text accessibilityRole="header" style={groupStyle}>{section.label}</Text>}
          {section.options.map((o) => (
            <OptionRow key={String(o.value)} option={o} selected={values.includes(o.value)} multiple={multiple} onPress={() => onChoose(o)} render={render} />
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * Seçim alanı: kapalıyken Input'la aynı kutu; dokununca seçenekler
 * BottomSheet'te açılır (kullanıcı kararı). Tekli seçimde dokunulan seçenek
 * seçilir ve panel kapanır; çoklu seçimde panel açık kalır ("Tamam" kapatır).
 */
export function Select(props: SelectProps) {
  const { options, placeholder = "Seçin", showSearch = false, allowClear = false, clearLabel = "Temizle", loading = false, notFoundContent = "Sonuç bulunamadı", size = "md", variant = "outline", shape = "default", color, title, open: openProp, onOpenChange, onSearch, optionRender, style } = props;
  const multiple = props.mode === "multiple";
  const field = useFieldControl({ disabled: props.disabled, skeleton: props.skeleton, accessibilityLabel: props.accessibilityLabel, accessibilityHint: props.accessibilityHint });
  const [open, setOpenState] = useControllable<boolean>(openProp, false);
  const styles = useStyles("input", { color: field.status ?? color, variant, size, shape, disabled: field.disabled, focused: open });
  const [search, setSearch] = useState("");
  const flat = flattenOptions(options);
  const { initial, controlled } = resolveValues(props);
  const [values, setValues] = useControllable<SelectValue[]>(controlled, initial);
  const optionsOf = (vals: SelectValue[]) => vals.map((v) => flat.find((o) => o.value === v)).filter((o): o is SelectOption => Boolean(o));
  const selected = optionsOf(values);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
    if (!next && search) {
      setSearch("");
      onSearch?.("");
    }
  };
  const commit = (next: SelectValue[]) => {
    setValues(next);
    const opts = optionsOf(next);
    if (props.mode === "multiple") props.onChange?.(next, opts);
    else props.onChange?.(next[0] ?? null, opts[0] ?? null);
  };
  const choose = (option: SelectOption) => {
    if (multiple) return commit(toggleValue(values, option.value));
    commit([option.value]);
    setOpen(false);
  };

  // Aynı kutu: yükseklik, köşe, kenarlık; tam genişlik.
  if (field.skeleton) return <SkeletonBox style={[styles.container, style]} />;

  const hasValue = selected.length > 0;
  const sheetTitle = title ?? field.accessibilityLabel?.replace(/, zorunlu$/, "") ?? placeholder;
  // Çoklu seçimde etiketler sarabilir: sabit yükseklik yerine en az yükseklik.
  const grow: ViewStyle | null = multiple && hasValue ? { height: undefined, minHeight: styles.container.height } : null;

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={field.accessibilityLabel ?? placeholder}
        accessibilityHint={field.accessibilityHint}
        accessibilityValue={hasValue ? { text: selected.map(labelOf).join(", ") } : undefined}
        accessibilityState={{ expanded: open, disabled: field.disabled }}
        aria-expanded={open}
        aria-disabled={field.disabled || undefined}
        disabled={field.disabled}
        onPress={() => setOpen(true)}
        hitSlop={styles.hitSlop}
        style={[styles.container, grow, style]}
      >
        <SelectDisplay selected={selected} multiple={multiple} maxTagCount={props.mode === "multiple" ? props.maxTagCount : undefined} placeholder={placeholder} disabled={field.disabled} textStyle={styles.input} mutedColor={styles.mutedColor} onRemove={(v) => commit(values.filter((x) => x !== v))} />
        {allowClear && hasValue && !field.disabled ? (
          <Pressable accessibilityRole="button" accessibilityLabel={clearLabel} hitSlop={12} onPress={() => commit([])}>
            <XIcon size={styles.iconSize - 2} color={styles.mutedColor} />
          </Pressable>
        ) : null}
        {loading ? <Spinner size={styles.iconSize} color={styles.mutedColor} /> : <ChevronDownIcon size={styles.iconSize} color={styles.mutedColor} />}
      </Pressable>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={sheetTitle}
        // Arama varken süzme yüksekliği oynatmasın: sabit uzun durak.
        snapPoints={showSearch ? ["85%"] : undefined}
        footer={multiple ? <Button block onPress={() => setOpen(false)}>{values.length ? `Tamam (${values.length})` : "Tamam"}</Button> : undefined}
      >
        {showSearch ? (
          <View style={{ paddingBottom: 8 }}>
            <SearchInput
              placeholder="Ara"
              value={search}
              onChangeText={(t) => {
                setSearch(t);
                onSearch?.(t);
              }}
              allowClear
              accessibilityLabel={`${plain(sheetTitle) ?? "Seçenekler"} içinde ara`}
            />
          </View>
        ) : null}
        <OptionList sections={buildSections(options, search)} loading={loading} notFoundContent={notFoundContent} values={values} multiple={multiple} onChoose={choose} render={optionRender} />
      </BottomSheet>
    </>
  );
}
