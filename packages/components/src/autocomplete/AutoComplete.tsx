"use client";

import React, { useState } from "react";
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
 */
export function AutoComplete({ options, value, defaultValue = "", onSearch, onSelect, placeholder = "Ara", onBlur, closeOnBlur }: AutoCompleteProps) {
  const [searchText, setSearchText] = useControllableState<string>({ value, defaultValue, onChange: onSearch });
  const [isFocused, setIsFocused] = useState(false);
  const shouldCloseOnBlur = closeOnBlur ?? onBlur ?? true;

  const handleSelect = (optionValue: string) => {
    setSearchText(optionValue);
    onSelect?.(optionValue);
    setIsFocused(false);
  };

  const filteredOptions = getFilteredOption(options, searchText);

  return (
    <div className="relative">
      <Input
        value={searchText}
        placeholder={placeholder}
        onChange={(e) => setSearchText(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={shouldCloseOnBlur ? () => setIsFocused(false) : undefined}
        icon={<XIcon size={14} className="hover:text-mari-error cursor-pointer" onClick={() => setSearchText("")} />}
        iconPosition="end"
      />
      <ul
        className={cn(
          "absolute top-full left-0 w-full bg-mari-surface shadow-xl border border-mari-border rounded-md p-2 mt-1 z-mari-dropdown transition-opacity duration-300",
          isFocused ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {filteredOptions.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              // onMouseDown (blur'dan ÖNCE tetiklenir) kullanılıyor — aksi
              // halde Input'un onBlur'u bu tıklamadan önce listeyi
              // gizleyip tıklamayı iptal ederdi.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(option.value)}
              className="w-full text-left p-1 hover:bg-mari-surface-alt cursor-pointer rounded-md"
            >
              {option.value}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
