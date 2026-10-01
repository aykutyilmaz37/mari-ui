"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "@mari-ui/core";
import type { TreeNode } from "../tree/types";
import { buildIndex, flattenVisible, isExpandable, searchTree } from "../tree/utils";
import type { TreeSelectMultipleProps, TreeSelectProps, TreeSelectSingleProps } from "./types";
import { applyStrategy, initialExpanded, isPickable, removeValue, toggleCheckedValue, valueToChecked } from "./utils";

const toArray = (v: string | string[] | null | undefined): string[] | undefined => {
  if (v === undefined) return undefined;
  if (v === null) return [];
  return Array.isArray(v) ? v : [v];
};

/**
 * TreeSelect'in durumu: değer(ler), açık/kapalı, arama, açık dallar, aktif
 * (klavyeyle üzerinde durulan) düğüm ve bunları değiştiren eylemler. Tekli,
 * çoklu ve işaretli mod içeride aynı dizi.
 */
export function useTreeSelectState(props: TreeSelectProps) {
  const mode = props.mode;
  const multiple = mode === "multiple" || mode === "checkable";
  const checkable = mode === "checkable";
  const multi = props as TreeSelectMultipleProps;
  const strategy = (checkable && multi.showCheckedStrategy) || "child";
  const strict = checkable && !!multi.treeCheckStrictly;

  const index = useMemo(() => buildIndex(props.treeData), [props.treeData]);
  const [values, setValuesState] = useControllableState<string[]>({ value: toArray(props.value), defaultValue: toArray(props.defaultValue) ?? [] });
  const [open, setOpenState] = useControllableState<boolean>({ value: props.open, defaultValue: false, onChange: props.onOpenChange });
  const [initialExpand] = useState(() => initialExpanded(index, values, !!props.treeDefaultExpandAll));
  const [expandedList, setExpandedList] = useControllableState<string[]>({
    value: props.treeExpandedKeys,
    defaultValue: initialExpand,
    onChange: props.onTreeExpand,
  });
  const expandedRef = useRef(expandedList);
  expandedRef.current = expandedList;
  const [loadingKeys, setLoadingKeys] = useState<ReadonlySet<string>>(new Set());
  const lazy = Boolean(props.loadData);
  const [search, setSearchState] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const checkInfo = useMemo(() => (checkable ? valueToChecked(values, index, strict) : { checked: values, halfChecked: [] }), [checkable, values, index, strict]);
  const checkedSet = useMemo(() => new Set(checkInfo.checked), [checkInfo]);
  const halfSet = useMemo(() => new Set(checkInfo.halfChecked), [checkInfo]);
  const valueSet = useMemo(() => new Set(values), [values]);

  const searchResult = useMemo(() => (props.showSearch && search ? searchTree(index, search) : null), [props.showSearch, search, index]);
  const expanded = useMemo(() => {
    const set = new Set(expandedList);
    searchResult?.expand.forEach((k) => set.add(k));
    return set;
  }, [expandedList, searchResult]);
  const visible = useMemo(() => flattenVisible(props.treeData, expanded, searchResult?.visible), [props.treeData, expanded, searchResult]);

  // Liste değişince aktif düğüm görünmez olduysa ilk görünür düğüme geç; aramada ilk eşleşmeye.
  useEffect(() => {
    if (!open) return;
    if (searchResult) {
      const first = visible.find((v) => searchResult.matches.has(v.node.key));
      setActiveKey(first?.node.key ?? null);
    } else if (activeKey === null || !visible.some((v) => v.node.key === activeKey)) {
      setActiveKey(visible[0]?.node.key ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- görünür liste ya da arama değişince
  }, [open, visible, searchResult]);

  const nodesOf = (keys: string[]) => keys.map((k) => index.get(k)?.node).filter((n): n is TreeNode => !!n);

  const commit = (next: string[]) => {
    setValuesState(next);
    if (multiple) (props.onChange as TreeSelectMultipleProps["onChange"])?.(next, nodesOf(next));
    else (props.onChange as TreeSelectSingleProps["onChange"])?.(next[0] ?? null, nodesOf(next.slice(0, 1))[0] ?? null);
  };

  const setOpen = (next: boolean) => {
    if (next === open) return;
    setOpenState(next);
    if (!next) setSearch("");
  };

  const setSearch = (text: string) => {
    setSearchState(text);
    props.onSearch?.(text);
  };

  /** Açılış: aktif düğüm seçili olan (görünürse) ya da ilk düğüm. */
  const openAt = () => {
    setOpen(true);
    const selected = values.find((k) => visible.some((v) => v.node.key === k));
    setActiveKey(selected ?? visible[0]?.node.key ?? null);
  };

  const pick = (node: TreeNode) => {
    if (!isPickable(node, checkable)) return;
    setActiveKey(node.key);
    if (checkable) commit(toggleCheckedValue(values, node.key, index, strategy, strict));
    else if (multiple) commit(valueSet.has(node.key) ? values.filter((k) => k !== node.key) : [...values, node.key]);
    else {
      commit([node.key]);
      setOpen(false);
    }
    if (multiple && search) setSearch("");
  };

  /** Tembel dal: ilk açılışta `loadData`; hata olursa dal geri kapanır. */
  const load = (node: TreeNode) => {
    if (!props.loadData || node.children !== undefined || node.isLeaf || loadingKeys.has(node.key)) return;
    setLoadingKeys((prev) => new Set(prev).add(node.key));
    props
      .loadData(node)
      .catch(() => setExpandedList(expandedRef.current.filter((k) => k !== node.key)))
      .finally(() =>
        setLoadingKeys((prev) => {
          const next = new Set(prev);
          next.delete(node.key);
          return next;
        })
      );
  };

  const toggleExpand = (key: string, next?: boolean) => {
    const isOpen = expanded.has(key);
    const want = next ?? !isOpen;
    if (want === isOpen) return;
    setExpandedList(want ? [...expandedList, key] : expandedList.filter((k) => k !== key));
    const node = index.get(key)?.node;
    if (want && node) load(node);
  };

  return {
    index,
    mode,
    multiple,
    checkable,
    strategy,
    open,
    setOpen,
    openAt,
    search,
    setSearch,
    values,
    /** Etiketler/tetikleyici için değerdeki düğümler (stratejiye göre). */
    selectedNodes: nodesOf(checkable && !strict ? applyStrategy(checkInfo.checked, index, strategy) : values),
    visible,
    searchResult,
    expanded,
    toggleExpand,
    expandMany: (keys: string[]) => {
      setExpandedList([...new Set([...expandedList, ...keys])]);
      keys.forEach((k) => {
        const node = index.get(k)?.node;
        if (node) load(node);
      });
    },
    activeKey,
    setActiveKey,
    canExpand: (node: TreeNode) => isExpandable(node, lazy),
    isLoading: (key: string) => loadingKeys.has(key),
    isSelected: (key: string) => (checkable ? checkedSet.has(key) : valueSet.has(key)),
    isHalf: (key: string) => halfSet.has(key),
    pick,
    remove: (key: string) => commit(removeValue(values, key, index, strategy, strict, checkable)),
    clear: () => commit([]),
  };
}

export type TreeSelectState = ReturnType<typeof useTreeSelectState>;
