import { Option } from "./types";

export const getFilteredOption = (options: Option[], searchText: string) => {
  const filteredOptions = options.filter((option) =>
    option.value.toLowerCase().includes(searchText.toLowerCase())
  );
  return filteredOptions;
};
