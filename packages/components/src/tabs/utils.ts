import React from "react";
import { cn, type ColorRole } from "@mari-ui/core";
import { bgSolidClass, bgSubtleClass, borderColorClass, textClass } from "../lib/colorClasses";

export function cloneWithRef<T extends HTMLElement = HTMLElement>(element: React.ReactElement, ref: React.Ref<T>) {
  return React.cloneElement(element as React.ReactElement<{ ref?: React.Ref<T> }>, { ref });
}

export function calculateUnderlinePosition(button: HTMLButtonElement, container: HTMLDivElement): { width: number; left: number } {
  const buttonRect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return { width: buttonRect.width, left: buttonRect.left - containerRect.left };
}

export function getTabsTriggerClassNames(active: boolean, cardTabs: boolean, color: ColorRole): string {
  if (cardTabs && active) {
    return cn("bg-mari-surface border border-b-0 rounded-b-none rounded-t-lg", borderColorClass[color], textClass[color]);
  }
  if (cardTabs && !active) {
    return cn("border border-b-0 rounded-b-none rounded-t-lg", borderColorClass[color], bgSubtleClass[color], textClass[color]);
  }
  return active ? cn(textClass[color], "bg-mari-surface") : "text-mari-muted bg-mari-surface";
}

export function getUnderlineClass(cardTabs: boolean, color: ColorRole): string {
  return cardTabs ? "bg-mari-surface" : bgSolidClass[color];
}
