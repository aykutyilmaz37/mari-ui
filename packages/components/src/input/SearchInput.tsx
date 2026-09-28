"use client";

import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Loader2Icon, SearchIcon } from "lucide-react";
import { Input } from "./Input";
import type { InputProps } from "./types";

export type SearchInputProps = InputProps & {
  /** Enter'a basılınca VE ara butonuna tıklanınca, alanın o anki değeriyle çağrılır. */
  onSearch?: (value: string) => void;
  /** Arama sürüyor — ara ikonu yerine dönen gösterge. Alan yazılabilir kalır. */
  loading?: boolean;
  /** Ara butonunun erişilebilir adı. Varsayılan: `"Ara"`. */
  searchLabel?: string;
};

/**
 * Faz 15: `onSearch` eskiden YALNIZCA butona tıklanınca çağrılıyordu — Enter
 * sadece `onPressEnter`'ı tetikliyordu, klavyeyle arama yapan kullanıcı sonuç
 * alamıyordu. Butonun erişilebilir adı yoktu. Mobil klavyede Enter tuşu artık
 * "Ara" etiketli (`enterKeyHint="search"`).
 */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ icon, iconPosition = "end", onSearch, onPressEnter, loading = false, searchLabel = "Ara", ...rest }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current!, []);

    const search = () => onSearch?.(inputRef.current?.value ?? "");

    const handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
      search();
      onPressEnter?.(e);
    };

    const searchButton = (
      <button
        type="button"
        aria-label={searchLabel}
        onClick={search}
        disabled={rest.disabled}
        className="flex size-6 cursor-pointer select-none items-center justify-center rounded-sm hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-mari-ring"
      >
        {loading ? <Loader2Icon size={16} className="animate-spin" aria-hidden /> : <SearchIcon size={16} aria-hidden />}
      </button>
    );

    return (
      <Input
        ref={inputRef}
        icon={icon ?? searchButton}
        iconPosition={iconPosition}
        onPressEnter={handlePressEnter}
        enterKeyHint="search"
        aria-busy={loading || undefined}
        {...rest}
      />
    );
  }
);

SearchInput.displayName = "SearchInput";
