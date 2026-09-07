"use client";

import React from "react";
import type { DropdownProps } from "./types";
import { DropdownProvider, useDropdown } from "./useDropdown";

export type { DropdownProps };

function DropdownRoot({ children, hover = false }: DropdownProps) {
  const { setVisible } = useDropdown();
  return (
    <div
      role="menu"
      tabIndex={0}
      className="relative"
      onMouseEnter={hover ? () => setVisible(true) : undefined}
      onMouseLeave={hover ? () => setVisible(false) : undefined}
    >
      {children}
    </div>
  );
}

/** `DropdownProvider`ı kendi içine gömer — tüketicinin ayrıca sarması gerekmez. */
export function Dropdown(props: DropdownProps) {
  return (
    <DropdownProvider>
      <DropdownRoot {...props} />
    </DropdownProvider>
  );
}
