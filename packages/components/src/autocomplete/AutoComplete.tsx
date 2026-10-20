"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { cn, useControllableState } from "@mari-ui/core";
import { PlainInput } from "../input/PlainInput";
import { elevationClass } from "../lib/elevationClass";
import type { AutoCompleteProps } from "./types";
import { getFilteredOption, splitMatch } from "./utils";

export type { AutoCompleteProps };

function HighlightedValue({ value, searchText }: Readonly<{ value: string; searchText: string }>) {
  const parts = splitMatch(value, searchText);
  if (!parts) return <>{value}</>;
  return (
    <>
      {parts[0]}
      <mark className="bg-transparent font-semibold text-mari-foreground">{parts[1]}</mark>
      {parts[2]}
    </>
  );
}

/**
 * ARIA "combobox" deseni: `role="combobox"`/`listbox`/`option` +
 * Ok tuşları/Enter/Escape.
 *
 * Temizleme bir `<svg onClick>` idi — buton değildi, klavyeyle
 * erişilemiyordu ve alan boşken de görünüyordu → Input'un etiketli
 * `allowClear`'ı. Liste yükseklik sınırı yoktu (100 seçenek sayfayı uzatırdı);
 * klavyeyle gezinirken aktif seçenek görünür alana kaydırılır. Eşleşen kısım
 * kalın. Türkçe/aksansız arama (`foldForSearch`). `size`/`color`/`disabled`
 * artık geçirilebilir.
 */
export function AutoComplete({
  options,
  value,
  defaultValue = "",
  onSearch,
  onSelect,
  placeholder = "Ara",
  closeOnBlur = true,
  notFoundContent,
  size,
  color,
  disabled,
  id,
  name,
  "aria-label": ariaLabel,
  className,
  skeleton = false,
}: Readonly<AutoCompleteProps>) {
  const [searchText, setSearchText] = useControllableState<string>({ value, defaultValue, onChange: onSearch });
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listboxId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const filteredOptions = getFilteredOption(options, searchText);
  const showNotFound = filteredOptions.length === 0 && notFoundContent !== undefined && searchText.trim() !== "";
  const isOpen = isFocused && (filteredOptions.length > 0 || showNotFound);
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
  const optionId = (optId: number) => `${listboxId}-option-${optId}`;

  useEffect(() => {
    if (!activeOption) return;
    document.getElementById(optionId(activeOption.id))?.scrollIntoView?.({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnızca aktif seçenek değişince
  }, [activeOption?.id]);

  if (skeleton) return <PlainInput skeleton size={size} className={className} />;

  const handleSelect = (optionValue: string) => {
    setSearchText(optionValue);
    onSelect?.(optionValue);
    setIsFocused(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsFocused(true);
      setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeOption) {
      e.preventDefault();
      handleSelect(activeOption.value);
    } else if (e.key === "Escape") {
      setIsFocused(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <PlainInput
        id={id}
        name={name}
        value={searchText}
        placeholder={placeholder}
        size={size}
        color={color}
        disabled={disabled}
        allowClear
        onClear={() => {
          setSearchText("");
          setActiveIndex(-1);
        }}
        onChange={(e) => {
          setSearchText(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={closeOnBlur ? () => setIsFocused(false) : undefined}
        role="combobox"
        // `placeholder` bir accessible name SAYILMAZ — tüketici `aria-label`
        // vermediyse placeholder'dan türetilir.
        aria-label={ariaLabel ?? placeholder}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeOption ? optionId(activeOption.id) : undefined}
        autoComplete="off"
      />
      <ul
        ref={listRef}
        id={listboxId}
        role="listbox"
        className={cn(
          "absolute left-0 top-full z-mari-dropdown mt-1 max-h-64 w-full overflow-y-auto overscroll-contain rounded-lg bg-mari-surface p-1 text-sm transition-[opacity,translate] duration-150",
          elevationClass.md,
          isOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        )}
      >
        {filteredOptions.map((option, i) => (
          <li key={option.id} role="presentation">
            <button
              id={optionId(option.id)}
              role="option"
              aria-selected={i === activeIndex}
              type="button"
              tabIndex={-1}
              // onMouseDown (blur'dan ÖNCE) — aksi halde Input'un onBlur'u
              // listeyi gizleyip tıklamayı iptal ederdi.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex min-h-8 w-full cursor-pointer items-center rounded-md px-2.5 py-1.5 text-left text-mari-muted hover:bg-mari-surface-alt pointer-coarse:min-h-11",
                i === activeIndex && "bg-mari-surface-alt text-mari-foreground"
              )}
            >
              <span className="truncate">
                <HighlightedValue value={option.value} searchText={searchText} />
              </span>
            </button>
          </li>
        ))}
        {showNotFound && (
          <li role="presentation" className="px-2.5 py-2 text-mari-muted">
            {notFoundContent}
          </li>
        )}
      </ul>
    </div>
  );
}
