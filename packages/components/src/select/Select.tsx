"use client";

import React, { useId, useRef } from "react";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { ClearButton } from "../input/_components/FieldAdornments";
import { FIELD_BASE_CLASS, FIELD_DISABLED_CLASS, FIELD_MOBILE_TEXT_CLASS, getShapeClasses, getVariantClasses } from "../input/utils";
import { skeletonBoxProps } from "../lib/skeleton";
import { sizeClass, touchTargetClass } from "../lib/sizeClasses";
import { useFloatingPosition } from "../lib/useFloatingPosition";
import { Tag } from "../tag";
import { optionDomId, SelectPanel } from "./_components/SelectPanel";
import type { SelectMultipleProps, SelectOption, SelectProps } from "./types";
import { useSelectState, type SelectState } from "./useSelectState";

export type { SelectProps };

const GAP_PX = 4;

/** Çoklu modda kutu sabit yükseklik değil, en az o yükseklik — etiketler satırlara sarar. */
const MULTI_HEIGHT_CLASS = { sm: "h-auto min-h-6 py-0.5", md: "h-auto min-h-8 py-1", lg: "h-auto min-h-10 py-1.5" } as const;

function optionLabel(option: SelectOption): React.ReactNode {
  return option.label ?? option.value;
}

/** Aramasız tetikleyicide görünen metin: seçilen (tekli), hiç seçim yokken yer tutucu; çokluda etiketler kendini gösterir. */
function buttonText(single: SelectOption | undefined, hasValue: boolean, placeholder: string): React.ReactNode {
  if (single) return optionLabel(single);
  if (!hasValue) return <span className="truncate text-mari-muted">{placeholder}</span>;
  return null;
}

type KeyHandler = (e: React.KeyboardEvent, state: SelectState, searchable: boolean) => void;

const onArrow: KeyHandler = (e, state) => {
  e.preventDefault();
  const down = e.key === "ArrowDown";
  if (!state.open) state.openAt(!down && !e.altKey ? "last" : "selected");
  else state.move(down ? 1 : -1);
};

const onEdge: KeyHandler = (e, state, searchable) => {
  // Arama kutusunda Home/End imleci taşır.
  if (!state.open || searchable) return;
  e.preventDefault();
  state.setActiveIndex(e.key === "Home" ? state.visibleOptions.findIndex((o) => !o.disabled) : state.visibleOptions.length - 1);
};

const onConfirm: KeyHandler = (e, state, searchable) => {
  // Arama kutusunda boşluk bir karakterdir.
  if (e.key === " " && searchable) return;
  e.preventDefault();
  if (!state.open) state.openAt();
  else if (state.activeOption) state.pick(state.activeOption);
};

const onEscape: KeyHandler = (e, state) => {
  if (!state.open) return;
  e.preventDefault();
  state.setOpen(false);
};

// APG: Tab tekli seçimde aktif seçeneği onaylar ve listeyi kapatır; odak normal akışla ilerler.
const onTab: KeyHandler = (_e, state) => {
  if (!state.open) return;
  if (!state.multiple && state.activeOption) state.pick(state.activeOption);
  else state.setOpen(false);
};

const onBackspace: KeyHandler = (_e, state, searchable) => {
  if (searchable && state.multiple && !state.search && state.values.length > 0) state.removeValue(state.values.at(-1)!);
};

const KEY_HANDLERS: Partial<Record<string, KeyHandler>> = {
  ArrowDown: onArrow,
  ArrowUp: onArrow,
  Home: onEdge,
  End: onEdge,
  Enter: onConfirm,
  " ": onConfirm,
  Escape: onEscape,
  Tab: onTab,
  Backspace: onBackspace,
};

/** Tetikleyicideki tuşlar (APG combobox). Arama kutusu varsa harfler kutuya yazılır, yoksa harfle atlama. */
function handleTriggerKey(e: React.KeyboardEvent, state: SelectState, searchable: boolean) {
  const handler = KEY_HANDLERS[e.key];
  if (handler) handler(e, state, searchable);
  else if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) state.typeChar(e.key);
}

function SelectTags({ state, maxTagCount, disabled }: { state: SelectState; maxTagCount?: number; disabled: boolean }) {
  const shown = maxTagCount === undefined ? state.selectedOptions : state.selectedOptions.slice(0, maxTagCount);
  const hidden = state.selectedOptions.length - shown.length;
  return (
    <>
      {shown.map((option) => {
        const label = optionLabel(option);
        return (
          <Tag
            key={String(option.value)}
            onClose={disabled ? undefined : () => state.removeValue(option.value)}
            closeLabel={typeof label === "string" ? `${label} seçimini kaldır` : "Seçimi kaldır"}
            className="max-w-full"
          >
            {label}
          </Tag>
        );
      })}
      {hidden > 0 && <Tag>+{hidden}</Tag>}
    </>
  );
}

function SelectSuffix({ loading, open }: { loading: boolean; open: boolean }) {
  return (
    <span aria-hidden className="flex shrink-0 items-center text-mari-muted">
      {loading ? (
        <Loader2Icon size={16} className="animate-spin motion-reduce:animate-[spin_2s_linear_infinite]" />
      ) : (
        <ChevronDownIcon size={16} className={cn("transition-transform duration-150 motion-reduce:transition-none", open && "rotate-180")} />
      )}
    </span>
  );
}

/**
 * Faz 16.1 — yapı/davranış ant.design Select'ten, görünüm Input'la birebir
 * aynı (boyut, varyant, kenarlık, odak halkası, dokunma hedefi `lib`
 * paylaşımlı). Tekli ve çoklu (`mode="multiple"`, etiketler) seçim, gruplar,
 * arama (`showSearch`, Türkçe/aksansız), temizleme, yükleniyor, `skeleton`.
 *
 * Erişilebilirlik (APG combobox): arama yoksa tetikleyici `<button
 * role="combobox">` (label `htmlFor` ile bağlanabilir, native disabled),
 * aramada `<input role="combobox">`. Odak HİÇ listeye geçmez; aktif seçenek
 * `aria-activedescendant`. ↑/↓/Home/End, Enter/Boşluk, Escape, Tab (seçip
 * geçer), harfle atlama; çokluda Backspace son etiketi siler.
 */
export function Select(props: SelectProps) {
  const {
    placeholder = "Seçin",
    showSearch = false,
    allowClear = false,
    clearLabel = "Temizle",
    loading = false,
    notFoundContent = "Sonuç bulunamadı",
    disabled = false,
    size = "md",
    variant = "outline",
    shape = "default",
    color,
    placement = "bottom-start",
    listHeight = "16rem",
    optionRender,
    id,
    name,
    required,
    className,
    skeleton = false,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
  } = props;
  const maxTagCount = props.mode === "multiple" ? (props as SelectMultipleProps).maxTagCount : undefined;

  const state = useSelectState(props);
  const { multiple, open, values, selectedOptions, search } = state;
  const anchorRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement & HTMLInputElement>(null);
  const listboxId = useId();
  const coords = useFloatingPosition(open, anchorRef, panelRef, { placement, gap: GAP_PX });

  // Klavyeyle gezinirken aktif satır listenin görünür alanında kalsın.
  React.useEffect(() => {
    if (open && state.activeOption) document.getElementById(optionDomId(listboxId, state.activeOption))?.scrollIntoView?.({ block: "nearest" });
  }, [open, state.activeOption, listboxId]);

  const geometry = cn("flex w-full items-center gap-2", sizeClass[size], multiple && MULTI_HEIGHT_CLASS[size], getShapeClasses(shape, variant));
  if (skeleton) return <div {...skeletonBoxProps(cn(geometry, className))} />;

  const hasValue = values.length > 0;
  const showClear = allowClear && hasValue && !disabled;
  const single = multiple ? undefined : selectedOptions[0];

  const comboboxProps = {
    id,
    role: "combobox" as const,
    "aria-expanded": open,
    "aria-controls": open ? listboxId : undefined,
    "aria-haspopup": "listbox" as const,
    "aria-activedescendant": open && state.activeOption ? optionDomId(listboxId, state.activeOption) : undefined,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "aria-required": required || undefined,
    "aria-invalid": color === "error" || undefined,
    disabled,
    onKeyDown: (e: React.KeyboardEvent) => handleTriggerKey(e, state, showSearch),
    onBlur: (e: React.FocusEvent) => {
      // Odak kutunun içindeki bir düğmeye (temizle, etiket sil) geçtiyse kapatma.
      if (!anchorRef.current?.contains(e.relatedTarget as Node | null)) state.setOpen(false);
    },
  };

  // Kutunun herhangi bir yerine tıklamak odaklar ve açar/kapatır; iç düğmeler kendi işini yapar.
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
        className={cn(
          geometry,
          "group relative cursor-pointer",
          touchTargetClass[size],
          FIELD_BASE_CLASS,
          getVariantClasses(variant, color),
          disabled && FIELD_DISABLED_CLASS,
          className
        )}
      >
        <div className={cn("flex min-w-0 flex-1 items-center gap-1", multiple && "flex-wrap")}>
          {multiple && <SelectTags state={state} maxTagCount={maxTagCount} disabled={disabled} />}
          {showSearch ? (
            <span className="relative flex min-w-[4ch] flex-1 items-center">
              {/* Tekli seçimde seçili değer, yazmaya başlayınca kaybolur. Yer tutucu native `placeholder`
                  (Input gibi) — ayrı bir span olsaydı devre dışı alanda axe onu kontrast ihlali sayıyordu. */}
              {!search && single && (
                <span aria-hidden className="pointer-events-none absolute inset-x-0 truncate">
                  {optionLabel(single)}
                </span>
              )}
              <input
                ref={controlRef}
                {...comboboxProps}
                type="text"
                aria-autocomplete="list"
                autoComplete="off"
                placeholder={hasValue ? undefined : placeholder}
                value={search}
                onChange={(e) => {
                  state.setSearch(e.target.value);
                  state.setOpen(true);
                }}
                className={cn("w-full min-w-0 bg-transparent placeholder:text-mari-muted focus:outline-none disabled:cursor-not-allowed", FIELD_MOBILE_TEXT_CLASS)}
              />
            </span>
          ) : (
            <button ref={controlRef} type="button" {...comboboxProps} className={cn("min-w-0 flex-1 truncate text-left focus:outline-none", FIELD_MOBILE_TEXT_CLASS)}>
              {buttonText(single, hasValue, placeholder)}
            </button>
          )}
        </div>

        {allowClear && (
          <ClearButton
            visible={showClear}
            label={clearLabel}
            onClear={() => {
              state.clear();
              controlRef.current?.focus();
            }}
          />
        )}
        <SelectSuffix loading={loading} open={open} />

        {name && (multiple ? values : values.slice(0, 1)).map((v) => <input key={String(v)} type="hidden" name={name} value={String(v)} />)}
      </div>

      {open && (
        <SelectPanel
          ref={panelRef}
          listboxId={listboxId}
          coords={coords}
          sections={state.sections}
          flatOptions={state.visibleOptions}
          activeIndex={state.activeIndex}
          isSelected={state.isSelected}
          multiple={multiple}
          loading={loading}
          notFoundContent={notFoundContent}
          listHeight={listHeight}
          optionRender={optionRender}
          labelledBy={ariaLabelledBy}
          label={ariaLabel}
          onPick={(option) => {
            state.pick(option);
            controlRef.current?.focus();
          }}
          onHover={state.setActiveIndex}
        />
      )}
    </>
  );
}
