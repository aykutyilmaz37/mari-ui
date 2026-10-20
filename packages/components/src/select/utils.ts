import type React from "react";
import { foldForSearch } from "../lib/search";
import type { SelectOption, SelectOptionGroup, SelectValue } from "./types";

/**
 * Listede sırayla çizilen bölüm: başlıklı grup (`role="group"`) ya da
 * başlıksız ardışık seçenekler. Gruplar DOM'da da iç içe olmalı — ekran
 * okuyucu seçeneği "Meyveler grubu, Elma" diye okusun.
 */
export interface SelectSection {
  key: string;
  label?: React.ReactNode;
  options: SelectOption[];
}

export const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup => "options" in item;

/** Gruplar açılmış, düz seçenek listesi (değer arama, klavye gezinmesi için). */
export function flattenOptions(items: Array<SelectOption | SelectOptionGroup>): SelectOption[] {
  return items.flatMap((item) => (isGroup(item) ? item.options : [item]));
}

/** Aramada/harfle atlamada kullanılan düz metin: `searchText` → düz `label` → `value`. */
export function optionText(option: SelectOption): string {
  if (option.searchText !== undefined) return option.searchText;
  if (typeof option.label === "string" || typeof option.label === "number") return String(option.label);
  return String(option.value);
}

/** DOM id'si için değer anahtarı (sayı ile aynı yazılı string çakışmasın). */
export const valueKey = (value: SelectValue) => `${typeof value}:${value}`;

/**
 * Aramaya göre süzülmüş bölümler; eşleşmesi kalmayan grup tamamen düşer.
 * Türkçe/aksansız eşleşme AutoComplete'le aynı (`foldForSearch`).
 */
export function buildSections(items: Array<SelectOption | SelectOptionGroup>, search: string): SelectSection[] {
  const query = foldForSearch(search.trim());
  const matches = (option: SelectOption) => !query || foldForSearch(optionText(option)).includes(query);
  const sections: SelectSection[] = [];
  items.forEach((item, index) => {
    if (isGroup(item)) {
      const visible = item.options.filter(matches);
      if (visible.length > 0) sections.push({ key: `group-${index}`, label: item.label, options: visible });
      return;
    }
    if (!matches(item)) return;
    const last = sections.at(-1);
    if (last && last.label === undefined) last.options.push(item);
    else sections.push({ key: `plain-${index}`, options: [item] });
  });
  return sections;
}

/**
 * Klavye gezinmesi: seçilebilir (disabled olmayan) seçenekler arasında
 * `from`dan `step` yönünde bir sonraki; kenarda durur (APG listbox — sarmaz).
 */
export function nextEnabled(options: SelectOption[], from: number, step: 1 | -1): number {
  for (let i = from + step; i >= 0 && i < options.length; i += step) {
    if (!options[i]!.disabled) return i;
  }
  return from;
}

/** İlk seçilebilir seçenek; yoksa -1. */
export function firstEnabled(options: SelectOption[]): number {
  return nextEnabledOrNone(options, -1, 1);
}

/** Son seçilebilir seçenek; yoksa -1. */
export function lastEnabled(options: SelectOption[]): number {
  return nextEnabledOrNone(options, options.length, -1);
}

function nextEnabledOrNone(options: SelectOption[], from: number, step: 1 | -1): number {
  const next = nextEnabled(options, from, step);
  return next === from ? -1 : next;
}

/**
 * Harfle atlama (type-ahead): art arda yazılan harfler birikir ("is" →
 * "İstanbul"); tek harf tekrarlanırsa o harfle başlayan sonrakine geçer.
 */
export function typeAheadMatch(options: SelectOption[], current: number, buffer: string): number {
  const query = foldForSearch(buffer);
  if (!query) return -1;
  const repeated = query.length > 1 && [...query].every((ch) => ch === query[0]);
  const needle = repeated ? query[0]! : query;
  const start = repeated || query.length === 1 ? current + 1 : current;
  for (let step = 0; step < options.length; step++) {
    const i = (Math.max(start, 0) + step) % options.length;
    const option = options[i]!;
    if (!option.disabled && foldForSearch(optionText(option)).startsWith(needle)) return i;
  }
  return -1;
}
