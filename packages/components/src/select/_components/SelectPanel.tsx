"use client";

import React, { forwardRef, useId } from "react";
import { createPortal } from "react-dom";
import { CheckIcon, Loader2Icon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { elevationClass } from "../../lib/elevationClass";
import type { FloatingCoords } from "../../lib/useFloatingPosition";
import type { SelectOption, SelectProps } from "../types";
import { type SelectSection, valueKey } from "../utils";

interface SelectPanelProps {
  listboxId: string;
  coords: FloatingCoords | null;
  sections: SelectSection[];
  /** `sections`taki seçeneklerin düz sırası — aktif indeks buna göre. */
  flatOptions: SelectOption[];
  activeIndex: number;
  isSelected: (option: SelectOption) => boolean;
  multiple: boolean;
  loading: boolean;
  notFoundContent: React.ReactNode;
  listHeight: string;
  optionRender?: Exclude<SelectProps["optionRender"], undefined>;
  labelledBy?: string;
  label?: string;
  onPick: (option: SelectOption) => void;
  onHover: (index: number) => void;
}

export const optionDomId = (listboxId: string, option: SelectOption) => `${listboxId}-${valueKey(option.value).replace(/[^\w-]/g, "_")}`;

function OptionContent({ option, selected, multiple }: Readonly<{ option: SelectOption; selected: boolean; multiple: boolean }>) {
  return (
    <>
      {option.icon && <span className="flex shrink-0 items-center text-mari-muted [&>svg]:size-4">{option.icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block truncate">{option.label ?? option.value}</span>
        {option.description && <span className="block truncate text-xs text-mari-muted">{option.description}</span>}
      </span>
      {/* Tekli seçimde seçili satır zeminle belli; çokluda onay işareti durumu taşır. */}
      {multiple && <CheckIcon size={16} aria-hidden className={cn("shrink-0 text-mari-primary", !selected && "invisible")} />}
    </>
  );
}

/**
 * Select'in listesi. `document.body`'ye portal edilir, konum
 * `useFloatingPosition`dan (Dropdown ile ortak); genişlik tetikleyicininki. Odak listede DEĞİL tetikleyicide
 * kalır; aktif seçenek `aria-activedescendant` ile bildirilir (APG combobox).
 * Seçenekler `onMouseDown` ile `preventDefault` — tıklamak tetikleyicinin
 * odağını (dolayısıyla açık listeyi) kaybettirmesin.
 */
export const SelectPanel = /* @__PURE__ */ forwardRef<HTMLDivElement, SelectPanelProps>(function SelectPanel(
  { listboxId, coords, sections, flatOptions, activeIndex, isSelected, multiple, loading, notFoundContent, listHeight, optionRender, labelledBy, label, onPick, onHover },
  ref
) {
  const groupIdBase = useId();
  if (typeof document === "undefined") return null;
  const empty = flatOptions.length === 0;

  const renderOption = (option: SelectOption) => {
    const index = flatOptions.indexOf(option);
    const selected = isSelected(option);
    const active = index === activeIndex;
    return (
      // Klavye tetikleyicide (combobox) işlenir; seçenek odak almaz, `aria-activedescendant` ile gösterilir (APG).
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        key={valueKey(option.value)}
        id={optionDomId(listboxId, option)}
        role="option"
        tabIndex={-1}
        aria-selected={selected}
        aria-disabled={option.disabled || undefined}
        onMouseDown={(e) => e.preventDefault()}
        onMouseMove={() => !active && !option.disabled && onHover(index)}
        onClick={() => !option.disabled && onPick(option)}
        className={cn(
          "flex min-h-8 cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-mari-foreground pointer-coarse:min-h-11",
          active && "bg-mari-surface-alt",
          selected && !multiple && "bg-mari-primary-subtle font-medium",
          option.disabled && "cursor-not-allowed opacity-50"
        )}
      >
        {optionRender ? optionRender(option, { selected, active }) : <OptionContent option={option} selected={selected} multiple={multiple} />}
      </div>
    );
  };

  return createPortal(
    <div
      ref={ref}
      className={cn("fixed z-mari-dropdown max-w-[calc(100vw-1rem)] rounded-lg bg-mari-surface p-1 text-sm", elevationClass.md, !coords && "invisible")}
      style={{ top: coords?.top ?? 0, left: coords?.left ?? 0, width: coords?.anchorWidth }}
    >
      <div
        id={listboxId}
        role="listbox"
        aria-multiselectable={multiple || undefined}
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : label}
        aria-busy={loading || undefined}
        className="overflow-y-auto overscroll-contain"
        style={{ maxHeight: listHeight }}
      >
        {sections.map((section) =>
          section.label === undefined ? (
            <React.Fragment key={section.key}>{section.options.map(renderOption)}</React.Fragment>
          ) : (
            <div key={section.key} role="group" aria-labelledby={`${groupIdBase}-${section.key}`}>
              <div id={`${groupIdBase}-${section.key}`} role="presentation" className="px-2.5 pb-1 pt-2 text-xs font-medium text-mari-muted">
                {section.label}
              </div>
              {section.options.map(renderOption)}
            </div>
          )
        )}
      </div>
      {loading && (
        <div role="status" className="flex items-center gap-2 px-2.5 py-2 text-mari-muted">
          <Loader2Icon size={16} aria-hidden className="animate-spin motion-reduce:animate-[spin_2s_linear_infinite]" />
          Yükleniyor
        </div>
      )}
      {!loading && empty && (
        <div role="status" className="px-2.5 py-2 text-mari-muted">
          {notFoundContent}
        </div>
      )}
    </div>,
    document.body
  );
});
