"use client";

import React, { useId, useState } from "react";
import { XIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { Input } from "../input";
import type { AutoCompleteProps } from "./types";
import { getFilteredOption } from "./utils";

export type { AutoCompleteProps };

/**
 * Eskiden `handleSelect` sadece dahili state'i güncelliyordu — ebeveyn
 * component'in bir seçenek seçildiğinde HABERDAR OLMASININ hiçbir yolu
 * yoktu (gerçek bir eksiklik, yeni tasarım değil). `onSelect` eklendi.
 * Ayrıca liste `opacity-0` iken hâlâ `pointer-events` etkindi — görünmez
 * durumdayken bile tıklanabilir/hover edilebilirdi; düzeltildi.
 *
 * Faz 13 a11y: bu bir ARIA "combobox" deseniydi ama hiçbir ARIA rolü/
 * klavye desteği taşımıyordu — fare olmadan KULLANILAMAZ durumdaydı.
 * Artık `role="combobox"`/`listbox`/`option` + Ok tuşları/Enter/Escape.
 */
export function AutoComplete({ options, value, defaultValue = "", onSearch, onSelect, placeholder = "Ara", onBlur, closeOnBlur }: AutoCompleteProps) {
  const [searchText, setSearchText] = useControllableState<string>({ value, defaultValue, onChange: onSearch });
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const shouldCloseOnBlur = closeOnBlur ?? onBlur ?? true;
  const listboxId = useId();

  const filteredOptions = getFilteredOption(options, searchText);
  const isOpen = isFocused && filteredOptions.length > 0;
  const activeOption = activeIndex >= 0 ? filteredOptions[activeIndex] : undefined;
  const optionId = (id: number) => `${listboxId}-option-${id}`;

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
    <div className="relative">
      <Input
        value={searchText}
        placeholder={placeholder}
        onChange={(e) => {
          setSearchText(e.target.value);
          setActiveIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={shouldCloseOnBlur ? () => setIsFocused(false) : undefined}
        icon={<XIcon size={14} className="hover:text-mari-error cursor-pointer" onClick={() => setSearchText("")} />}
        iconPosition="end"
        role="combobox"
        // `placeholder` bir accessible name SAYILMAZ (bazı ekran okuyucular
        // hiç okumaz) — bir `role="combobox"`ın adı olmadan tanımlı değildir.
        // Tüketici kendi `aria-label`'ını vermediyse placeholder'dan türetilir.
        aria-label={placeholder}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={activeOption ? optionId(activeOption.id) : undefined}
      />
      <ul
        id={listboxId}
        role="listbox"
        // `text-sm` — geri kalan tüm form kontrolleriyle (Input vb.) aynı
        // ölçek; eskiden ambient (`text-base`/16px) boyuttaydı, listedeki
        // seçenekler input metninden gözle görülür şekilde büyük duruyordu.
        className={cn(
          "absolute top-full left-0 w-full bg-mari-surface shadow-xl border border-mari-border rounded-md p-2 mt-1 z-mari-dropdown text-sm transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {filteredOptions.map((option, i) => (
          <li key={option.id} role="presentation">
            <button
              id={optionId(option.id)}
              role="option"
              aria-selected={i === activeIndex}
              type="button"
              // onMouseDown (blur'dan ÖNCE tetiklenir) kullanılıyor — aksi
              // halde Input'un onBlur'u bu tıklamadan önce listeyi
              // gizleyip tıklamayı iptal ederdi.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "w-full text-left px-2 py-1.5 hover:bg-mari-surface-alt cursor-pointer rounded-md",
                i === activeIndex && "bg-mari-surface-alt"
              )}
            >
              {option.value}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
