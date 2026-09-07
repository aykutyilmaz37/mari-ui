"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "./Input";
import type { InputProps } from "./types";

export type SearchInputProps = InputProps & {
  onSearch?: (value: string) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ icon, iconPosition = "end", onSearch, onPressEnter, ...rest }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleSearchClick = () => {
      const currentValue = inputRef.current?.value ?? "";
      onSearch?.(currentValue);
      onPressEnter?.({ key: "Enter" } as React.KeyboardEvent<HTMLInputElement>);
    };

    const searchButton = (
      <button type="button" className="cursor-pointer select-none appearance-none flex" onClick={handleSearchClick}>
        <SearchIcon size={16} />
      </button>
    );

    return <Input ref={inputRef} icon={icon ?? searchButton} iconPosition={iconPosition} onPressEnter={onPressEnter} {...rest} />;
  }
);

SearchInput.displayName = "SearchInput";
