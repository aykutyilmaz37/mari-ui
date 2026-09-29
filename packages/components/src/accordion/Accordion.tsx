"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { cn, useControllableState, type Size } from "@mari-ui/core";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { skeletonBoxProps } from "../lib/skeleton";
import { SkeletonBlock } from "../skeleton";
import type { AccordionItem, AccordionProps, AccordionVariant } from "./types";
import { getHeaderTarget, toggleKey, toKeys } from "./utils";

export type { AccordionProps, AccordionItem, AccordionVariant };

const EXIT_MS = 200;

/** ant.design: sm 8·12, md 12·16, lg 16·24px; lg'de başlık 16px. */
const HEADER_PAD: Record<Size, string> = { sm: "px-3 py-2", md: "px-4 py-3", lg: "px-6 py-4 text-base" };
const BODY_PAD: Record<Size, string> = { sm: "px-3 py-2", md: "p-4", lg: "px-6 py-4" };
/** Tonsuz varyantlarda gövde başlığın devamı — üst dolgu küçülür. */
const BODY_PAD_FLUSH: Record<Size, string> = { sm: "px-3 pb-2", md: "px-4 pb-4", lg: "px-6 pb-4" };
/** İkon kutusu = başlığın satır yüksekliği → ok ilk satırla hizalı kalır. */
const ICON_BOX: Record<Size, string> = { sm: "h-5", md: "h-5", lg: "h-6" };

const ROOT: Record<AccordionVariant, string> = {
  bordered: "overflow-hidden rounded-lg border border-mari-border bg-mari-surface-alt",
  borderless: "overflow-hidden rounded-lg bg-mari-surface-alt",
  ghost: "",
  separated: "flex flex-col gap-2",
};

const ITEM: Record<AccordionVariant, string> = {
  bordered: "border-b border-mari-border last:border-b-0",
  borderless: "border-b border-mari-border last:border-b-0",
  ghost: "",
  separated: "overflow-hidden rounded-lg border border-mari-border bg-mari-surface",
};

interface PanelProps {
  item: AccordionItem;
  open: boolean;
  onToggle: () => void;
  variant: AccordionVariant;
  size: Size;
  iconPlacement: "start" | "end";
  expandIcon?: (open: boolean) => React.ReactNode;
  headingLevel: 2 | 3 | 4 | 5 | 6;
  destroyOnHidden: boolean;
  region: boolean;
  skeleton: boolean;
}

/** İçerik ilk açılışta mount edilir; `destroyOnHidden`da kapanış animasyonundan sonra kaldırılır. */
function useRenderedContent(open: boolean, forceRender: boolean, destroyOnHidden: boolean): boolean {
  const [rendered, setRendered] = useState(open || forceRender);
  useEffect(() => {
    if (open) {
      setRendered(true);
      return;
    }
    if (!destroyOnHidden || forceRender) return;
    const timer = setTimeout(() => setRendered(false), EXIT_MS);
    return () => clearTimeout(timer);
  }, [open, forceRender, destroyOnHidden]);
  return open || rendered;
}

function ExpandIcon({ open, size, placement, disabled, skeleton, custom }: { open: boolean; size: Size; placement: "start" | "end"; disabled?: boolean; skeleton: boolean; custom?: (open: boolean) => React.ReactNode }) {
  const Chevron = placement === "end" ? ChevronDownIcon : ChevronRightIcon;
  let content: React.ReactNode;
  if (skeleton) content = <span {...skeletonBoxProps("size-3.5 rounded-sm")} />;
  else
    content = custom?.(open) ?? (
      <Chevron
        size={size === "lg" ? 18 : 16}
        className={cn("transition-transform duration-200 motion-reduce:transition-none", open && (placement === "end" ? "rotate-180" : "rotate-90"))}
      />
    );
  return (
    <span aria-hidden className={cn("flex shrink-0 items-center", ICON_BOX[size], disabled ? "text-mari-muted/60" : "text-mari-muted", placement === "end" && "order-last")}>
      {content}
    </span>
  );
}

type HeaderRowProps = Pick<PanelProps, "item" | "open" | "onToggle" | "variant" | "size" | "iconPlacement" | "expandIcon" | "skeleton"> & {
  Heading: "h3";
  headerId: string;
  panelId: string;
};

/**
 * Başlık satırı: düğme `after:inset-0` ile tüm satırı tıklanabilir yapar (ant:
 * başlığın her yeri açar), `extra` üstte (`z-10`) ve düğmenin DIŞINDA — içindeki
 * bağlantı/düğme iç içe etkileşimli öğe olmaz. İskelette satır erişilebilirlik
 * ağacından çıkar (etiket yer tutucuya döndüğü için düğme adsız kalırdı).
 */
function HeaderRow({ item, open, onToggle, variant, size, iconPlacement, expandIcon, skeleton, Heading, headerId, panelId }: HeaderRowProps) {
  const disabled = item.disabled || skeleton;
  return (
    <div
      aria-hidden={skeleton || undefined}
      className={cn(
        "relative flex items-start gap-3",
        HEADER_PAD[size],
        !disabled && "cursor-pointer",
        !disabled && variant !== "bordered" && "hover:bg-mari-surface-alt/60",
        "has-[[data-accordion-trigger]:focus-visible]:outline-2 has-[[data-accordion-trigger]:focus-visible]:-outline-offset-2 has-[[data-accordion-trigger]:focus-visible]:outline-mari-ring",
        variant === "ghost" && "rounded-md"
      )}
    >
      {item.showArrow !== false && <ExpandIcon open={open} size={size} placement={iconPlacement} disabled={item.disabled} skeleton={skeleton} custom={expandIcon} />}
      <Heading className="m-0 min-w-0 flex-1 text-inherit font-medium">
        <button
          type="button"
          id={headerId}
          data-accordion-trigger=""
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={onToggle}
          className={cn(
            "w-full cursor-[inherit] text-left outline-none after:absolute after:inset-0",
            size === "lg" ? "leading-6" : "leading-5",
            item.disabled ? "text-mari-muted" : "text-mari-foreground",
            disabled && "cursor-not-allowed"
          )}
        >
          {skeleton ? <span {...skeletonBoxProps("rounded-sm")}>{item.label}</span> : item.label}
        </button>
      </Heading>
      {item.extra && <div className={cn("relative z-10 flex shrink-0 items-center", ICON_BOX[size], skeleton && "invisible")}>{item.extra}</div>}
    </div>
  );
}

function Panel({ item, open, onToggle, variant, size, iconPlacement, expandIcon, headingLevel, destroyOnHidden, region, skeleton }: PanelProps) {
  const id = useId();
  const headerId = `${id}-header`;
  const panelId = `${id}-panel`;
  const rendered = useRenderedContent(open, Boolean(item.forceRender), destroyOnHidden);
  const Heading = `h${headingLevel}` as "h3";
  const tinted = variant === "bordered";

  return (
    <div className={ITEM[variant]}>
      <HeaderRow
        item={item}
        open={open}
        onToggle={onToggle}
        variant={variant}
        size={size}
        iconPlacement={iconPlacement}
        expandIcon={expandIcon}
        Heading={Heading}
        headerId={headerId}
        panelId={panelId}
        skeleton={skeleton}
      />
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div
          id={panelId}
          role={region ? "region" : undefined}
          aria-labelledby={region ? headerId : undefined}
          // Kapalıyken odaklanamaz ve erişilebilirlik ağacında yok (görsel olarak da 0 yükseklik).
          inert={!open || undefined}
          className="min-h-0 overflow-hidden"
        >
          {rendered && (
            <div className={cn(tinted ? cn("border-t border-mari-border bg-mari-surface", BODY_PAD[size]) : BODY_PAD_FLUSH[size], "text-mari-foreground")}>
              <ContentSkeleton on={skeleton} fallback={<SkeletonBlock active width="80%" height="0.75rem" radius="sm" />}>
                {item.children}
              </ContentSkeleton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Faz 16.3 — yapı ant.design Collapse'tan (tüm başlık açar, ok başta ya da
 * sonda, `extra`, tekli mod, dört görünüm, üç boyut, ilk açılışta mount +
 * `destroyOnHidden`), görünüm kendi token'larımızdan. Aç/kapa yüksekliği
 * `grid-template-rows` 0fr↔1fr ile canlandırılır (sabit `max-height` yok).
 *
 * Erişilebilirlik (WAI-ARIA APG Accordion): her başlık `<hN><button
 * aria-expanded aria-controls>`; gövde `role="region"` + `aria-labelledby`
 * (6'dan fazla bölümde landmark kalabalığı olmasın diye region verilmez).
 * Kapalı gövde `inert`. ↑/↓ başlıklar arası (döngülü), Home/End ilk/son.
 */
export function Accordion({
  items,
  activeKey,
  defaultActiveKey,
  onChange,
  single = false,
  variant = "bordered",
  size = "md",
  iconPlacement = "start",
  expandIcon,
  headingLevel = 3,
  destroyOnHidden = false,
  className,
  skeleton = false,
}: AccordionProps) {
  const [active, setActive] = useControllableState<string[]>({
    value: toKeys(activeKey),
    defaultValue: toKeys(defaultActiveKey) ?? [],
    onChange,
  });
  const rootRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (!target.matches("[data-accordion-trigger]")) return;
    const headers = Array.from(rootRef.current?.querySelectorAll<HTMLElement>("[data-accordion-trigger]:not(:disabled)") ?? []).filter(
      // İç içe Accordion'un başlıkları bu listeye girmez.
      (el) => el.closest("[data-accordion-root]") === rootRef.current
    );
    const next = getHeaderTarget(headers, target, event.key);
    if (!next) return;
    event.preventDefault();
    next.focus();
  };

  return (
    // Tuşlar başlık düğmelerinden kabarcıklanır; kök etkileşimli değil.
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={rootRef}
      data-accordion-root=""
      aria-busy={skeleton || undefined}
      onKeyDown={onKeyDown}
      className={cn("text-sm text-mari-foreground", ROOT[variant], className)}
    >
      {items.map((item) => (
        <Panel
          key={item.key}
          item={item}
          open={active.includes(item.key)}
          onToggle={() => setActive(toggleKey(active, item.key, single))}
          variant={variant}
          size={size}
          iconPlacement={iconPlacement}
          expandIcon={expandIcon}
          headingLevel={headingLevel}
          destroyOnHidden={destroyOnHidden}
          region={items.length <= 6}
          skeleton={skeleton}
        />
      ))}
    </div>
  );
}
