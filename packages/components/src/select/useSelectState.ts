"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useControllableState } from "@mari-ui/core";
import type { SelectOption, SelectProps, SelectValue } from "./types";
import { buildSections, firstEnabled, flattenOptions, nextEnabled, typeAheadMatch } from "./utils";

const TYPE_AHEAD_RESET_MS = 500;

/**
 * Select'in durumu: seçili değer(ler), açık/kapalı, arama metni, aktif
 * (klavyeyle/fareyle üzerinde durulan) seçenek ve bunları değiştiren
 * eylemler. Tekli ve çoklu mod içeride aynı dizi olarak tutulur.
 */
export function useSelectState(props: SelectProps) {
  const multiple = props.mode === "multiple";
  const toArray = (v: SelectValue | SelectValue[] | null | undefined): SelectValue[] | undefined => {
    if (v === undefined) return undefined;
    if (v === null) return [];
    return Array.isArray(v) ? v : [v];
  };

  const allOptions = useMemo(() => flattenOptions(props.options), [props.options]);
  const findOption = (value: SelectValue) => allOptions.find((o) => o.value === value);

  const [values, setValuesState] = useControllableState<SelectValue[]>({
    value: toArray(props.value),
    defaultValue: toArray(props.defaultValue) ?? [],
  });
  const [open, setOpenState] = useControllableState<boolean>({ value: props.open, defaultValue: false, onChange: props.onOpenChange });
  const [search, setSearchState] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const sections = useMemo(() => buildSections(props.options, props.showSearch ? search : ""), [props.options, props.showSearch, search]);
  const visibleOptions = useMemo(() => sections.flatMap((s) => s.options), [sections]);
  const activeOption = activeIndex >= 0 ? visibleOptions[activeIndex] : undefined;

  // Yazdıkça aktif satır ilk eşleşme olur (Enter onu seçer); liste kısalınca sınır dışına düşmesin.
  useEffect(() => {
    if (search) setActiveIndex(firstEnabled(visibleOptions));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- yalnız arama metni değişince
  }, [search]);
  useEffect(() => {
    if (activeIndex >= visibleOptions.length) setActiveIndex(firstEnabled(visibleOptions));
  }, [visibleOptions, activeIndex]);

  const commit = (next: SelectValue[]) => {
    setValuesState(next);
    if (multiple) {
      const onChange = props.onChange as ((v: SelectValue[], o: SelectOption[]) => void) | undefined;
      onChange?.(next, next.map(findOption).filter((o): o is SelectOption => !!o));
    } else {
      const onChange = props.onChange as ((v: SelectValue | null, o: SelectOption | null) => void) | undefined;
      const value = next[0] ?? null;
      onChange?.(value, value === null ? null : (findOption(value) ?? null));
    }
  };

  const setSearch = (text: string) => {
    setSearchState(text);
    props.onSearch?.(text);
  };

  const setOpen = (next: boolean) => {
    if (next === open) return;
    setOpenState(next);
    if (!next) {
      setActiveIndex(-1);
      if (search) setSearch("");
    }
  };

  /** Açarken aktif satır: seçili olan (tekli) ya da ilk seçilebilir. */
  const openAt = (edge: "selected" | "first" | "last" = "selected") => {
    const selectedIndex = visibleOptions.findIndex((o) => values.includes(o.value));
    if (edge === "last") setActiveIndex(firstEnabled(visibleOptions, true));
    else if (edge === "selected" && selectedIndex >= 0 && !multiple) setActiveIndex(selectedIndex);
    else setActiveIndex(firstEnabled(visibleOptions));
    setOpen(true);
  };

  const pick = (option: SelectOption) => {
    if (option.disabled) return;
    if (!multiple) {
      commit([option.value]);
      setOpen(false);
      return;
    }
    const has = values.includes(option.value);
    commit(has ? values.filter((v) => v !== option.value) : [...values, option.value]);
    // Çoklu seçimde liste açık kalır; arama temizlenir ki sonraki seçim kolay olsun.
    if (search) setSearch("");
  };

  const move = (step: 1 | -1) => {
    setActiveIndex((i) => (i < 0 ? firstEnabled(visibleOptions, step === -1) : nextEnabled(visibleOptions, i, step)));
  };

  // Harfle atlama (arama kutusu yokken): art arda harfler 500ms içinde birikir.
  const typeAhead = useRef({ buffer: "", timer: 0 as ReturnType<typeof setTimeout> | 0 });
  useEffect(() => () => clearTimeout(typeAhead.current.timer || undefined), []);
  const typeChar = (char: string) => {
    const state = typeAhead.current;
    state.buffer += char;
    clearTimeout(state.timer || undefined);
    state.timer = setTimeout(() => (state.buffer = ""), TYPE_AHEAD_RESET_MS);
    const match = typeAheadMatch(visibleOptions, activeIndex, state.buffer);
    if (match < 0) return;
    setActiveIndex(match);
    setOpen(true);
  };

  const removeValue = (value: SelectValue) => commit(values.filter((v) => v !== value));
  const clear = () => commit([]);

  return {
    multiple,
    values,
    selectedOptions: values.map((v) => findOption(v) ?? { value: v }),
    open,
    setOpen,
    openAt,
    search,
    setSearch,
    sections,
    visibleOptions,
    activeIndex,
    setActiveIndex,
    activeOption,
    pick,
    move,
    typeChar,
    removeValue,
    clear,
    isSelected: (option: SelectOption) => values.includes(option.value),
  };
}

export type SelectState = ReturnType<typeof useSelectState>;
