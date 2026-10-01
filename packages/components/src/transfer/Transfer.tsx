"use client";

import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { Button } from "../button";
import { useFieldGroup } from "../lib/fieldContext";
import { skeletonBoxProps } from "../lib/skeleton";
import { TransferList } from "./_components/TransferList";
import type { TransferDirection, TransferProps } from "./types";
import { moveKeys, splitLists } from "./utils";

export type { TransferProps };

const EMPTY: string[] = [];

interface MoveButtonProps {
  direction: TransferDirection;
  enabled: boolean;
  label: string;
  text?: string;
  onMove: () => void;
}

/**
 * Seçim yokken `disabled` yerine `aria-disabled`: taşıdıktan sonra düğme
 * pasifleşince odak düğmede kalır (native disabled odağı body'ye düşürürdü).
 */
function MoveButton({ direction, enabled, label, text, onMove }: MoveButtonProps) {
  const Icon = direction === "right" ? ChevronRightIcon : ChevronLeftIcon;
  return (
    <Button
      size="sm"
      variant={enabled ? "solid" : "outline"}
      color={enabled ? "primary" : "neutral"}
      aria-label={label}
      aria-disabled={!enabled}
      onClick={() => enabled && onMove()}
      className={cn(!enabled && "cursor-not-allowed opacity-50", !text && "px-1.5")}
    >
      {/* Dar ekranda listeler alt alta: oklar aşağı/yukarı döner. */}
      <Icon aria-hidden size={16} className="max-sm:rotate-90" />
      {text}
    </Button>
  );
}

/**
 * Faz 16.4 — yapı ant.design Transfer'den: iki liste (kaynak/hedef) arasında
 * işaretlenen öğeleri taşıma. Başlıkta tümünü seç + sayaç, isteğe bağlı arama
 * (Türkçe/aksansız), Shift ile aralık seçimi, `oneWay` (hedefte satır başına
 * "kaldır"), `render`/`footer`. Dar ekranda listeler alt alta.
 *
 * Erişilebilirlik: bileşen bir `group` (Field etiketi adıdır); her liste
 * başlığıyla adlandırılmış `section`, satırlar gerçek işaret kutuları. Taşıma
 * düğmelerinin adı eylemi söyler ("Seçilenleri Hedef listesine taşı"); taşıma
 * sonucu canlı bölgeden duyurulur.
 */
export function Transfer(props: TransferProps) {
  const field = useFieldGroup({ "aria-label": props["aria-label"], "aria-labelledby": props["aria-labelledby"], "aria-describedby": props["aria-describedby"], disabled: props.disabled });
  const {
    dataSource,
    titles = ["Kaynak", "Hedef"],
    operations,
    showSearch = false,
    searchPlaceholder = "Ara",
    filterOption,
    onSearch,
    render,
    oneWay = false,
    showSelectAll = true,
    footer,
    notFoundContent = "Öğe yok",
    listHeight = "14rem",
    color,
    className,
    skeleton = false,
  } = props;
  const disabled = !!field.disabled;
  const [targetKeys, setTargetKeys] = useControllableState<string[]>({ value: props.targetKeys, defaultValue: props.defaultTargetKeys ?? EMPTY });
  const [selectedKeys, setSelectedKeys] = useControllableState<string[]>({ value: props.selectedKeys, defaultValue: props.defaultSelectedKeys ?? EMPTY });
  const [announcement, setAnnouncement] = useState("");

  if (skeleton) {
    return (
      <div aria-hidden className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
        <div {...skeletonBoxProps("flex-1 rounded-lg")} style={{ height: `calc(${listHeight} + 2.5rem)` }} />
        <div {...skeletonBoxProps("hidden size-8 shrink-0 rounded-md sm:block")} />
        <div {...skeletonBoxProps("flex-1 rounded-lg")} style={{ height: `calc(${listHeight} + 2.5rem)` }} />
      </div>
    );
  }

  const { left, right } = splitLists(dataSource, targetKeys);
  const leftKeys = new Set(left.map((i) => i.key));
  const leftSelected = selectedKeys.filter((k) => leftKeys.has(k));
  const rightSelected = selectedKeys.filter((k) => !leftKeys.has(k));
  const disabledKeys = new Set(dataSource.filter((i) => i.disabled).map((i) => i.key));
  const movable = (keys: string[]) => keys.some((k) => !disabledKeys.has(k));
  const FALLBACK_TITLES = ["Kaynak", "Hedef"] as const;
  const titleText = (i: 0 | 1) => {
    const t = titles[i];
    return typeof t === "string" ? t : FALLBACK_TITLES[i];
  };

  const updateSelected = (nextLeft: string[], nextRight: string[]) => {
    setSelectedKeys([...nextLeft, ...nextRight]);
    props.onSelectChange?.(nextLeft, nextRight);
  };

  const move = (direction: TransferDirection, keys: string[]) => {
    const result = moveKeys(dataSource, targetKeys, keys, direction);
    if (result.moved.length === 0) return;
    setTargetKeys(result.targetKeys);
    props.onChange?.(result.targetKeys, direction, result.moved);
    const moved = new Set(result.moved);
    updateSelected(
      leftSelected.filter((k) => !moved.has(k)),
      rightSelected.filter((k) => !moved.has(k))
    );
    const to = direction === "right" ? titleText(1) : titleText(0);
    setAnnouncement(`${result.moved.length} öğe ${to} listesine taşındı.`);
  };

  const listProps = { showSearch, searchPlaceholder, filterOption, onSearch, render, showSelectAll, footer, notFoundContent, listHeight, disabled, color };

  return (
    <div
      role="group"
      aria-label={field["aria-label"]}
      aria-labelledby={field["aria-labelledby"]}
      aria-describedby={field["aria-describedby"]}
      className={cn("flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center", className)}
    >
      <TransferList
        {...listProps}
        direction="left"
        title={titles[0]}
        items={left}
        selected={leftSelected}
        onSelect={(keys) => updateSelected(keys, rightSelected)}
      />
      <div className="flex shrink-0 justify-center gap-2 sm:flex-col">
        <MoveButton
          direction="right"
          enabled={!disabled && movable(leftSelected)}
          label={`Seçilenleri ${titleText(1)} listesine taşı`}
          text={operations?.[0]}
          onMove={() => move("right", leftSelected)}
        />
        {!oneWay && (
          <MoveButton
            direction="left"
            enabled={!disabled && movable(rightSelected)}
            label={`Seçilenleri ${titleText(0)} listesine taşı`}
            text={operations?.[1]}
            onMove={() => move("left", rightSelected)}
          />
        )}
      </div>
      <TransferList
        {...listProps}
        direction="right"
        title={titles[1]}
        items={right}
        selected={oneWay ? EMPTY : rightSelected}
        onSelect={(keys) => updateSelected(leftSelected, keys)}
        onRemove={oneWay ? (keys) => move("left", keys) : undefined}
      />
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}
