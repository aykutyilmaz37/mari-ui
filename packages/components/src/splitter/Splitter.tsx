"use client";

import React, { Children, isValidElement, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { SplitterPanelProps, SplitterProps } from "./types";
import { initialSizes, limitsOf, moveHandle, parseStored, setPanelSize, type PanelLimits } from "./utils";

export type { SplitterProps, SplitterPanelProps };

const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Klavye adımı (px); Shift ile 4 katı. */
const KEY_STEP = 16;
/** Daraltılmış sayılma eşiği (oran). */
const COLLAPSED = 0.001;

// Tailwind derleme tarayıcısı için literal sınıflar.
const STACK_DIRECTION = { sm: "flex-col sm:flex-row", md: "flex-col md:flex-row", lg: "flex-col lg:flex-row", none: "flex-row" } as const;
const STACK_PANEL_FLEX = { sm: "sm:[flex:var(--mari-split)]", md: "md:[flex:var(--mari-split)]", lg: "lg:[flex:var(--mari-split)]", none: "[flex:var(--mari-split)]" } as const;
const STACK_HANDLE = { sm: "hidden sm:flex", md: "hidden md:flex", lg: "hidden lg:flex", none: "flex" } as const;

/**
 * Panel — `Splitter`ın çocuğu. Kendisi bir şey çizmez; Splitter props'larını
 * okuyup paneli kendi kapsayıcısıyla çizer (boyut Splitter'ın durumunda).
 */
export function SplitterPanel(props: Readonly<SplitterPanelProps>) {
  return <>{props.children}</>;
}

/**
 * Bölünmüş görünüm (ant.design Splitter yapısı): paneller arasındaki
 * tutamaç sürüklenerek ya da klavyeyle boyut değiştirir. Liste + detay,
 * düzenleyici + önizleme gibi iş ekranları için.
 *
 * - Tutamaç APG "window splitter": `role="separator"`, odaklanır; ←/→ (dikeyde
 *   ↑/↓) 16px, Shift ile 64px; Home/End min/max; Enter daraltılabilir paneli
 *   kapatır/açar. Değer: önceki panelin yüzdesi.
 * - Yalnız iki komşu panel değişir; min/max her zaman korunur.
 * - Mobil: `stackBelow` altında paneller alt alta, tutamaçlar gizli (saf CSS).
 * - `storageKey`: kullanıcının ayarladığı düzen hatırlanır.
 */
export function Splitter({ orientation = "horizontal", stackBelow = "md", storageKey, onResize, onResizeEnd, children, className, style }: Readonly<SplitterProps>) {
  const panels = Children.toArray(children).filter((c): c is React.ReactElement<SplitterPanelProps> => isValidElement(c));
  const count = panels.length;
  const horizontal = orientation === "horizontal";
  const stack = horizontal ? stackBelow : "none";
  const baseId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  // `null`: henüz ölçülmedi — ilk çıktı varsayılan boyutlara göre CSS ile (SSR).
  const [sizes, setSizes] = useState<number[] | null>(null);
  const sizesRef = useRef<number[] | null>(null);
  sizesRef.current = sizes;
  /** Daraltmadan önceki oranlar (açınca geri dönülür). */
  const restore = useRef<Record<number, number>>({});
  const [dragging, setDragging] = useState<number | null>(null);

  /** Tutamaçlar hariç kullanılabilir alan (px). */
  const available = useCallback(() => {
    const root = rootRef.current;
    if (!root) return 0;
    const total = horizontal ? root.clientWidth : root.clientHeight;
    const handles = Array.from(root.children).filter((c) => (c as HTMLElement).dataset.splitterHandle !== undefined);
    const handleSize = handles.reduce((sum, h) => sum + (horizontal ? (h as HTMLElement).offsetWidth : (h as HTMLElement).offsetHeight), 0);
    return Math.max(0, total - handleSize);
  }, [horizontal]);

  const limits = useCallback((): PanelLimits[] => panels.map((p) => limitsOf(p.props.min, p.props.max, available())), [panels, available]);

  // İlk ölçüm (boyamadan önce): kayıtlı düzen ya da varsayılan boyutlar → oran.
  useIsomorphicLayoutEffect(() => {
    const stored = storageKey && typeof localStorage !== "undefined" ? parseStored(safeRead(storageKey), count) : null;
    setSizes(stored ?? initialSizes(panels.map((p) => p.props.defaultSize), available()));
  }, [count, storageKey]);

  const commit = useCallback(
    (next: number[]) => {
      if (storageKey) safeWrite(storageKey, JSON.stringify(next));
      onResizeEnd?.(next);
    },
    [storageKey, onResizeEnd]
  );

  const update = (next: number[]) => {
    setSizes(next);
    onResize?.(next);
  };

  /** Tutamaç `index`in daraltacağı panel: önce soldaki/üstteki, o değilse sağdaki/alttaki. */
  const collapseTarget = (index: number): number | null => {
    if (panels[index]?.props.collapsible) return index;
    if (panels[index + 1]?.props.collapsible) return index + 1;
    return null;
  };

  const toggleCollapse = (index: number) => {
    const current = sizesRef.current;
    const target = collapseTarget(index);
    if (!current || target === null) return;
    const neighbor = target === index ? index + 1 : index;
    let next: number[];
    if (current[target]! <= COLLAPSED) {
      next = setPanelSize(current, target, neighbor, restore.current[target] ?? 1 / count);
    } else {
      restore.current[target] = current[target]!;
      next = setPanelSize(current, target, neighbor, 0);
    }
    update(next);
    commit(next);
  };

  /** Daraltılabilir panel sürüklemede min'in altına inebilir (0'a kapanır). */
  const dragLimits = (index: number) => {
    const all = limits();
    const target = collapseTarget(index);
    if (target !== null) all[target] = { ...all[target]!, min: 0 };
    return all;
  };

  const onPointerDown = (index: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !sizesRef.current) return;
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const start = horizontal ? e.clientX : e.clientY;
    const startSizes = sizesRef.current;
    const avail = available();
    const lim = dragLimits(index);
    setDragging(index);
    let last = startSizes;
    const move = (ev: PointerEvent) => {
      const delta = ((horizontal ? ev.clientX : ev.clientY) - start) / (avail || 1);
      last = moveHandle(startSizes, index, delta, lim);
      update(last);
    };
    const up = () => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
      handle.removeEventListener("pointercancel", up);
      setDragging(null);
      commit(last);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
    handle.addEventListener("pointercancel", up);
  };

  const onKeyDown = (index: number) => (e: React.KeyboardEvent<HTMLDivElement>) => {
    const current = sizesRef.current;
    if (!current) return;
    const avail = available() || 1;
    const step = (KEY_STEP * (e.shiftKey ? 4 : 1)) / avail;
    const back = horizontal ? "ArrowLeft" : "ArrowUp";
    const forward = horizontal ? "ArrowRight" : "ArrowDown";
    const lim = limits();
    let next: number[] | null = null;
    if (e.key === back) next = moveHandle(current, index, -step, lim);
    else if (e.key === forward) next = moveHandle(current, index, step, lim);
    else if (e.key === "Home") next = moveHandle(current, index, -1, lim);
    else if (e.key === "End") next = moveHandle(current, index, 1, lim);
    else if (e.key === "Enter" && collapseTarget(index) !== null) {
      e.preventDefault();
      toggleCollapse(index);
      return;
    }
    if (!next) return;
    e.preventDefault();
    update(next);
    commit(next);
  };

  return (
    <div
      ref={rootRef}
      data-orientation={orientation}
      className={cn("flex min-h-0 min-w-0", horizontal ? STACK_DIRECTION[stack] : "flex-col", dragging !== null && "select-none", className)}
      style={style}
    >
      {panels.map((panel, i) => {
        const size = sizes?.[i];
        const collapsed = size !== undefined && size <= COLLAPSED;
        const next = panels[i + 1];
        const target = collapseTarget(i);
        const lim = sizes ? limits()[i] : undefined;
        return (
          <React.Fragment key={panel.key ?? i}>
            <div
              id={`${baseId}-panel-${i}`}
              data-splitter-panel=""
              inert={collapsed || undefined}
              className={cn("min-h-0 min-w-0 overflow-auto", STACK_PANEL_FLEX[stack], collapsed && "overflow-hidden", panel.props.className)}
              style={{ ...panel.props.style, ["--mari-split" as string]: panelFlex(size, panel.props.defaultSize) }}
            >
              {panel.props.children}
            </div>
            {next && (
              <SplitterHandle
                horizontal={horizontal}
                stack={stack}
                label={panelLabel(panel, i)}
                controls={`${baseId}-panel-${i}`}
                percent={size !== undefined ? Math.round(size * 100) : undefined}
                limits={lim}
                resizable={panel.props.resizable !== false && next.props.resizable !== false}
                active={dragging === i}
                onPointerDown={onPointerDown(i)}
                onKeyDown={onKeyDown(i)}
                collapse={
                  target === null
                    ? undefined
                    : {
                        label: panelLabel(panels[target]!, target),
                        collapsed: (sizes?.[target] ?? 1) <= COLLAPSED,
                        isStart: target === i,
                        onToggle: () => toggleCollapse(i),
                      }
                }
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/** Ölçümden önce (SSR / ilk kare): px varsayılan sabit, yüzde sabit, verilmeyen esner; sonra oran. */
function panelFlex(size: number | undefined, defaultSize: SplitterPanelProps["defaultSize"]): string {
  if (size !== undefined) return `${size} 1 0px`;
  if (typeof defaultSize === "number") return `0 0 ${defaultSize}px`;
  if (defaultSize) return `0 0 ${defaultSize}`;
  return "1 1 0px";
}

const panelLabel = (panel: React.ReactElement<SplitterPanelProps>, index: number) => panel.props.label ?? `Panel ${index + 1}`;

interface SplitterHandleProps {
  horizontal: boolean;
  stack: keyof typeof STACK_HANDLE;
  label: string;
  controls: string;
  percent?: number;
  limits?: PanelLimits;
  resizable: boolean;
  active: boolean;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
  onKeyDown: React.KeyboardEventHandler<HTMLDivElement>;
  collapse?: { label: string; collapsed: boolean; isStart: boolean; onToggle: () => void };
}

/**
 * Tutamaç — APG "window splitter": odaklanabilir `separator` bir ARIA widget'ıdır
 * (değer taşır, klavyeyle değişir); lint eklentisi bunu etkileşimsiz sanıyor.
 */
function SplitterHandle({ horizontal, stack, label, controls, percent, limits: lim, resizable, active, onPointerDown, onKeyDown, collapse }: Readonly<SplitterHandleProps>) {
  return (
    // Sarmalayıcı: 1px'lik yer + ortak hover grubu. Daraltma düğmesi tutamacın İÇİNDE değil kardeşi
    // (separator içinde düğme = iç içe etkileşimli öğe, axe nested-interactive).
    <div data-splitter-handle="" className={cn("group/handle relative z-10 shrink-0 items-center justify-center", STACK_HANDLE[stack], horizontal ? "w-px flex-col" : "h-px flex-row")}>
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- odaklanabilir separator = ARIA widget (window splitter) */}
      <div
        role="separator"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- APG window splitter: tutamaç klavyeyle odaklanır
        tabIndex={resizable ? 0 : undefined}
        aria-orientation={horizontal ? "vertical" : "horizontal"}
        aria-label={`${label} panelini yeniden boyutlandır`}
        aria-controls={controls}
        aria-valuenow={percent}
        aria-valuemin={lim ? Math.round(lim.min * 100) : undefined}
        aria-valuemax={lim ? Math.round(lim.max * 100) : undefined}
        aria-disabled={resizable ? undefined : true}
        onPointerDown={resizable ? onPointerDown : undefined}
        onKeyDown={resizable ? onKeyDown : undefined}
        className={cn(
          // Görünen çizgi 1px; tıklama alanı ::before ile her yana 4px (dokunmatikte 10px).
          "peer/separator absolute inset-0 bg-mari-border outline-none",
          "before:absolute before:content-['']",
          horizontal ? "before:inset-y-0 before:-inset-x-1 pointer-coarse:before:-inset-x-2.5" : "before:inset-x-0 before:-inset-y-1 pointer-coarse:before:-inset-y-2.5",
          // Odak halkası çizginin etrafında (1px çizgiye outline görünmez kalır).
          "focus-visible:ring-2 focus-visible:ring-mari-ring",
          resizable && (horizontal ? "cursor-col-resize" : "cursor-row-resize"),
          resizable && "transition-colors group-hover/handle:bg-mari-primary-solid focus-visible:bg-mari-primary-solid motion-reduce:transition-none",
          active && "bg-mari-primary-solid"
        )}
      />
      {collapse && resizable && (
        <CollapseButton
          horizontal={horizontal}
          // Ok, daraltılacak panele doğru; kapalıyken ters (açılacak yöne).
          towardStart={collapse.isStart !== collapse.collapsed}
          collapsed={collapse.collapsed}
          label={collapse.label}
          onClick={collapse.onToggle}
        />
      )}
    </div>
  );
}

function CollapseButton({ horizontal, towardStart, collapsed, label, onClick }: Readonly<{ horizontal: boolean; towardStart: boolean; collapsed: boolean; label: string; onClick: () => void }>) {
  let Icon = towardStart ? ChevronUpIcon : ChevronDownIcon;
  if (horizontal) Icon = towardStart ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      // Tutamacın sürüklemesini başlatmasın.
      onPointerDown={(e) => e.stopPropagation()}
      onClick={onClick}
      tabIndex={-1}
      aria-label={collapsed ? `${label} panelini aç` : `${label} panelini kapat`}
      className={cn(
        "absolute z-10 grid size-5 cursor-pointer place-items-center rounded-full border border-mari-border bg-mari-surface text-mari-muted shadow-mari-sm",
        "opacity-0 transition-opacity group-hover/handle:opacity-100 peer-focus-visible/separator:opacity-100 hover:text-mari-foreground motion-reduce:transition-none",
        collapsed && "opacity-100"
      )}
    >
      <Icon aria-hidden className="size-3.5" />
    </button>
  );
}

function safeRead(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeWrite(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Gizli pencere / dolu depo: düzen yalnız bu oturumda kalır.
  }
}
