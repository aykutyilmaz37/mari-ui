"use client";

import React from "react";
import { Input } from "../input";
import { twMerge } from "tailwind-merge";
import { Option } from "./types";
import { getFilteredOption } from "./utils";
import { XIcon } from "lucide-react";

type AutoCompleteProps = {
  options: Option[];
  onBlur?: boolean;
};

export const AutoComplete: React.FC<AutoCompleteProps> = ({
  options,
  onBlur = true,
}) => {
  const [searchText, setSearchText] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const handleSearch = (searchText: string) => {
    setSearchText(searchText);
  };

  const handleSelect = (value: string) => {
    setSearchText(value);
  };

  const filteredOptions = getFilteredOption(options, searchText);

  return (
    <div className="relative">
      <Input
        value={searchText}
        placeholder="Search"
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={onBlur ? () => setIsFocused(false) : undefined}
        icon={
          <XIcon
            size={14}
            className="hover:text-error cursor-pointer"
            onClick={() => setSearchText("")}
          />
        }
        iconPosition="end"
      />
      <ul
        className={twMerge(
          "absolute top-full left-0 w-full bg-white shadow-xl border border-secondary-light rounded-md p-2 mt-1 z-10 transition-all duration-300",
          isFocused ? "opacity-100" : "opacity-0"
        )}
      >
        {filteredOptions.map((option) => (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full text-left p-1 hover:bg-secondary-light cursor-pointer rounded-md"
            >
              {option.value}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
