"use client";

import React, { useRef } from "react";
import { Loader2Icon } from "lucide-react";
import { cn, type ColorRole } from "@mari-ui/core";
import { textClass } from "../lib/colorClasses";
import { ContentSkeleton } from "../lib/ContentSkeleton";
import { skeletonBoxProps } from "../lib/skeleton";
import { useScrollable } from "../lib/useScrollable";
import { SkeletonBlock } from "../skeleton";
import type { TimelineItem, TimelineProps } from "./types";
import { buildItems, isThreeColumn, resolveSide } from "./utils";

export type { TimelineProps, TimelineItem };

const PLACEHOLDER = <SkeletonBlock active width="60%" height="0.75rem" radius="sm" className="my-1" />;

/** Nokta kutusu = ilk metin satırının yüksekliği (20px) → nokta ilk satırla hizalı. */
function Dot({ item, filled, skeleton }: Readonly<{ item: TimelineItem; filled: boolean; skeleton: boolean }>) {
  const color: ColorRole = item.color ?? "primary";
  let node: React.ReactNode;
  if (skeleton) node = <span {...skeletonBoxProps("size-2.5 rounded-full")} />;
  else if (item.loading) node = <Loader2Icon size={14} aria-hidden className="animate-spin text-mari-muted motion-reduce:animate-none" />;
  else if (item.icon) node = <span className={cn("flex size-5 items-center justify-center [&_svg]:size-4", textClass[color])}>{item.icon}</span>;
  else node = <span className={cn("size-2.5 rounded-full border-2 border-current", textClass[color], filled ? "bg-current" : "bg-mari-surface")} />;
  return (
    <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center">
      {node}
    </span>
  );
}

function Rail({ dashed, horizontal }: Readonly<{ dashed: boolean; horizontal?: boolean }>) {
  return (
    <span
      aria-hidden
      className={cn(
        "border-mari-border",
        horizontal ? "mx-1 h-0 flex-1 border-t-2" : "mt-1 w-0 flex-1 border-l-2",
        dashed && "border-dashed"
      )}
    />
  );
}

function Title({ children, className }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return <div className={cn("text-xs leading-5 text-mari-muted", className)}>{children}</div>;
}

interface RowProps {
  item: TimelineItem;
  index: number;
  last: boolean;
  nextLoading: boolean;
  props: Required<Pick<TimelineProps, "mode" | "variant" | "titlePlacement" | "skeleton">>;
}

/** Üç sütun (sm+) oranları: alternate eşit; opposite'te başlık sütunu dar. */
function threeColumnClass(mode: TimelineProps["mode"]): string {
  if (mode === "alternate") return "sm:grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,1fr)]";
  if (mode === "end") return "sm:grid-cols-[minmax(0,3fr)_1.25rem_minmax(0,1fr)]";
  return "sm:grid-cols-[minmax(0,1fr)_1.25rem_minmax(0,3fr)]";
}

function VerticalRow({ item, index, last, nextLoading, props }: Readonly<RowProps>) {
  const { mode, variant, titlePlacement, skeleton } = props;
  const side = resolveSide(mode, index, item.placement);
  const three = isThreeColumn(mode, titlePlacement);
  const opposite = titlePlacement === "opposite" && item.title !== undefined;
  const before = side === "before";

  // Dar ekranda üç sütunlu düzen iki sütuna (nokta | içerik) düşer; karşı taraftaki başlık içeriğin üstüne gelir.
  const body = (
    <ContentSkeleton on={skeleton} fallback={PLACEHOLDER}>
      {item.title !== undefined && <Title className={cn(opposite && "sm:hidden")}>{item.title}</Title>}
      <div className={cn("leading-5", item.loading ? "text-mari-muted" : "text-mari-foreground")}>{item.content}</div>
    </ContentSkeleton>
  );

  let grid: string;
  let dotCol: string;
  let bodyCol: string;
  let oppositeCol = "";
  if (three) {
    grid = cn("grid-cols-[1.25rem_minmax(0,1fr)]", threeColumnClass(mode));
    dotCol = "col-start-1 sm:col-start-2";
    bodyCol = cn("col-start-2", before ? "sm:col-start-1 sm:text-right" : "sm:col-start-3");
    oppositeCol = cn("hidden sm:block", before ? "sm:col-start-3" : "sm:col-start-1 sm:text-right");
  } else if (before) {
    grid = "grid-cols-[minmax(0,1fr)_1.25rem]";
    dotCol = "col-start-2";
    bodyCol = "col-start-1 text-right";
  } else {
    grid = "grid-cols-[1.25rem_minmax(0,1fr)]";
    dotCol = "col-start-1";
    bodyCol = "col-start-2";
  }

  return (
    <li className={cn("grid gap-x-4", grid)}>
      <div className={cn("row-start-1 flex flex-col items-center", dotCol)}>
        <Dot item={item} filled={variant === "filled"} skeleton={skeleton} />
        {!last && <Rail dashed={nextLoading} />}
      </div>
      <div className={cn("row-start-1 min-w-0 break-words", !last && "pb-6", bodyCol)}>{body}</div>
      {opposite && (
        <div className={cn("row-start-1 min-w-0", oppositeCol)}>
          <ContentSkeleton on={skeleton} fallback={PLACEHOLDER}>
            <Title>{item.title}</Title>
          </ContentSkeleton>
        </div>
      )}
    </li>
  );
}

function HorizontalRow({ item, last, nextLoading, props }: Readonly<RowProps>) {
  const { variant, skeleton } = props;
  return (
    <li className="flex min-w-36 flex-1 flex-col">
      <div className="flex items-center">
        <Dot item={item} filled={variant === "filled"} skeleton={skeleton} />
        {!last && <Rail dashed={nextLoading} horizontal />}
      </div>
      <div className="min-w-0 pt-2 pr-4 break-words">
        <ContentSkeleton on={skeleton} fallback={PLACEHOLDER}>
          {item.title !== undefined && <Title>{item.title}</Title>}
          <div className={cn("leading-5", item.loading ? "text-mari-muted" : "text-mari-foreground")}>{item.content}</div>
        </ContentSkeleton>
      </div>
    </li>
  );
}

/**
 * Faz 16.3 — yapı ant.design Timeline'dan (başlık + içerik, renkli ya da ikonlu
 * nokta, start/end/alternate, karşı tarafta başlık, yatay yön, bekleyen öğe,
 * ters sıra), görünüm kendi token'larımızdan. Ray noktanın sütununda büyüyen
 * bir çizgi — içerik uzadıkça kendiliğinden uzar, ölçüm yok.
 *
 * Semantik: kronolojik sıra anlamlı → `<ol>`. Noktalar/ikonlar görsel
 * (`aria-hidden`); durum ("iptal edildi") metinde söylenmeli. Yatay yön taşarsa
 * kaydırılabilir bölge klavyeyle odaklanabilir olur.
 */
export function Timeline({
  items,
  mode = "start",
  orientation = "vertical",
  variant = "outlined",
  titlePlacement = "inline",
  reverse = false,
  pending,
  className,
  skeleton = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: Readonly<TimelineProps>) {
  const all = buildItems(items, pending, reverse);
  const horizontal = orientation === "horizontal";
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollable = useScrollable(scrollRef, "x", [all.length, horizontal]);
  const Row = horizontal ? HorizontalRow : VerticalRow;
  const rowProps = { mode, variant, titlePlacement, skeleton };

  const list = (
    <ol
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-busy={skeleton || undefined}
      className={cn("text-sm", horizontal ? "flex" : "flex flex-col", !horizontal && className)}
    >
      {all.map((item, i) => (
        <Row
          key={item.key ?? i}
          item={item}
          index={i}
          last={i === all.length - 1}
          // Bekleyen öğeye bağlanan ray (iki ucundan biri bekliyorsa) kesikli.
          nextLoading={Boolean(item.loading || all[i + 1]?.loading)}
          props={rowProps}
        />
      ))}
    </ol>
  );

  if (!horizontal) return list;
  return (
    // Taşarken klavyeyle kaydırılabilsin (axe scrollable-region-focusable).
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
    <div ref={scrollRef} tabIndex={scrollable ? 0 : undefined} className={cn("overflow-x-auto pb-1 focus-visible:outline-2 focus-visible:outline-mari-ring", className)}>
      {list}
    </div>
  );
}
