import type React from "react";
import { foldForSearch } from "../lib/searchFold";

/** Select'in saf mantığı — web `select/utils.ts` ile aynı kurallar (testli). */

export type SelectValue = string | number;

export interface SelectOption {
  value: SelectValue;
  /** Görünen metin. Verilmezse `value`. Aramada da bu (düz metinse) kullanılır. */
  label?: React.ReactNode;
  /** Solda ikon/avatar. */
  icon?: React.ReactNode;
  /** Etiketin altında soluk açıklama. */
  description?: React.ReactNode;
  disabled?: boolean;
  /** `label` düz metin değilse arama için kullanılacak metin. */
  searchText?: string;
}

/** Başlıklı seçenek grubu. */
export interface SelectOptionGroup {
  label: React.ReactNode;
  options: SelectOption[];
}

export interface SelectSection {
  key: string;
  label?: React.ReactNode;
  options: SelectOption[];
}

export const isGroup = (item: SelectOption | SelectOptionGroup): item is SelectOptionGroup => "options" in item;

/** Gruplar açılmış düz seçenek listesi. */
export function flattenOptions(items: Array<SelectOption | SelectOptionGroup>): SelectOption[] {
  return items.flatMap((item) => (isGroup(item) ? item.options : [item]));
}

/** Türkçe/aksansız eşleşme: "mugla" → "Muğla", "IZMIR" → "İzmir" (Hermes'e güvenli, `lib/searchFold`). */
export { foldForSearch };

/** Aramada kullanılan düz metin: `searchText` → düz `label` → `value`. */
export function optionText(option: SelectOption): string {
  if (option.searchText !== undefined) return option.searchText;
  if (typeof option.label === "string" || typeof option.label === "number") return String(option.label);
  return String(option.value);
}

/** Aramaya göre süzülmüş bölümler; eşleşmesi kalmayan grup düşer, başlıksız ardışıklar birleşir. */
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
    const last = sections[sections.length - 1];
    if (last && last.label === undefined) last.options.push(item);
    else sections.push({ key: `plain-${index}`, options: [item] });
  });
  return sections;
}

/** Çoklu seçimde aç/kapat — sıra korunur. */
export function toggleValue(values: SelectValue[], value: SelectValue): SelectValue[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}
