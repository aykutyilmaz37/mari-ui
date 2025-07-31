import React from "react";

export function cloneWithRef<T extends HTMLElement = HTMLElement>(
  element: React.ReactElement,
  ref: React.Ref<T>
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return React.cloneElement(element, { ref } as any);
}

export function calculateUnderlinePosition(
  button: HTMLButtonElement,
  container: HTMLDivElement
): { width: number; left: number } {
  const buttonRect = button.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return {
    width: buttonRect.width,
    left: buttonRect.left - containerRect.left,
  };
}

export function getTabsTriggerClassNames(active: boolean, cardTabs: boolean) {
  if (cardTabs && active) {
    return "bg-white text-info border border-secondary border-b-0 rounded-b-none rounded-t-lg";
  }

  if (cardTabs && !active) {
    return "border border-secondary border-b-0 rounded-b-none rounded-t-lg bg-secondary/20 text-secondary";
  }

  return active ? "text-info bg-white" : "text-secondary bg-white";
}
