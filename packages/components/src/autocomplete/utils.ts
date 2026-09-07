import type { Option } from "./types";

export function getFilteredOption(options: Option[], searchText: string): Option[] {
  return options.filter((option) => option.value.toLowerCase().includes(searchText.toLowerCase()));
}
