import type React from "react";
import type { ColorRole, Placement as CorePlacement, Variant } from "@mari-ui/core";

/** Sadece 4 ana yön render edilir — bkz. tooltip/utils.ts'teki aynı not. */
export type Placement = CorePlacement;

export interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
  /** Verilmezse trigger düz (renksiz) render edilir — eski `variant="none"` varsayılanına karşılık gelir. */
  color?: ColorRole;
  variant?: Variant;
}

export interface DropdownContentProps {
  placement?: Placement;
  className?: string;
  children: React.ReactNode;
  customVisible?: boolean;
}

export interface DropdownProps {
  children:
    | [React.ReactElement<DropdownTriggerProps>, React.ReactElement<DropdownContentProps>]
    | React.ReactElement<DropdownContentProps>;
  hover?: boolean;
}
