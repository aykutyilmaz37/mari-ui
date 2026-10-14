"use client";

import React, { useEffect, useId, useRef } from "react";
import { XIcon } from "lucide-react";
import { cn, useControllableState } from "@mari-ui/core";
import { elevationClass } from "../lib/elevationClass";
import { skeletonBoxProps } from "../lib/skeleton";
import { Tooltip } from "../tooltip";
import { FloatGroupContext, floatButtonClass } from "./FloatButton";
import type { FloatButtonGroupMenuProps, FloatButtonGroupProps } from "./types";
import { opensUpward, PLACEMENT_CLASS } from "./utils";

export type { FloatButtonGroupProps };

const HOVER_CLOSE_MS = 150;

/** Açılır grubun dışarı tıklama / Escape ile kapanması; Escape'te odak ana düğmeye döner. */
function useMenuDismiss(open: boolean, rootRef: React.RefObject<HTMLDivElement | null>, triggerRef: React.RefObject<HTMLButtonElement | null>, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) closeRef.current();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || !rootRef.current?.contains(document.activeElement)) return;
      e.preventDefault();
      closeRef.current();
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [open, rootRef, triggerRef]);
}

function MenuGroup(props: Readonly<FloatButtonGroupMenuProps>) {
  const { trigger, shape = "circle", placement = "bottom-right", icon, color = "primary", tooltip, "aria-label": ariaLabel = "Hızlı işlemler", children, className, skeleton = false } = props;
  const [open, setOpen] = useControllableState<boolean>({ value: props.open, defaultValue: props.defaultOpen ?? false, onChange: props.onOpenChange });
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  useMenuDismiss(open, rootRef, triggerRef, () => setOpen(false));
  const up = opensUpward(placement);

  const hover =
    trigger === "hover"
      ? {
          onMouseEnter: () => {
            clearTimeout(timer.current);
            setOpen(true);
          },
          onMouseLeave: () => {
            timer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_MS);
          },
        }
      : {};

  let main: React.ReactElement = (
    <button
      ref={triggerRef}
      type="button"
      aria-label={ariaLabel}
      aria-expanded={open}
      aria-controls={menuId}
      onClick={() => setOpen(!open)}
      className={cn(floatButtonClass({ color, shape, joined: false, hasDescription: false }), elevationClass.lg)}
    >
      <span aria-hidden className={cn("flex transition-transform duration-200 motion-reduce:transition-none [&_svg]:size-5", open && "rotate-90")}>
        {open ? <XIcon /> : icon}
      </span>
    </button>
  );
  if (skeleton) main = <span {...skeletonBoxProps(cn("block size-10", shape === "square" ? "rounded-lg" : "rounded-full"))} />;
  else if (tooltip && !open) main = <Tooltip content={tooltip} placement={placement.endsWith("right") ? "left" : "right"} trigger={main} />;

  return (
    <div ref={rootRef} {...hover} className={cn("fixed z-mari-sticky flex items-center gap-3", up ? "flex-col-reverse" : "flex-col", PLACEMENT_CLASS[placement], className)}>
      {main}
      {/* Kapalıyken DOM'da değil (Tab ile gizli düğmelere gidilmesin). */}
      {open && (
        <FloatGroupContext.Provider value={{ shape, joined: false }}>
          <div
            id={menuId}
            role="group"
            aria-label={ariaLabel}
            className={cn(
              "flex items-center gap-3 transition-[opacity,translate] duration-200 starting:opacity-0 motion-reduce:transition-none",
              up ? "flex-col-reverse starting:translate-y-2" : "flex-col starting:-translate-y-2",
              "[&>*]:rounded-full [&>*]:shadow-mari-md"
            )}
          >
            {children}
          </div>
        </FloatGroupContext.Provider>
      )}
    </div>
  );
}

/**
 * Faz 16.6 — FloatButton.Group: birden çok yüzen düğme. `trigger` yoksa hep
 * görünür bir sütun (kare şekilde tek kart gibi birleşik); `trigger`
 * verilirse ana düğme menüyü açar (`aria-expanded`), Escape/dışarı tıklama
 * kapatır ve odak ana düğmeye döner.
 */
export function FloatButtonGroup(props: FloatButtonGroupProps) {
  if (props.trigger) return <MenuGroup {...props} />;
  const { shape = "circle", placement = "bottom-right", children, className, skeleton } = props;
  const joined = shape === "square";
  return (
    <FloatGroupContext.Provider value={{ shape, joined, skeleton }}>
      <div
        role="group"
        aria-busy={skeleton || undefined}
        className={cn(
          "fixed z-mari-sticky flex flex-col",
          PLACEMENT_CLASS[placement],
          joined ? cn("overflow-hidden rounded-lg border border-mari-border divide-y divide-mari-border", elevationClass.lg) : "gap-3 [&>*]:rounded-full [&>*]:shadow-mari-lg",
          className
        )}
      >
        {children}
      </div>
    </FloatGroupContext.Provider>
  );
}
