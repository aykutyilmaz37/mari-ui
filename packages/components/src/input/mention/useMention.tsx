"use client";

import type React from "react";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FloatingCoords } from "../../lib/useFloatingPosition";
import { optionDomId, SelectPanel } from "../../select/_components/SelectPanel";
import type { SelectOption } from "../../select/types";
import type { MentionOption, MentionsConfig } from "./types";
import { getCaretRect } from "./caret";
import { filterMentionOptions, findMention, insertMention, type MentionMatch } from "./utils";

type Field = HTMLInputElement | HTMLTextAreaElement;

const GAP_PX = 4;
const EDGE_PX = 8;
/** Panel genişliği (rem) — kök yazı boyutuyla ölçeklenir. */
const PANEL_WIDTH_REM = 16;

const toSelectOption = (o: MentionOption): SelectOption => ({ value: o.value, label: o.label ?? o.value, icon: o.icon, description: o.description, disabled: o.disabled });

/** React'in kontrollü alanına değeri "kullanıcı yazmış gibi" verir → bileşenin onChange'i gerçek olayla çalışır. */
function setNativeValue(el: Field, text: string) {
  const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value")?.set?.call(el, text);
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function nextEnabled(options: MentionOption[], from: number, step: 1 | -1): number {
  const n = options.length;
  for (let i = 1; i <= n; i++) {
    const idx = (((from + step * i) % n) + n) % n;
    if (!options[idx]!.disabled) return idx;
  }
  return -1;
}

/** Eşleşmenin tetiğine göre liste, sorguya göre süzülmüş. */
function resolveOptions(config: MentionsConfig | undefined, match: MentionMatch | null): MentionOption[] {
  if (!config || !match) return [];
  const all = typeof config.options === "function" ? config.options(match.prefix) : config.options;
  return filterMentionOptions(all, match.query, config.filterOption);
}

/** Panel konumu: imlecin altında; sığmazsa üstünde; yatayda ekrana sığdırılır. */
function useCaretPosition(open: boolean, elRef: React.RefObject<Field | null>, panelRef: React.RefObject<HTMLDivElement | null>, match: MentionMatch | null, deps: unknown) {
  const [coords, setCoords] = useState<FloatingCoords | null>(null);
  useLayoutEffect(() => {
    if (!open || !match) {
      setCoords(null);
      return;
    }
    const measure = () => {
      const el = elRef.current;
      const panel = panelRef.current;
      if (!el) return;
      const caret = getCaretRect(el, match.start);
      const width = panel?.offsetWidth ?? 0;
      const height = panel?.offsetHeight ?? 0;
      let top = caret.top + caret.height + GAP_PX;
      if (top + height > window.innerHeight - EDGE_PX && caret.top - GAP_PX - height > EDGE_PX) top = caret.top - GAP_PX - height;
      const left = Math.max(EDGE_PX, Math.min(caret.left, window.innerWidth - width - EDGE_PX));
      setCoords({ top, left, side: "bottom", arrowOffset: 0, anchorWidth: PANEL_WIDTH_REM * Number.parseFloat(getComputedStyle(document.documentElement).fontSize) });
    };
    measure();
    // İlk ölçümde panel henüz boyutsuz olabilir; bir kare sonra gerçek boyutla yeniden.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `deps`: liste uzunluğu değişince yeniden ölç
  }, [open, match?.start, match?.prefix, deps]);
  return coords;
}

/**
 * Input ve Textarea'nın ortak `mentions` davranışı. Döndürdüğü `controlProps`
 * alana yayılır (ARIA + klavye + imleç izleme), `panel` alanın yanına çizilir.
 * Odak hep alanda kalır; aktif öneri `aria-activedescendant` (APG combobox).
 */
export function useMention(config: MentionsConfig | undefined, elRef: React.RefObject<Field | null>, value: string, kind: "input" | "textarea") {
  const enabled = config !== undefined;
  const prefixes = useMemo(() => {
    const p = config?.prefix ?? "@";
    return Array.isArray(p) ? p : [p];
  }, [config?.prefix]);
  const split = config?.split ?? " ";
  const [match, setMatch] = useState<MentionMatch | null>(null);
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const lastQuery = useRef<string | null>(null);

  const options = useMemo(() => resolveOptions(config, match), [config, match]);
  const notFound = config?.notFoundContent === undefined ? "Sonuç bulunamadı" : config.notFoundContent;
  const open = enabled && match !== null && dismissedAt !== match.start && (options.length > 0 || !!config?.loading || notFound !== null);
  // SelectPanel aktif satırı nesne kimliğiyle bulur — iki listeye AYNI dizi verilmeli.
  const selectOptions = useMemo(() => options.map(toSelectOption), [options]);
  const coords = useCaretPosition(open, elRef, panelRef, match, options.length);

  /** İmlece göre eşleşmeyi yeniden hesapla (yazınca, imleç oynayınca, odakta). */
  const sync = () => {
    const el = elRef.current;
    if (!enabled || !el) return;
    const caret = el.selectionStart;
    const next = caret !== null && caret === el.selectionEnd ? findMention(el.value, caret, prefixes) : null;
    setMatch((prev) => (prev?.start === next?.start && prev?.query === next?.query && prev?.prefix === next?.prefix ? prev : next));
    if (!next) setDismissedAt(null);
  };

  // Değer değişince (yazma, yapıştırma, dışarıdan) eşleşmeyi güncelle.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(sync, [value, enabled]);

  // Sorgu değişince: aktif satır başa, sunucu araması bildirimi.
  useEffect(() => {
    setActiveIndex(0);
    const key = match ? `${match.prefix}${match.start}:${match.query}` : null;
    if (match && key !== lastQuery.current) config?.onSearch?.(match.query, match.prefix);
    lastQuery.current = key;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match]);

  // Klavyeyle gezinirken aktif öneri listenin görünür alanında kalsın (Select ile aynı).
  const activeId = open && options[activeIndex] ? optionDomId(listboxId, selectOptions[activeIndex]!) : undefined;
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [activeId]);

  const choose = (option: MentionOption) => {
    const el = elRef.current;
    if (!el || !match || option.disabled) return;
    const caret = el.selectionStart ?? el.value.length;
    const result = insertMention(el.value, match, caret, option.value, split);
    setNativeValue(el, result.text);
    el.setSelectionRange(result.caret, result.caret);
    // Kontrollü alanda React yeniden çizince imleç sona kaçmasın.
    requestAnimationFrame(() => el.setSelectionRange(result.caret, result.caret));
    setMatch(null);
    config?.onSelect?.(option, match.prefix);
  };

  /** `true` → tuş mention tarafından işlendi (bileşen kendi Enter davranışını çalıştırmasın). */
  const handleKeyDown = (e: React.KeyboardEvent): boolean => {
    if (!open || !match) return false;
    const active = options[activeIndex];
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp": {
        e.preventDefault();
        if (options.length) setActiveIndex((i) => Math.max(0, nextEnabled(options, i, e.key === "ArrowDown" ? 1 : -1)));
        return true;
      }
      case "Enter":
      case "Tab":
        if (!active || active.disabled) return false;
        e.preventDefault();
        choose(active);
        return true;
      case "Escape":
        // Modal/Drawer içinde Escape önce listeyi kapatsın, pencereyi değil.
        e.preventDefault();
        e.stopPropagation();
        setDismissedAt(match.start);
        return true;
      default:
        return false;
    }
  };

  const controlProps = enabled
    ? {
        ...(kind === "input" ? { role: "combobox" as const, "aria-expanded": open } : {}),
        "aria-autocomplete": "list" as const,
        "aria-controls": open ? listboxId : undefined,
        "aria-activedescendant": activeId,
        onKeyUp: (e: React.KeyboardEvent) => {
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) sync();
        },
        onClick: sync,
      }
    : {};

  const panel = open ? (
    <SelectPanel
      ref={panelRef}
      listboxId={listboxId}
      coords={coords}
      sections={[{ key: "mentions", options: selectOptions }]}
      flatOptions={selectOptions}
      activeIndex={activeIndex}
      isSelected={() => false}
      multiple={false}
      loading={!!config?.loading}
      notFoundContent={notFound}
      listHeight={config?.listHeight ?? "14rem"}
      label={config?.listLabel ?? "Öneriler"}
      onPick={(o) => {
        const option = options.find((m) => m.value === o.value);
        if (option) choose(option);
      }}
      onHover={setActiveIndex}
    />
  ) : null;

  return { controlProps, panel, handleKeyDown, close: () => setMatch(null) };
}
