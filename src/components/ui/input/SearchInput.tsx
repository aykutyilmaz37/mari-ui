"use client";
import React, { forwardRef, useImperativeHandle, useRef } from "react";

import { Input, InputProps } from "./Input";
import { SearchIcon } from "lucide-react";

export type SearchInputProps = InputProps & {
  onSearch?: (value: string) => void;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      placeholder,
      allowClear = true,
      classNames = {},
      className = "",
      count,
      defaultValue = "",
      disabled = false,
      id,
      maxLength,
      icon,
      iconPosition = "end",
      showCount,
      status,
      size = "middle",
      shape = "default",
      type = "text",
      value,
      variant = "outlined",
      onChange,
      onPressEnter,
      onClear,
      onFocus,
      onKeyDown,
      onInput,
      onSearch,
      mask,
      replacement = { _: /\d/ },
      visibilityToggle,
      visibilityIconRender,
      ...rest
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const handleSearchClick = () => {
      const currentValue = inputRef.current?.value ?? "";
      onSearch?.(currentValue);
      onPressEnter?.({
        key: "Enter",
      } as React.KeyboardEvent<HTMLInputElement>);
    };

    const SearchButton = (
      <button
        className="cursor-pointer select-none appearance-none flex"
        onClick={handleSearchClick}
      >
        <SearchIcon size={16} />
      </button>
    );

    return (
      <Input
        ref={inputRef}
        icon={icon ?? SearchButton}
        iconPosition={iconPosition}
        placeholder={placeholder}
        allowClear={allowClear}
        classNames={classNames}
        className={className}
        count={count}
        defaultValue={defaultValue}
        value={value}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        showCount={showCount}
        size={size}
        status={status}
        shape={shape}
        type={type}
        variant={variant}
        onChange={onChange}
        onPressEnter={onPressEnter}
        onClear={onClear}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        onInput={onInput}
        mask={mask}
        replacement={replacement}
        visibilityToggle={visibilityToggle}
        visibilityIconRender={visibilityIconRender}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
