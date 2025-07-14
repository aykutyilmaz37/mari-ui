import React from "react";
import clsx from "clsx";
import { Button } from "../button";
import { ButtonPositionType, SizeType, VariantType } from "./types";
import { iconMap, sizeMap } from "./utils";
import { X } from "lucide-react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  closeButtonPosition?: ButtonPositionType;
  footerButtonPosition?: ButtonPositionType;
  children: React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  variant?: VariantType;
  size?: SizeType;
};

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  icon,
  closeButtonPosition = "right",
  children,
  confirmButtonText,
  cancelButtonText,
  onConfirm,
  onCancel,
  variant = "default",
  size = "medium",
  footerButtonPosition = "left",
}) => {
  return (
    <div
      role="none"
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        role="none"
        className={clsx(
          "w-full rounded-lg shadow-lg transition-transform duration-300 transform bg-background text-foreground",
          sizeMap[size],
          open ? "scale-100" : "scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="text-muted">{icon ?? iconMap[variant]()}</span>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          {closeButtonPosition === "right" && (
            <Button onClick={onClose} className="text-muted">
              <X size={20} />
            </Button>
          )}
          {closeButtonPosition === "left" && (
            <Button onClick={onClose} className="text-muted order-first">
              <X size={20} />
            </Button>
          )}
        </div>

        <div className="px-4 py-4">{children}</div>

        {(confirmButtonText || cancelButtonText) && (
          <div
            className={clsx(
              "flex gap-2 px-4 py-3 border-t border-border",
              footerButtonPosition === "right" && "justify-end",
              footerButtonPosition === "left" && "justify-start"
            )}
          >
            {cancelButtonText && (
              <Button
                onClick={onCancel ?? onClose}
                className="px-4 py-2 text-sm rounded bg-background-alt"
              >
                {cancelButtonText}
              </Button>
            )}
            {confirmButtonText && (
              <Button
                onClick={onConfirm}
                className="px-4 py-2 text-sm text-background bg-primary rounded"
              >
                {confirmButtonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
