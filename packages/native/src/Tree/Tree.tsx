import React, { useMemo, useState } from "react";
import { Pressable, Text, View, type TextStyle } from "react-native";
import type { ColorRole } from "@mari-ui/core";
import type { Theme } from "@mari-ui/tokens";
import { useNativeConfig, type NativeTreeSize } from "../nativeConfig";
import { nativeFontFamily } from "../theme/fontFamily";
import { useTheme } from "../theme/useTheme";
import { Checkbox } from "../Checkbox";
import { ChevronRightIcon } from "../lib/icons";
import { SkeletonBox, SkeletonText } from "../lib/Skeleton";
import { Spinner } from "../lib/Spinner";
import { useControllable } from "../lib/useControllable";
import { buildIndex, conductCheck, flattenVisible, getParentKeys, isCheckEligible, isExpandable, nodeText, searchTree, splitMatch, toggleCheck, type VisibleNode } from "./treeUtils";
import type { TreeNode, TreeProps } from "./types";

export type { TreeCheckInfo, TreeNode, TreeProps } from "./types";

/** Başlık: düz metinse arama eşleşmesi vurgulu (kalın + rol rengi). */
function Title({ node, searchValue, style, matchColor, render }: { node: TreeNode; searchValue?: string; style: TextStyle; matchColor: string; render?: TreeProps["titleRender"] }) {
  if (render) return <>{render(node)}</>;
  if (typeof node.title !== "string" && typeof node.title !== "number") return <>{node.title}</>;
  const parts = splitMatch(String(node.title), searchValue ?? "");
  return (
    <Text numberOfLines={2} style={style}>
      {parts.map((p, i) => (p.match ? <Text key={i} style={{ fontWeight: "700", color: matchColor }}>{p.text}</Text> : p.text))}
    </Text>
  );
}

/** Girinti kılavuzları: her üst seviye için ince dikey çizgi (`showLine`). */
function Guides({ level, m, color }: { level: number; m: NativeTreeSize; color: string }) {
  return (
    <>
      {Array.from({ length: level - 1 }, (_, i) => (
        <View key={i} style={{ width: m.indent, alignSelf: "stretch", alignItems: "center" }}>
          <View style={{ width: 1, flex: 1, backgroundColor: color }} />
        </View>
      ))}
    </>
  );
}

interface RowProps {
  item: VisibleNode;
  expandable: boolean;
  expanded: boolean;
  loading: boolean;
  selected: boolean;
  check: { checked: boolean; half: boolean } | null;
  onToggle: () => void;
  onPress: () => void;
  onCheck: () => void;
  showLine: boolean;
  searchValue?: string;
  titleRender?: TreeProps["titleRender"];
  color: ColorRole;
  skeleton: boolean;
  m: NativeTreeSize;
  theme: Theme;
}

function Toggle({ expandable, expanded, loading, title, onToggle, skeleton, m, theme }: Pick<RowProps, "expandable" | "expanded" | "loading" | "onToggle" | "skeleton" | "m" | "theme"> & { title: string }) {
  const c = theme.color.canvas;
  if (!expandable) return <View style={{ width: m.toggleSize }} />;
  if (skeleton) return <View style={{ width: m.toggleSize, alignItems: "center" }}><SkeletonBox style={{ width: 14, height: 14, borderRadius: 7 }} /></View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${expanded ? "Kapat" : "Aç"}: ${title}`}
      accessibilityState={{ expanded, busy: loading }}
      aria-expanded={expanded}
      onPress={onToggle}
      hitSlop={6}
      style={{ width: m.toggleSize, height: m.toggleSize, alignItems: "center", justifyContent: "center" }}
    >
      {loading ? <Spinner size={14} color={c.muted} /> : <View style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}><ChevronRightIcon size={16} color={c.muted} /></View>}
    </Pressable>
  );
}

function rowBackground(selected: boolean, pressed: boolean, color: ColorRole, theme: Theme): string {
  if (selected) return theme.color[color].subtle;
  return pressed ? theme.color.canvas.surfaceAlt : "transparent";
}

function nodeIcon(node: TreeNode, skeleton: boolean, m: NativeTreeSize) {
  if (node.icon == null) return null;
  return skeleton ? <SkeletonBox style={{ width: m.iconSize, height: m.iconSize, borderRadius: 4 }} /> : <View>{node.icon}</View>;
}

function Row(props: RowProps) {
  const { item, selected, check, onPress, onCheck, showLine, searchValue, titleRender, color, skeleton, m, theme } = props;
  const { node, level } = item;
  const c = theme.color.canvas;
  const disabled = node.disabled ?? false;
  const title = nodeText(node);
  const titleStyle: TextStyle = { fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.fontSize, lineHeight: m.lineHeight, color: selected ? theme.color[color].text : c.foreground, fontWeight: selected ? "600" : "400" };
  const titleNode = <Title node={node} searchValue={searchValue} style={titleStyle} matchColor={theme.color[color].text} render={titleRender} />;
  return (
    <View style={{ flexDirection: "row", alignItems: "stretch", minHeight: m.rowMinHeight, opacity: disabled ? 0.45 : 1 }}>
      {showLine ? <Guides level={level} m={m} color={c.border} /> : <View style={{ width: (level - 1) * m.indent }} />}
      <View style={{ justifyContent: "center" }}>
        <Toggle {...props} title={title} />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title || undefined}
        accessibilityState={{ selected, disabled, ...(check ? { checked: check.half ? "mixed" : check.checked } : null) }}
        disabled={disabled || skeleton}
        onPress={onPress}
        // Onay kutusu zaten 44 (dokunma hedefi) — üstüne dolgu eklenirse satır 60'a çıkıyordu.
        style={({ pressed }) => ({ flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: check ? 0 : 6, paddingHorizontal: 8, borderRadius: 8, backgroundColor: rowBackground(selected, pressed, color, theme) })}
      >
        {check ? <Checkbox checked={check.checked} indeterminate={check.half} disabled={disabled || !isCheckEligible(node)} skeleton={skeleton} onChange={onCheck} accessibilityLabel={title} /> : null}
        {nodeIcon(node, skeleton, m)}
        <View style={{ flex: 1, minWidth: 0, alignItems: "flex-start" }}>{skeleton ? <SkeletonText fontSize={m.fontSize}>{titleNode}</SkeletonText> : titleNode}</View>
      </Pressable>
    </View>
  );
}

/** Açık düğümler: kontrollü / kontrolsüz; arama varken eşleşenlerin ataları da açık. */
function useExpanded(props: TreeProps, index: ReturnType<typeof buildIndex>) {
  const initial = useMemo(() => (props.defaultExpandAll ? getParentKeys(index) : (props.defaultExpandedKeys ?? [])), []); // eslint-disable-line react-hooks/exhaustive-deps
  return useControllable<string[]>(props.expandedKeys, initial);
}

/**
 * Hiyerarşik veri görünümü: girintili satırlar, aç/kapa, seçim (tek / çok),
 * üst ↔ alt yayılımlı onay kutuları (kısmi durum), tembel yükleme, arama
 * vurgusu, kılavuz çizgileri. Mantık web Tree ile aynı (`treeUtils`).
 */
export function Tree(props: TreeProps) {
  const { treeData, selectable = true, multiple = false, checkable = false, checkStrictly = false, loadData, expandAction = false, showLine = false, searchValue, titleRender, notFoundContent = "Sonuç bulunamadı", color = "primary", skeleton = false, accessibilityLabel, style } = props;
  const theme = useTheme();
  const m = useNativeConfig().tree;
  const index = useMemo(() => buildIndex(treeData), [treeData]);
  const [expanded, setExpanded] = useExpanded(props, index);
  const [selected, setSelected] = useControllable<string[]>(props.selectedKeys, props.defaultSelectedKeys ?? []);
  const [checkedRaw, setChecked] = useControllable<string[]>(props.checkedKeys, props.defaultCheckedKeys ?? []);
  const [loading, setLoading] = useState<ReadonlySet<string>>(new Set());

  const checkInfo = useMemo(() => (checkStrictly ? { checked: checkedRaw, halfChecked: [] } : conductCheck(checkedRaw, index)), [checkedRaw, index, checkStrictly]);
  const search = useMemo(() => searchTree(index, searchValue ?? ""), [index, searchValue]);
  const openSet = useMemo(() => new Set([...expanded, ...(search?.expand ?? [])]), [expanded, search]);
  const visible = useMemo(() => flattenVisible(treeData, openSet, search?.visible), [treeData, openSet, search]);

  const toggle = async (node: TreeNode) => {
    const isOpen = openSet.has(node.key);
    const next = isOpen ? expanded.filter((k) => k !== node.key) : [...expanded, node.key];
    // Tembel: çocuğu henüz yoksa önce yükle; reddedilirse kapalı kalır.
    if (!isOpen && loadData && node.children === undefined && !node.isLeaf) {
      setLoading((s) => new Set(s).add(node.key));
      try {
        await loadData(node);
      } catch {
        return;
      } finally {
        setLoading((s) => {
          const n = new Set(s);
          n.delete(node.key);
          return n;
        });
      }
    }
    setExpanded(next);
    props.onExpand?.(next, { node, expanded: !isOpen });
  };

  const check = (node: TreeNode) => {
    const on = !checkInfo.checked.includes(node.key);
    const info = toggleCheck(checkInfo.checked, node.key, on, index, checkStrictly);
    setChecked(info.checked);
    props.onCheck?.(info.checked, { node, checked: on, halfCheckedKeys: info.halfChecked });
  };

  const press = (node: TreeNode) => {
    if (expandAction === "click" && isExpandable(node, Boolean(loadData))) void toggle(node);
    if (!selectable || node.selectable === false) {
      // Seçim yoksa dokunma işaretler (onay kutulu ağaçta satırın tamamı hedef).
      if (checkable && isCheckEligible(node)) check(node);
      return;
    }
    const isOn = selected.includes(node.key);
    let next: string[];
    if (multiple) next = isOn ? selected.filter((k) => k !== node.key) : [...selected, node.key];
    else next = isOn ? [] : [node.key];
    setSelected(next);
    props.onSelect?.(next, { node, selected: !isOn });
  };

  const c = theme.color.canvas;
  if (search && visible.length === 0) {
    return <Text style={{ fontFamily: nativeFontFamily(theme.fontFamily.sans), fontSize: m.fontSize, color: c.muted, paddingVertical: 16, textAlign: "center" }}>{notFoundContent}</Text>;
  }

  return (
    <View accessibilityLabel={accessibilityLabel} style={[{ alignSelf: "stretch" }, style]}>
      {visible.map((item) => {
        const { node } = item;
        const isCheck = checkable && node.checkable !== false;
        return (
          <Row
            key={node.key}
            item={item}
            expandable={isExpandable(node, Boolean(loadData))}
            expanded={openSet.has(node.key)}
            loading={loading.has(node.key)}
            selected={selectable && selected.includes(node.key)}
            check={isCheck ? { checked: checkInfo.checked.includes(node.key), half: checkInfo.halfChecked.includes(node.key) } : null}
            onToggle={() => void toggle(node)}
            onPress={() => press(node)}
            onCheck={() => check(node)}
            showLine={showLine}
            searchValue={searchValue}
            titleRender={titleRender}
            color={color}
            skeleton={skeleton}
            m={m}
            theme={theme}
          />
        );
      })}
    </View>
  );
}
