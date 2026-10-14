import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import type { ColorRole, Size } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { useStyles } from "../styles/useStyles";
import { BottomSheet, type SnapPoint } from "../BottomSheet";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { SearchInput } from "../Input";
import type { InputShape, InputVariant } from "../Input/types";
import { Tag } from "../Tag";
import { FieldTrigger } from "../lib/FieldTrigger";
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, XIcon } from "../lib/icons";
import { SkeletonBox, type SkeletonableProps } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import { useControllable } from "../lib/useControllable";
import { useFieldControl } from "../lib/fieldContext";
import type { TreeNode } from "../Tree/types";
import {
  buildIndex,
  flatSearch,
  isCheckEligible,
  isExpandable,
  isPickable,
  levelNodes,
  nodeText,
  pathTo,
  removeValue,
  splitMatch,
  toggleCheckedValue,
  valueToChecked,
  type TreeIndex,
  type TreeSelectCheckedStrategy,
} from "../Tree/treeUtils";

export type { TreeSelectCheckedStrategy };

interface TreeSelectBaseProps extends SkeletonableProps {
  treeData: TreeNode[];
  placeholder?: string;
  /** Panelin üstünde arama; yazınca düz sonuç listesi (yoluyla), Türkçe harf duyarsız. */
  showSearch?: boolean;
  onSearch?: (text: string) => void;
  allowClear?: boolean;
  /** Varsayılan: `"Temizle"`. */
  clearLabel?: string;
  /** Varsayılan: `"Sonuç bulunamadı"`. */
  notFoundContent?: React.ReactNode;
  /**
   * Tembel yükleme: çocukları henüz yüklenmemiş (`children` tanımsız, `isLeaf`
   * değil) dala inilince çağrılır; çözülene kadar satırda gösterge. `treeData`yı
   * siz güncellersiniz. Arama yalnız yüklenmiş düğümlerde çalışır.
   */
  loadData?: (node: TreeNode) => Promise<void>;
  /** Kök seviyesinin yol gösterimindeki adı. Varsayılan: `"Tümü"`. */
  rootLabel?: string;
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
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export interface TreeSelectSingleProps extends TreeSelectBaseProps {
  mode?: undefined;
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null, node: TreeNode | null) => void;
}

export interface TreeSelectMultipleProps extends TreeSelectBaseProps {
  /** `multiple`: düğümler bağımsız seçilir. `checkable`: onay kutuları, üst ↔ alt yayılım. Panel "Tamam" ile kapanır. */
  mode: "multiple" | "checkable";
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[], nodes: TreeNode[]) => void;
  /** `checkable`da değere yazılacak düğümler. Varsayılan: `"child"`. */
  showCheckedStrategy?: TreeSelectCheckedStrategy;
  /** `checkable`da yayılımı kapatır: her düğüm bağımsız işaretlenir. */
  treeCheckStrictly?: boolean;
  /** En fazla bu kadar etiket, kalanı "+N". */
  maxTagCount?: number;
}

export type TreeSelectProps = TreeSelectSingleProps | TreeSelectMultipleProps;

/** Arama varken sabit durak (süzerken panel zıplamasın); sabit dizi. */
const SNAPS: SnapPoint[] = ["85%"];
const notNull = (v: string | null | undefined): v is string => v != null;

function resolveValues(props: TreeSelectProps): { initial: string[]; controlled: string[] | undefined } {
  if (props.mode) return { initial: props.defaultValue ?? [], controlled: props.value };
  return { initial: [props.defaultValue].filter(notNull), controlled: props.value === undefined ? undefined : [props.value].filter(notNull) };
}

interface Ctx {
  theme: Theme;
  color: ColorRole;
  font: string | undefined;
  rowMinHeight: number;
  fontSize: number;
  lineHeight: number;
}

/** Eşleşme vurgulu başlık (düz metin değilse olduğu gibi). */
function NodeTitle({ node, query, ctx, selected }: { node: TreeNode; query: string; ctx: Ctx; selected: boolean }) {
  const c = ctx.theme.color.canvas;
  const style: TextStyle = { fontFamily: ctx.font, fontSize: ctx.fontSize, lineHeight: ctx.lineHeight, color: node.disabled ? c.muted : c.foreground, fontWeight: selected ? "600" : "400" };
  if (typeof node.title !== "string" && typeof node.title !== "number") return <>{node.title}</>;
  return (
    <Text numberOfLines={2} style={style}>
      {splitMatch(String(node.title), query).map((p, i) => (p.match ? <Text key={i} style={{ fontWeight: "700", color: ctx.theme.color[ctx.color].text }}>{p.text}</Text> : p.text))}
    </Text>
  );
}

interface RowProps {
  node: TreeNode;
  /** Satırın altında soluk ikinci satır (aramada yol, "tümü" satırında yok). */
  subtitle?: string;
  label?: string;
  query: string;
  checkable: boolean;
  check?: { checked: boolean; half: boolean };
  selected: boolean;
  /** Çocuklu satır: dokunma içeri iner. */
  branch: boolean;
  loading: boolean;
  onPress: () => void;
  onCheck: () => void;
  ctx: Ctx;
}

function rowBackground(pressed: boolean, theme: Theme) {
  return pressed ? theme.color.canvas.surfaceAlt : "transparent";
}

/** Panel satırı: [onay kutusu] [ikon] başlık (+ alt satır) [✓] [› / gösterge]. */
function Row({ node, subtitle, label, query, checkable, check, selected, branch, loading, onPress, onCheck, ctx }: RowProps) {
  const c = ctx.theme.color.canvas;
  const disabled = node.disabled ?? false;
  const name = label ?? nodeText(node);
  return (
    <View style={{ flexDirection: "row", alignItems: "center", minHeight: ctx.rowMinHeight, opacity: disabled ? 0.5 : 1 }}>
      {checkable && check ? <Checkbox checked={check.checked} indeterminate={check.half} disabled={disabled || !isCheckEligible(node)} onChange={onCheck} accessibilityLabel={name} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={name}
        accessibilityHint={branch ? "Alt seviyeyi açar" : undefined}
        accessibilityState={{ selected, disabled, busy: loading }}
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => ({ flex: 1, minWidth: 0, minHeight: ctx.rowMinHeight, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, paddingHorizontal: 12, marginRight: -12, borderRadius: 10, backgroundColor: rowBackground(pressed, ctx.theme) })}
      >
        {node.icon == null ? null : <View>{node.icon}</View>}
        <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
          {label ? <Text style={{ fontFamily: ctx.font, fontSize: ctx.fontSize, lineHeight: ctx.lineHeight, color: c.foreground, fontWeight: "500" }}>{label}</Text> : <NodeTitle node={node} query={query} ctx={ctx} selected={selected} />}
          {subtitle ? <Text numberOfLines={1} style={{ fontFamily: ctx.font, fontSize: 13, lineHeight: 18, color: c.muted }}>{subtitle}</Text> : null}
        </View>
        {selected && !checkable ? <CheckIcon size={20} color={ctx.theme.color[ctx.color].solid} strokeWidth={2.5} /> : null}
        {loading ? <Spinner size={16} color={c.muted} /> : null}
        {branch && !loading ? <ChevronRightIcon size={18} color={c.muted} /> : null}
      </Pressable>
    </View>
  );
}

/** Yol gösterimi: Tümü › Elektronik › Bilgisayar; öncekiler dokunulunca o seviyeye döner. */
function Breadcrumb({ trail, rootLabel, onJump, ctx }: { trail: TreeNode[]; rootLabel: string; onJump: (depth: number) => void; ctx: Ctx }) {
  const c = ctx.theme.color.canvas;
  const crumbs = [rootLabel, ...trail.map(nodeText)];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "center", gap: 4, paddingVertical: 4 }} accessibilityLabel="Konum">
      {crumbs.map((text, i) => {
        const last = i === crumbs.length - 1;
        return (
          <View key={`${i}-${text}`} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {i > 0 ? <ChevronRightIcon size={14} color={c.muted} /> : null}
            {last ? (
              <Text accessibilityRole="header" style={{ fontFamily: ctx.font, fontSize: 15, fontWeight: "600", color: c.foreground }}>{text}</Text>
            ) : (
              <Pressable accessibilityRole="button" accessibilityLabel={`${text} seviyesine dön`} onPress={() => onJump(i)} hitSlop={10}>
                <Text style={{ fontFamily: ctx.font, fontSize: 15, fontWeight: "500", color: ctx.theme.color[ctx.color].text }}>{text}</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

/** Seçili değerlerin durumu: işaretli / kısmi (checkable) ya da seçili kümesi. */
function useSelection(values: string[], index: TreeIndex, checkable: boolean, strict: boolean) {
  return useMemo(() => {
    if (!checkable) return { selected: new Set(values), checked: new Set<string>(), half: new Set<string>() };
    const info = valueToChecked(values, index, strict);
    return { selected: new Set<string>(), checked: new Set(info.checked), half: new Set(info.halfChecked) };
  }, [values, index, checkable, strict]);
}

interface TriggerDisplayProps {
  nodes: TreeNode[];
  multiple: boolean;
  maxTagCount?: number;
  placeholder: string;
  disabled: boolean;
  textStyle: TextStyle;
  mutedColor: string;
  onRemove: (key: string) => void;
}

function TriggerDisplay({ nodes, multiple, maxTagCount, placeholder, disabled, textStyle, mutedColor, onRemove }: TriggerDisplayProps) {
  if (nodes.length === 0) return <Text numberOfLines={1} style={[textStyle, { color: mutedColor }]}>{placeholder}</Text>;
  if (!multiple) return <Text numberOfLines={1} style={textStyle}>{nodeText(nodes[0]!)}</Text>;
  const shown = nodes.slice(0, maxTagCount ?? nodes.length);
  const rest = nodes.length - shown.length;
  return (
    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 6, paddingVertical: 6 }}>
      {shown.map((n) => (
        <Tag key={n.key} onClose={disabled ? undefined : () => onRemove(n.key)} closeLabel={`${nodeText(n)} seçimini kaldır`}>
          {nodeText(n)}
        </Tag>
      ))}
      {rest > 0 ? <Tag>{`+${rest}`}</Tag> : null}
    </View>
  );
}

/** Tembel yükleme ile içeri inme: çocuk yoksa önce yükle (satırda gösterge), sonra in. */
function useDrill(loadData: TreeSelectBaseProps["loadData"]) {
  const [trail, setTrail] = useState<TreeNode[]>([]);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const drill = async (node: TreeNode) => {
    if (loadData && node.children === undefined && !node.isLeaf) {
      setLoadingKey(node.key);
      try {
        await loadData(node);
      } catch {
        return;
      } finally {
        setLoadingKey(null);
      }
    }
    setTrail((t) => [...t, node]);
  };
  return { trail, setTrail, loadingKey, drill };
}

/** Kipten türeyen bayraklar (tekli kipte çoklu seçenekler yok). */
function modeFlags(props: TreeSelectProps) {
  if (!props.mode) return { multiple: false, checkable: false, strategy: "child" as TreeSelectCheckedStrategy, strict: false, maxTagCount: undefined };
  return { multiple: true, checkable: props.mode === "checkable", strategy: props.showCheckedStrategy ?? "child", strict: props.treeCheckStrictly ?? false, maxTagCount: props.maxTagCount };
}

interface PanelBodyProps {
  treeData: TreeNode[];
  index: TreeIndex;
  query: string;
  trail: TreeNode[];
  setTrail: React.Dispatch<React.SetStateAction<TreeNode[]>>;
  rootLabel: string;
  notFoundContent: React.ReactNode;
  checkable: boolean;
  lazy: boolean;
  loadingKey: string | null;
  sel: ReturnType<typeof useSelection>;
  onDrill: (node: TreeNode) => void;
  onPick: (node: TreeNode) => void;
  ctx: Ctx;
}

/** Panelin içi: aramada düz sonuçlar (yoluyla), değilse yol gösterimi + "(tümü)" + seviye satırları. */
function PanelBody({ treeData, index, query, trail, setTrail, rootLabel, notFoundContent, checkable, lazy, loadingKey, sel, onDrill, onPick, ctx }: PanelBodyProps) {
  const row = (n: TreeNode, opts: { subtitle?: string; label?: string; asLeaf?: boolean } = {}) => {
    const branch = !opts.asLeaf && isExpandable(n, lazy);
    return (
      <Row
        key={opts.label ? `${n.key}:all` : n.key}
        node={n}
        {...(opts.subtitle ? { subtitle: opts.subtitle } : null)}
        {...(opts.label ? { label: opts.label } : null)}
        query={query}
        checkable={checkable}
        check={{ checked: sel.checked.has(n.key), half: sel.half.has(n.key) }}
        selected={checkable ? sel.checked.has(n.key) : sel.selected.has(n.key)}
        branch={branch}
        loading={loadingKey === n.key}
        onPress={() => (branch ? onDrill(n) : onPick(n))}
        onCheck={() => onPick(n)}
        ctx={ctx}
      />
    );
  };
  const hits = flatSearch(index, query);
  if (hits) {
    if (hits.length === 0) return <Text style={{ fontFamily: ctx.font, fontSize: ctx.fontSize, color: ctx.theme.color.canvas.muted, paddingVertical: 24, textAlign: "center" }}>{notFoundContent}</Text>;
    // Sonuç satırı içeri inmez, seçer; altında atalarının yolu.
    return <>{hits.map((h) => row(h.node, { subtitle: h.path.join(" › "), asLeaf: true }))}</>;
  }
  const parent = trail[trail.length - 1] ?? null;
  return (
    <>
      {trail.length > 0 ? <Breadcrumb trail={trail} rootLabel={rootLabel} onJump={(depth) => setTrail((t) => t.slice(0, depth))} ctx={ctx} /> : null}
      {/* Dalın kendisi: seviyenin başında "(tümü)" satırı (onay kutulu modda tüm dalı işaretler). */}
      {parent && isPickable(parent, checkable) ? row(parent, { label: `${nodeText(parent)} (tümü)`, asLeaf: true }) : null}
      {levelNodes(treeData, index, parent?.key ?? null).map((n) => row(n))}
    </>
  );
}

/**
 * Ağaçtan değer seçme alanı: kapalıyken Input kutusu; dokununca BottomSheet'te
 * aşağı inen menü (kullanıcı kararı) — yol gösterimi, çocuklu satır içeri iner,
 * dalın kendisi seviyenin başındaki "(tümü)" satırıyla seçilir. Arama düz
 * sonuç listesi (yoluyla). Tekli seçim paneli kapatır; çoklu / onay kutulu
 * "Tamam" ile kapanır. Mantık web TreeSelect ile aynı (`treeUtils`).
 */
export function TreeSelect(props: TreeSelectProps) {
  const { treeData, placeholder = "Seçin", showSearch = false, onSearch, allowClear = false, clearLabel = "Temizle", notFoundContent = "Sonuç bulunamadı", loadData, rootLabel = "Tümü", size = "md", variant = "outline", shape = "default", color, title, open: openProp, onOpenChange, style } = props;
  const { multiple, checkable, strategy, strict, maxTagCount } = modeFlags(props);
  const field = useFieldControl({ disabled: props.disabled, skeleton: props.skeleton, accessibilityLabel: props.accessibilityLabel, accessibilityHint: props.accessibilityHint });
  const [open, setOpenState] = useControllable<boolean>(openProp, false);
  const styles = useStyles("input", { color: field.status ?? color, variant, size, shape, disabled: field.disabled, focused: open });
  const theme = useTheme();
  const s = useNativeConfig().select;
  const index = useMemo(() => buildIndex(treeData), [treeData]);
  const { initial, controlled } = resolveValues(props);
  const [values, setValues] = useControllable<string[]>(controlled, initial);
  const [query, setQuery] = useState("");
  const { trail, setTrail, loadingKey, drill } = useDrill(loadData);
  const sel = useSelection(values, index, checkable, strict);
  const ctx: Ctx = { theme, color: color ?? "primary", font: nativeFontFamily(theme.fontFamily.sans), rowMinHeight: s.optionMinHeight, fontSize: s.fontSize, lineHeight: s.lineHeight };

  // Açılınca seçili ilk değerin seviyesinde başla (seçim görünsün).
  useEffect(() => {
    if (!open) return;
    const first = values[0];
    setTrail(first ? pathTo(index, first).slice(0, -1) : []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
    if (!next && query) {
      setQuery("");
      onSearch?.("");
    }
  };
  const nodesOf = (keys: string[]) => keys.map((k) => index.get(k)?.node).filter((n): n is TreeNode => Boolean(n));
  const commit = (next: string[]) => {
    setValues(next);
    if (props.mode) props.onChange?.(next, nodesOf(next));
    else props.onChange?.(next[0] ?? null, nodesOf(next)[0] ?? null);
  };
  const pick = (node: TreeNode) => {
    if (!isPickable(node, checkable)) return;
    if (checkable) return commit(toggleCheckedValue(values, node.key, index, strategy, strict));
    if (multiple) return commit(values.includes(node.key) ? values.filter((k) => k !== node.key) : [...values, node.key]);
    commit([node.key]);
    setOpen(false);
  };
  const remove = (key: string) => commit(removeValue(values, key, index, strategy, strict, checkable));

  if (field.skeleton) return <SkeletonBox style={[styles.container, style]} />;

  const shown = nodesOf(values);
  const hasValue = shown.length > 0;
  const sheetTitle = title ?? field.accessibilityLabel?.replace(/, zorunlu$/, "") ?? placeholder;
  const grow: ViewStyle | null = multiple && hasValue ? { height: undefined, minHeight: styles.container.height } : null;
  const panel = (
    <PanelBody
      treeData={treeData}
      index={index}
      query={query}
      trail={trail}
      setTrail={setTrail}
      rootLabel={rootLabel}
      notFoundContent={notFoundContent}
      checkable={checkable}
      lazy={Boolean(loadData)}
      loadingKey={loadingKey}
      sel={sel}
      onDrill={(n) => void drill(n)}
      onPick={pick}
      ctx={ctx}
    />
  );

  return (
    <>
      <FieldTrigger
        accessibilityLabel={field.accessibilityLabel ?? placeholder}
        accessibilityHint={field.accessibilityHint}
        accessibilityValue={hasValue ? { text: shown.map(nodeText).join(", ") } : undefined}
        expanded={open}
        disabled={field.disabled}
        onPress={() => setOpen(true)}
        hitSlop={styles.hitSlop}
        style={[styles.container, grow, style]}
        display={<TriggerDisplay nodes={shown} multiple={multiple} maxTagCount={maxTagCount} placeholder={placeholder} disabled={field.disabled} textStyle={styles.input} mutedColor={styles.mutedColor} onRemove={remove} />}
        displayAccessible={multiple && hasValue && !field.disabled}
        action={allowClear && hasValue && !field.disabled ? (
          <Pressable accessibilityRole="button" accessibilityLabel={clearLabel} hitSlop={12} onPress={() => commit([])}>
            <XIcon size={styles.iconSize - 2} color={styles.mutedColor} />
          </Pressable>
        ) : null}
        indicator={<ChevronDownIcon size={styles.iconSize} color={styles.mutedColor} />}
      />
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={sheetTitle}
        // Seviyeler arası gezinirken / süzerken panel zıplamasın: sabit uzun durak.
        snapPoints={SNAPS}
        footer={multiple ? <Button block onPress={() => setOpen(false)}>{values.length ? `Tamam (${values.length})` : "Tamam"}</Button> : undefined}
      >
        {showSearch ? (
          <View style={{ paddingBottom: 8 }}>
            <SearchInput
              placeholder="Ara"
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                onSearch?.(t);
              }}
              allowClear
              accessibilityLabel={`${typeof sheetTitle === "string" ? sheetTitle : "Seçenekler"} içinde ara`}
            />
          </View>
        ) : null}
        {panel}
      </BottomSheet>
    </>
  );
}
