import type React from "react";
import type { Size } from "@mari-ui/core";

export type DrawerPosition = "top" | "bottom" | "left" | "right";
export type DrawerSize = Size;
export type DrawerCloseButtonPosition = "left" | "right";

export interface DrawerProps {
  position?: DrawerPosition;
  size?: DrawerSize;
  open: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  closeButtonPosition?: DrawerCloseButtonPosition;
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}
