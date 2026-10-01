"use client";

import React, { useId, useRef } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { ClearButton } from "../input/_components/FieldAdornments";
import { FIELD_BASE_CLASS, FIELD_DISABLED_CLASS, FIELD_MOBILE_TEXT_CLASS, getShapeClasses, getVariantClasses } from "../input/utils";
import { useFieldControl } from "../lib/fieldContext";
import { skeletonBoxProps } from "../lib/skeleton";
import { sizeClass, touchTargetClass } from "../lib/sizeClasses";
import { useFloatingPosition } from "../lib/useFloatingPosition";
import { Tag } from "../tag";
import { getKeyAction, nodeText } from "../tree/utils";
import { nodeDomId, TreeSelectPanel } from "./_components/TreeSelectPanel";
import type { TreeSelectMultipleProps, TreeSelectProps } from "./types";
import { useTreeSelectState, type TreeSelectState } from "./useTreeSelectState";
import { isPickable } from "./utils";

export type { TreeSelectProps };

const GAP_PX = 4;
const MULTI_HEIGHT_CLASS = { sm: "h-auto min-h-6 py-0.5", md: "h-auto min-h-8 py-1", lg: "h-auto min-h-10 py-1.5" } as const;

/** Enter (ve aramasızken Boşluk): kapalıysa açar; açıksa aktif düğümü seçer/işaretler, seçilemiyorsa açar/kapatır. */
function confirm(state: TreeSelectState) {
  if (!state.open) return state.openAt();
  const entry = state.visible.find((v) => v.node.key === state.activeKey);
  if (!entry) return;
  if (isPickable(entry.node, state.checkable)) state.pick(entry.node);
  else if (state.canExpand(entry.node)) state.toggleExpand(entry.node.key);
}

/** Ağaç gezinmesi (APG tree tuşları), odak combobox'ta kalarak. `true` → tuş işlendi. */
function navigate(e: React.KeyboardEvent, state: TreeSelectState, searchable: boolean): boolean {
  const key = e.key;
  const caretKeys = key === "Home" || key === "End" || key.length === 1;
  // Arama kutusunda harfler/Home/End metne aittir.
  if (searchable && caretKeys) return false;
  if (state.activeKey === null) return false;
  const action = getKeyAction(state.visible, state.activeKey, key, (k) => state.expanded.has(k), state.canExpand);
  if (!action) return key.startsWith("Arrow");
  if (action.type === "focus") state.setActiveKey(action.key);
  else if (action.type === "expand") state.toggleExpand(action.key, true);
  else if (action.type === "collapse") state.toggleExpand(action.key, false);
  else state.expandMany(action.keys);
  return true;
}

function handleKey(e: React.KeyboardEvent, state: TreeSelectState, searchable: boolean) {
  const { key } = e;
  if (key === "Escape") {
    if (state.open) {
      e.preventDefault();
      state.setOpen(false);
    }
    return;
  }
  if (key === "Tab") return state.setOpen(false);
  if (key === "Enter" || (key === " " && !searchable)) {
    e.preventDefault();
    return confirm(state);
  }
  if (key === "Backspace") {
    if (searchable && state.multiple && !state.search && state.values.length > 0) state.remove(state.selectedNodes.at(-1)!.key);
    return;
  }
  if (!state.open) {
    if (key === "ArrowDown" || key === "ArrowUp") {
      e.preventDefault();
      state.openAt();
    }
    return;
  }
  if (navigate(e, state, searchable)) e.preventDefault();
}

function Tags({ state, maxTagCount, disabled }: { state: TreeSelectState; maxTagCount?: number; disabled: boolean }) {
  const nodes = state.selectedNodes;
  const shown = maxTagCount === undefined ? nodes : nodes.slice(0, maxTagCount);
  const hidden = nodes.length - shown.length;
  return (
    <>
      {shown.map((node) => {
        const text = nodeText(node);
        return (
          <Tag
            key={node.key}
            onClose={disabled || node.disabled ? undefined : () => state.remove(node.key)}
            closeLabel={text ? `${text} seçimini kaldır` : "Seçimi kaldır"}
            className="max-w-full"
          >
            {node.title}
          </Tag>
        );
      })}
      {hidden > 0 && <Tag>+{hidden}</Tag>}
    </>
  );
}

interface TriggerControlProps {
  controlRef: React.RefObject<HTMLButtonElement & HTMLInputElement | null>;
  comboboxProps: Record<string, unknown>;
  state: TreeSelectState;
  searchable: boolean;
  placeholder: string;
}

/** Aramalıda `<input role="combobox">` (seçili değer yazana dek üstünde), aramasızda `<button role="combobox">`. */
function TriggerControl({ controlRef, comboboxProps, state, searchable, placeholder }: TriggerControlProps) {
  const single = state.multiple ? undefined : state.selectedNodes[0];
  const hasValue = state.values.length > 0;
  if (!searchable) {
    return (
      <button ref={controlRef} type="button" {...comboboxProps} className={cn("min-w-0 flex-1 truncate text-left focus:outline-none", FIELD_MOBILE_TEXT_CLASS)}>
        {single ? single.title : !hasValue && <span className="truncate text-mari-muted">{placeholder}</span>}
      </button>
    );
  }
  return (
    <span className="relative flex min-w-[4ch] flex-1 items-center">
      {!state.search && single && (
        <span aria-hidden className="pointer-events-none absolute inset-x-0 truncate">
          {single.title}
        </span>
      )}
      <input
        ref={controlRef}
        {...comboboxProps}
        type="text"
        aria-autocomplete="list"
        autoComplete="off"
        placeholder={hasValue ? undefined : placeholder}
        value={state.search}
        onChange={(e) => {
          state.setSearch(e.target.value);
          if (!state.open) state.setOpen(true);
        }}
        className={cn("w-full min-w-0 bg-transparent placeholder:text-mari-muted focus:outline-none disabled:cursor-not-allowed", FIELD_MOBILE_TEXT_CLASS)}
      />
    </span>
  );
}

/**
 * Faz 16.4 — yapı ant.design TreeSelect'ten: Select'in tetikleyicisi (boyut,
 * varyant, etiketler, arama, temizle — birebir aynı görünüm) + açılır panelde
 * ağaç. Saf mantık Tree ile ortak (`tree/utils`: indeks, görünür düğümler,
 * işaret yayılımı, Türkçe arama, APG tuşları). Modlar: tekli, `multiple`,
 * `checkable` (onay kutuları + `showCheckedStrategy`).
 *
 * Erişilebilirlik (APG combobox + tree popup): tetikleyici `role="combobox"`
 * `aria-haspopup="tree"`; odak HİÇ panele geçmez, aktif düğüm
 * `aria-activedescendant`. ↑/↓ gezinir, → açar/ilk çocuğa iner, ← kapatır/
 * ebeveyne çıkar, Enter seçer (açılamayan düğümde dalı açar), Escape kapatır;
 * aramasızken Home/End, `*` ve harfle atlama.
 */
export function TreeSelect(outerProps: TreeSelectProps) {
  const props = useFieldControl(outerProps) as TreeSelectProps;
  const {
    placeholder = "Seçin",
    showSearch = false,
    allowClear = false,
    clearLabel = "Temizle",
    notFoundContent = "Sonuç bulunamadı",
    disabled = false,
    size = "md",
    variant = "outline",
    shape = "default",
    color,
    placement = "bottom-start",
    listHeight = "16rem",
    treeLine = false,
    titleRender,
    id,
    name,
    required,
    className,
    skeleton = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  } = props;
  const maxTagCount = props.mode ? (props as TreeSelectMultipleProps).maxTagCount : undefined;

  const state = useTreeSelectState(props);
  const { multiple, open, values } = state;
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement & HTMLInputElement>(null);
  const treeId = useId();
  const coords = useFloatingPosition(open, anchorRef, panelRef, { placement, gap: GAP_PX });

  React.useEffect(() => {
    if (open && state.activeKey !== null) document.getElementById(nodeDomId(treeId, state.activeKey))?.scrollIntoView?.({ block: "nearest" });
  }, [open, state.activeKey, treeId]);

  const geometry = cn("flex w-full items-center gap-2", sizeClass[size], multiple && MULTI_HEIGHT_CLASS[size], getShapeClasses(shape, variant));
  if (skeleton) return <div {...skeletonBoxProps(cn(geometry, className))} />;

  const hasValue = values.length > 0;

  const comboboxProps = {
    id,
    role: "combobox" as const,
    "aria-expanded": open,
    "aria-controls": open ? treeId : undefined,
    "aria-haspopup": "tree" as const,
    "aria-activedescendant": open && state.activeKey !== null ? nodeDomId(treeId, state.activeKey) : undefined,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-required": required || undefined,
    "aria-invalid": color === "error" || undefined,
    disabled,
    onKeyDown: (e: React.KeyboardEvent) => handleKey(e, state, showSearch),
    onBlur: (e: React.FocusEvent) => {
      if (!anchorRef.current?.contains(e.relatedTarget as Node | null)) state.setOpen(false);
    },
  };

  const handleBoxMouseDown = (e: React.MouseEvent) => {
    if (disabled || (e.target as HTMLElement).closest("button:not([role=combobox])")) return;
    e.preventDefault();
    controlRef.current?.focus();
    if (open) state.setOpen(false);
    else state.openAt();
  };

  return (
    <>
      {/* Fare kısayolu; klavye kullanıcısı doğrudan combobox'a sekmeyle gelir. */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div
        ref={anchorRef}
        onMouseDown={handleBoxMouseDown}
        className={cn(geometry, "group relative cursor-pointer", touchTargetClass[size], FIELD_BASE_CLASS, getVariantClasses(variant, color), disabled && FIELD_DISABLED_CLASS, className)}
      >
        <div className={cn("flex min-w-0 flex-1 items-center gap-1", multiple && "flex-wrap")}>
          {multiple && <Tags state={state} maxTagCount={maxTagCount} disabled={disabled} />}
          <TriggerControl controlRef={controlRef} comboboxProps={comboboxProps} state={state} searchable={showSearch} placeholder={placeholder} />
        </div>

        {allowClear && (
          <ClearButton
            visible={hasValue && !disabled}
            label={clearLabel}
            onClear={() => {
              state.clear();
              controlRef.current?.focus();
            }}
          />
        )}
        <span aria-hidden className="flex shrink-0 items-center text-mari-muted">
          <ChevronDownIcon size={16} className={cn("transition-transform duration-150 motion-reduce:transition-none", open && "rotate-180")} />
        </span>

        {name && (multiple ? values : values.slice(0, 1)).map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      </div>

      {open && (
        <TreeSelectPanel
          ref={panelRef}
          treeId={treeId}
          coords={coords}
          state={state}
          notFoundContent={notFoundContent}
          listHeight={listHeight}
          treeLine={treeLine}
          titleRender={titleRender}
          labelledBy={ariaLabelledBy}
          label={ariaLabel ?? placeholder}
        />
      )}
    </>
  );
}
