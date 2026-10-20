import { foldForSearch } from "../lib/search";
import type { Option } from "./types";

// Asıl tanım lib'de (Select/Transfer/Mentions de kullanıyor); eski import yolu çalışsın.
export { foldForSearch };

export function getFilteredOption(options: Option[], searchText: string): Option[] {
  const query = foldForSearch(searchText.trim());
  if (!query) return options;
  return options.filter((option) => foldForSearch(option.value).includes(query));
}

/** Seçenek metnini [önce, eşleşen, sonra] olarak böler; eşleşme yoksa `null`. */
export function splitMatch(value: string, searchText: string): [string, string, string] | null {
  const query = foldForSearch(searchText.trim());
  const folded = foldForSearch(value);
  if (!query || folded.length !== value.length) return null;
  const start = folded.indexOf(query);
  if (start < 0) return null;
  const end = start + query.length;
  return [value.slice(0, start), value.slice(start, end), value.slice(end)];
}
