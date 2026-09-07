import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";

export type ButtonPositionType = "left" | "right";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  /** İkon ve vurgu rengini belirler. Verilmezse ikon gösterilmez (eski `variant="default"`). */
  color?: ColorRole;
  closeButtonPosition?: ButtonPositionType;
  footerButtonPosition?: ButtonPositionType;
  children: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  size?: Size;
}
