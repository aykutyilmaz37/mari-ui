"use client";

import React, { forwardRef } from "react";
import { createPortal } from "react-dom";
import { CheckIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { elevationClass } from "../../lib/elevationClass";
import type { FloatingCoords } from "../../lib/useFloatingPosition";
import { CheckboxBox, Indent, Switcher, Title, type CheckState } from "../../tree/Tree";
import type { VisibleNode } from "../../tree/utils";
import type { TreeSelectProps } from "../types";
import type { TreeSelectState } from "../useTreeSelectState";
import { isPickable } from "../utils";

interface TreeSelectPanelProps {
  treeId: string;
  coords: FloatingCoords | null;
  state: TreeSelectState;
  notFoundContent: React.ReactNode;
  listHeight: string;
  treeLine: boolean;
  titleRender?: Exclude<TreeSelectProps["titleRender"], undefined>;
  labelledBy?: string;
  label?: string;
}

/** `aria-activedescendant` için DOM id'si (anahtar her karakteri içerebilir). */
export const nodeDomId = (treeId: string, key: string) => `${treeId}-${encodeURIComponent(key).replace(/[^\w-]/g, "_")}`;

function checkStateOf(state: TreeSelectState, key: string): CheckState {
  if (state.isSelected(key)) return "checked";
  return state.isHalf(key) ? "mixed" : "unchecked";
}

function Row({ entry, state, treeId, treeLine, titleRender }: Readonly<{ entry: VisibleNode; state: TreeSelectState; treeId: string; treeLine: boolean; titleRender?: Exclude<TreeSelectProps["titleRender"], undefined> }>) {
  const { node, level } = entry;
  const key = node.key;
  const expandable = state.canExpand(node);
  const open = expandable && state.expanded.has(key);
  const selected = state.isSelected(key);
  const active = state.activeKey === key;
  const pickable = isPickable(node, state.checkable);
  const checkState = state.checkable && node.checkable !== false ? checkStateOf(state, key) : null;
  const searchValue = state.searchResult ? state.search : undefined;
  const loading = state.isLoading(key);
  const dim = node.disabled || (!pickable && !expandable);

  let checked: boolean | "mixed" | undefined;
  if (checkState) checked = checkState === "mixed" ? "mixed" : checkState === "checked";

  return (
    // Odak tetikleyicide (combobox) kalır; satır `aria-activedescendant` ile gösterilir (APG). Klavye combobox'ta.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      id={nodeDomId(treeId, key)}
      role="treeitem"
      tabIndex={-1}
      aria-level={level}
      aria-posinset={entry.posinset}
      aria-setsize={entry.setsize}
      aria-expanded={expandable ? open : undefined}
      aria-selected={state.checkable ? undefined : selected}
      aria-checked={checked}
      aria-disabled={node.disabled || undefined}
      aria-busy={loading || undefined}
      onMouseMove={() => !active && state.setActiveKey(key)}
      onClick={() => {
        if (pickable) state.pick(node);
        else if (expandable) state.toggleExpand(key);
      }}
      className={cn(
        "flex min-h-8 cursor-pointer items-center rounded-md pr-2 text-mari-foreground pointer-coarse:min-h-11",
        active && "bg-mari-surface-alt",
        selected && !state.multiple && "bg-mari-primary-subtle font-medium",
        dim && "cursor-not-allowed text-mari-muted"
      )}
    >
      <Indent level={level} showLine={treeLine} />
      <Switcher open={open} expandable={expandable} loading={loading} skeleton={false} onToggle={() => state.toggleExpand(key)} />
      {checkState && <CheckboxBox state={checkState} disabled={!pickable} onClick={() => undefined} />}
      {node.icon && (
        <span aria-hidden className="mr-1.5 flex shrink-0 items-center text-mari-muted [&_svg]:size-4">
          {node.icon}
        </span>
      )}
      <span className="min-w-0 flex-1 truncate leading-6">
        <Title node={node} searchValue={searchValue} titleRender={titleRender} />
      </span>
      {state.mode === "multiple" && <CheckIcon size={16} aria-hidden className={cn("ml-2 shrink-0 text-mari-primary", !selected && "invisible")} />}
    </div>
  );
}

/**
 * TreeSelect paneli: `document.body`'ye portal, konum
 * `useFloatingPosition` (Select ile ortak), genişlik en az tetikleyicininki.
 * Satır görünümü Tree'nin parçalarıyla (girinti, açma oku, onay kutusu, arama
 * vurgusu). Panelde `mousedown` engellenir — tıklamak combobox'un odağını
 * (dolayısıyla açık paneli) kaybettirmesin.
 */
export const TreeSelectPanel = forwardRef<HTMLDivElement, TreeSelectPanelProps>(function TreeSelectPanel(
  { treeId, coords, state, notFoundContent, listHeight, treeLine, titleRender, labelledBy, label },
  ref
) {
  if (typeof document === "undefined") return null;
  return createPortal(
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions -- yalnız odak kaybını önler, etkileşim değil
    <div
      ref={ref}
      onMouseDown={(e) => e.preventDefault()}
      className={cn("fixed z-mari-dropdown max-w-[calc(100vw-1rem)] rounded-lg bg-mari-surface p-1 text-sm", elevationClass.md, !coords && "invisible")}
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0, minWidth: coords?.anchorWidth }}
    >
      <div
        id={treeId}
        role="tree"
        aria-multiselectable={state.multiple || undefined}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        className="overflow-y-auto overscroll-contain"
        style={{ maxHeight: listHeight }}
      >
        {state.visible.map((entry) => (
          <Row key={entry.node.key} entry={entry} state={state} treeId={treeId} treeLine={treeLine} titleRender={titleRender} />
        ))}
      </div>
      {state.visible.length === 0 && (
        <div role="status" className="px-2.5 py-2 text-mari-muted">
          {notFoundContent}
        </div>
      )}
    </div>,
    document.body
  );
});
