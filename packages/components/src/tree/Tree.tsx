"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { CheckIcon, ChevronRightIcon, Loader2Icon, MinusIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { bgSolidClass, textSolidContrastClass } from "../lib/colorClasses";
import { skeletonBoxProps } from "../lib/skeleton";
import { SkeletonBlock } from "../skeleton";
import type { TreeNode, TreeProps } from "./types";
import {
  buildIndex,
  conductCheck,
  flattenVisible,
  getKeyAction,
  getParentKeys,
  isExpandable,
  searchTree,
  splitMatch,
  toggleCheck,
  type TreeIndex,
  type VisibleNode,
} from "./utils";

export type { TreeProps, TreeNode };

type CheckState = "checked" | "mixed" | "unchecked";

function CheckboxBox({ state, disabled, onClick }: { state: CheckState; disabled: boolean; onClick: (e: React.MouseEvent) => void }) {
  const on = state !== "unchecked";
  return (
    // Görsel kutu: durum treeitem'in `aria-checked`ında; tıklama fare içindir, klavyede Space.
    <span
      aria-hidden
      onClick={disabled ? undefined : onClick}
      className={cn(
        "mr-1 flex size-4 shrink-0 items-center justify-center rounded-sm border transition-colors",
        on ? cn("border-transparent", bgSolidClass.primary, textSolidContrastClass.primary) : "border-mari-input bg-mari-surface",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      )}
    >
      {state === "checked" && <CheckIcon size={12} strokeWidth={3.5} />}
      {state === "mixed" && <MinusIcon size={12} strokeWidth={3.5} />}
    </span>
  );
}

function Title({ node, searchValue, titleRender }: { node: TreeNode; searchValue?: string; titleRender?: TreeProps["titleRender"] }) {
  if (titleRender) return <>{titleRender(node)}</>;
  if (!searchValue || typeof node.title !== "string") return <>{node.title}</>;
  return (
    <>
      {splitMatch(node.title, searchValue).map((part, i) =>
        part.match ? (
          // Parçalar sabit sırada, yeniden sıralanmaz.
          <mark key={i} className="rounded-sm bg-mari-warning-subtle text-inherit">
            {part.text}
          </mark>
        ) : (
          <React.Fragment key={i}>{part.text}</React.Fragment>
        )
      )}
    </>
  );
}

interface RowProps {
  entry: VisibleNode;
  id: string;
  focused: boolean;
  open: boolean;
  expandable: boolean;
  loading: boolean;
  selected: boolean;
  selectable: boolean;
  checkState: CheckState | null;
  showLine: boolean;
  blockNode: boolean;
  searchValue?: string;
  titleRender?: TreeProps["titleRender"];
  onToggle: () => void;
  onCheck: () => void;
  onActivate: () => void;
  onDoubleActivate: () => void;
  onFocus: () => void;
  skeleton: boolean;
}

/** treeitem ARIA özellikleri; iskelette hiçbiri (satır erişilebilirlik ağacında değil). */
function treeitemAria({ entry, focused, open, expandable, loading, selected, selectable, checkState, skeleton }: RowProps) {
  if (skeleton) return {};
  let checked: boolean | "mixed" | undefined;
  if (checkState === "mixed") checked = "mixed";
  else if (checkState) checked = checkState === "checked";
  return {
    role: "treeitem",
    tabIndex: focused ? 0 : -1,
    "aria-level": entry.level,
    "aria-posinset": entry.posinset,
    "aria-setsize": entry.setsize,
    "aria-expanded": expandable ? open : undefined,
    "aria-selected": selectable ? selected : undefined,
    "aria-checked": checked,
    "aria-disabled": entry.node.disabled || undefined,
    "aria-busy": loading || undefined,
  } as const;
}

function Switcher({ open, expandable, loading, skeleton, onToggle }: Pick<RowProps, "open" | "expandable" | "loading" | "skeleton" | "onToggle">) {
  let icon: React.ReactNode = null;
  if (loading) icon = <Loader2Icon size={14} className="animate-spin text-mari-muted motion-reduce:animate-none" />;
  else if (expandable && skeleton) icon = <span {...skeletonBoxProps("size-3 rounded-sm")} />;
  else if (expandable)
    icon = <ChevronRightIcon size={14} className={cn("text-mari-muted transition-transform duration-150 motion-reduce:transition-none", open && "rotate-90")} />;
  return (
    // Fare için açma düğmesi; klavyede ←/→ (görsel, aria-hidden).
    <span
      aria-hidden
      onClick={(e) => {
        e.stopPropagation();
        if (expandable) onToggle();
      }}
      className={cn("mr-1 flex h-6 w-6 shrink-0 items-center justify-center self-center rounded-md", expandable && "cursor-pointer hover:bg-mari-surface-alt")}
    >
      {icon}
    </span>
  );
}

function Indent({ level, showLine }: { level: number; showLine: boolean }) {
  return (
    <>
      {Array.from({ length: level - 1 }, (_, i) => (
        <span
          // Girinti birimleri konumsal, sabit.
          key={i}
          aria-hidden
          className={cn(
            "relative w-6 shrink-0",
            // Kılavuz çizgisi satır aralığını da (py) kapsar → çizgiler kesintisiz.
            showLine && "before:absolute before:-inset-y-0.5 before:left-1/2 before:border-l before:border-mari-border pointer-coarse:before:-inset-y-2.5"
          )}
        />
      ))}
    </>
  );
}

function Row(props: RowProps) {
  const { entry, id, selected, checkState, showLine, blockNode, skeleton } = props;
  const { node, level } = entry;
  const disabled = Boolean(node.disabled);

  return (
    <div
      {...treeitemAria(props)}
      id={id}
      data-key={node.key}
      onFocus={props.onFocus}
      className="group relative flex items-stretch py-0.5 text-mari-foreground outline-none pointer-coarse:py-2.5"
    >
      <Indent level={level} showLine={showLine} />
      <Switcher open={props.open} expandable={props.expandable} loading={props.loading} skeleton={skeleton} onToggle={props.onToggle} />
      {checkState && (
        <span className="flex items-center">
          {skeleton ? (
            <span {...skeletonBoxProps("mr-1 size-4 rounded-sm")} />
          ) : (
            <CheckboxBox
              state={checkState}
              disabled={disabled || Boolean(node.disableCheckbox)}
              onClick={(e) => {
                e.stopPropagation();
                props.onCheck();
              }}
            />
          )}
        </span>
      )}
      {/* Klavye karşılığı ağacın onKeyDown'unda (Enter/Space) — odak treeitem'de. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
      <span
        onClick={disabled ? undefined : props.onActivate}
        onDoubleClick={disabled ? undefined : props.onDoubleActivate}
        className={cn(
          "flex min-h-6 min-w-0 items-center gap-1.5 self-center rounded-md px-2 leading-6 transition-colors",
          blockNode && "flex-1",
          disabled ? "cursor-not-allowed text-mari-muted" : "cursor-pointer",
          selected ? "bg-mari-primary-subtle" : !disabled && "hover:bg-mari-surface-alt",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-0 group-focus-visible:outline-mari-ring"
        )}
      >
        {node.icon && (
          <span aria-hidden className={cn("flex shrink-0 items-center [&_svg]:size-4", !disabled && "text-mari-muted", skeleton && "invisible")}>
            {node.icon}
          </span>
        )}
        {skeleton ? (
          <span {...skeletonBoxProps("rounded-sm leading-4")}>{typeof node.title === "string" ? node.title : "…………"}</span>
        ) : (
          <span className="min-w-0 break-words">
            <Title node={node} searchValue={props.searchValue} titleRender={props.titleRender} />
          </span>
        )}
      </span>
    </div>
  );
}

const PLACEHOLDER_LEVELS = [1, 2, 2, 2, 1, 1];

function Placeholders() {
  return (
    <div aria-hidden data-skeleton="" className="flex flex-col">
      {PLACEHOLDER_LEVELS.map((level, i) => (
        <div key={i} className="flex h-7 items-center gap-1 pointer-coarse:h-11" style={{ paddingInlineStart: `${(level - 1) * 1.5}rem` }}>
          <SkeletonBlock active width="1rem" height="0.75rem" radius="sm" className="mx-1" />
          <SkeletonBlock active width={`${40 + ((i * 23) % 50)}%`} height="0.875rem" radius="sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * Tab durağı olan düğüm. Odaklı düğüm görünmez olduysa (ebeveyni kapandı,
 * arama) en yakın görünür atası; hiç odak yoksa ilk görünür seçili, o da yoksa ilk düğüm.
 */
function resolveActiveKey(focusKey: string | null, visible: VisibleNode[], index: TreeIndex, selected: string[]): string | null {
  const visibleKeys = new Set(visible.map((v) => v.node.key));
  let key = focusKey;
  while (key !== null && !visibleKeys.has(key)) key = index.get(key)?.parentKey ?? null;
  return key ?? selected.find((k) => visibleKeys.has(k)) ?? visible[0]?.node.key ?? null;
}

function getCheckState(key: string, checked: ReadonlySet<string>, half: ReadonlySet<string>): CheckState {
  if (checked.has(key)) return "checked";
  return half.has(key) ? "mixed" : "unchecked";
}

function useTreeState(props: TreeProps) {
  const { treeData, checkStrictly = false } = props;
  const index = useMemo(() => buildIndex(treeData), [treeData]);
  const [expanded, setExpanded] = useControllableState<string[]>({
    value: props.expandedKeys,
    defaultValue: props.defaultExpandAll ? getParentKeys(buildIndex(treeData)) : (props.defaultExpandedKeys ?? []),
  });
  const [selected, setSelected] = useControllableState<string[]>({ value: props.selectedKeys, defaultValue: props.defaultSelectedKeys ?? [] });
  const [rawChecked, setRawChecked] = useControllableState<string[]>({ value: props.checkedKeys, defaultValue: props.defaultCheckedKeys ?? [] });
  const checkInfo = useMemo(() => (checkStrictly ? { checked: rawChecked, halfChecked: [] } : conductCheck(rawChecked, index)), [rawChecked, index, checkStrictly]);
  const search = useMemo(() => (props.searchValue ? searchTree(index, props.searchValue) : null), [index, props.searchValue]);
  const expandedSet = useMemo(() => new Set([...expanded, ...(search?.expand ?? [])]), [expanded, search]);
  const visible = useMemo(() => flattenVisible(treeData, expandedSet, search?.visible), [treeData, expandedSet, search]);
  return { index, expanded, setExpanded, selected, setSelected, checkInfo, setRawChecked, expandedSet, visible };
}

/**
 * Faz 16.3 — yapı ant.design Tree'den (açma düğmesi, onay kutuları + üst/alt
 * yayılım + kısmi durum, `checkStrictly`, tekli/çoklu seçim, tembel yükleme,
 * kılavuz çizgileri, `blockNode`, arama + vurgu, `titleRender`), görünüm kendi
 * token'larımızdan. Düz (flat) çizim: görünür düğümler tek dizi — klavye ve
 * iskelet bunun üzerinde çalışır. Saf mantık `utils.ts`te (TreeSelect de kullanır).
 *
 * Erişilebilirlik (WAI-ARIA APG Tree View): `role="tree"` + `treeitem`
 * (`aria-level`/`aria-posinset`/`aria-setsize`, açılabilirse `aria-expanded`,
 * seçilebilirse `aria-selected`, işaretlenebilirse `aria-checked` true/false/
 * mixed). Tek Tab durağı (roving tabindex). ↑/↓, →/←, Home/End, `*`, harfle
 * atlama; Enter seçer, Space (onay kutulu ağaçta) işaretler. Dokunmatikte
 * satırlar 44px.
 */
export function Tree(props: TreeProps) {
  const {
    selectable = true,
    multiple = false,
    checkable = false,
    checkStrictly = false,
    loadData,
    expandAction = false,
    showLine = false,
    blockNode = false,
    searchValue,
    titleRender,
    notFoundContent = "Sonuç bulunamadı",
    className,
    skeleton = false,
  } = props;
  const baseId = useId();
  const state = useTreeState(props);
  const { index, visible, expandedSet } = state;
  const [loadingKeys, setLoadingKeys] = useState<ReadonlySet<string>>(new Set());
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const moveFocus = useRef(false);

  const lazy = Boolean(loadData);
  const canExpand = (node: TreeNode) => isExpandable(node, lazy);
  const domId = (key: string) => `${baseId}-${key}`;

  const activeKey = resolveActiveKey(focusKey, visible, index, state.selected);

  useEffect(() => {
    if (!moveFocus.current || !activeKey) return;
    moveFocus.current = false;
    document.getElementById(domId(activeKey))?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  const focusNode = (key: string) => {
    moveFocus.current = true;
    setFocusKey(key);
  };

  const setOpen = (node: TreeNode, open: boolean) => {
    const next = open ? [...new Set([...state.expanded, node.key])] : state.expanded.filter((k) => k !== node.key);
    state.setExpanded(next);
    props.onExpand?.(next, { node, expanded: open });
    if (open && loadData && node.children === undefined && !node.isLeaf && !loadingKeys.has(node.key)) {
      setLoadingKeys((s) => new Set(s).add(node.key));
      loadData(node)
        .catch(() => state.setExpanded(state.expanded.filter((k) => k !== node.key)))
        .finally(() =>
          setLoadingKeys((s) => {
            const n = new Set(s);
            n.delete(node.key);
            return n;
          })
        );
    }
  };

  const toggleOpen = (node: TreeNode) => setOpen(node, !expandedSet.has(node.key));

  const nodeSelectable = (node: TreeNode) => selectable && node.selectable !== false && !node.disabled;
  const nodeCheckable = (node: TreeNode) => checkable && node.checkable !== false;

  const select = (node: TreeNode) => {
    if (!nodeSelectable(node)) return;
    const isSelected = state.selected.includes(node.key);
    let next: string[];
    if (multiple) next = isSelected ? state.selected.filter((k) => k !== node.key) : [...state.selected, node.key];
    else next = isSelected ? [] : [node.key];
    state.setSelected(next);
    props.onSelect?.(next, { node, selected: !isSelected });
  };

  const check = (node: TreeNode) => {
    if (!nodeCheckable(node) || node.disabled || node.disableCheckbox) return;
    const checked = !state.checkInfo.checked.includes(node.key);
    const info = toggleCheck(state.checkInfo.checked, node.key, checked, index, checkStrictly);
    state.setRawChecked(info.checked);
    props.onCheck?.(info.checked, { node, checked, halfCheckedKeys: info.halfChecked });
  };

  const activate = (node: TreeNode) => {
    if (nodeSelectable(node)) select(node);
    else if (nodeCheckable(node)) check(node);
    if (expandAction === "click" && canExpand(node)) toggleOpen(node);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    // Durumdaki odak değil, olayın geldiği düğüm: odak ve tuş aynı karede gelirse state henüz güncellenmemiş olabilir.
    const currentKey = (event.target as HTMLElement).closest<HTMLElement>("[role=treeitem]")?.dataset.key ?? activeKey;
    const node = currentKey ? index.get(currentKey)?.node : undefined;
    if (!currentKey || !node) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (event.key === " " && nodeCheckable(node)) check(node);
      else if (!node.disabled) activate(node);
      return;
    }
    const action = getKeyAction(visible, currentKey, event.key, (k) => expandedSet.has(k), canExpand);
    if (!action) return;
    event.preventDefault();
    if (action.type === "focus") focusNode(action.key);
    else if (action.type === "expand") setOpen(node, true);
    else if (action.type === "collapse") setOpen(node, false);
    else {
      const next = [...new Set([...state.expanded, ...action.keys])];
      state.setExpanded(next);
      props.onExpand?.(next, { node, expanded: true });
    }
  };

  const checkedSet = new Set(state.checkInfo.checked);
  const halfSet = new Set(state.checkInfo.halfChecked);

  if (skeleton && props.treeData.length === 0) return <Placeholders />;
  if (visible.length === 0) {
    return <div className={cn("px-2 py-3 text-sm text-mari-muted", className)}>{searchValue ? notFoundContent : null}</div>;
  }

  return (
    // Tuşlar treeitem'lerden kabarcıklanır (APG: odak treeitem'de).
    <div
      role={skeleton ? undefined : "tree"}
      aria-label={skeleton ? undefined : props["aria-label"]}
      aria-labelledby={skeleton ? undefined : props["aria-labelledby"]}
      aria-multiselectable={!skeleton && selectable && multiple ? true : undefined}
      aria-hidden={skeleton || undefined}
      aria-busy={skeleton || undefined}
      data-skeleton={skeleton ? "" : undefined}
      onKeyDown={skeleton ? undefined : onKeyDown}
      className={cn("flex flex-col text-sm", skeleton && "pointer-events-none select-none", className)}
    >
      {visible.map((entry) => {
        const { node } = entry;
        const checkState = nodeCheckable(node) ? getCheckState(node.key, checkedSet, halfSet) : null;
        return (
          <Row
            key={node.key}
            entry={entry}
            id={domId(node.key)}
            focused={node.key === activeKey}
            open={expandedSet.has(node.key)}
            expandable={canExpand(node)}
            loading={loadingKeys.has(node.key)}
            selected={state.selected.includes(node.key)}
            selectable={selectable && node.selectable !== false}
            checkState={checkState}
            showLine={showLine}
            blockNode={blockNode}
            searchValue={searchValue}
            titleRender={titleRender}
            skeleton={skeleton}
            onToggle={() => {
              focusNode(node.key);
              toggleOpen(node);
            }}
            onCheck={() => {
              focusNode(node.key);
              check(node);
            }}
            onActivate={() => {
              focusNode(node.key);
              activate(node);
            }}
            onDoubleActivate={() => {
              if (expandAction === "doubleClick" && canExpand(node)) toggleOpen(node);
            }}
            onFocus={() => setFocusKey(node.key)}
          />
        );
      })}
    </div>
  );
}
