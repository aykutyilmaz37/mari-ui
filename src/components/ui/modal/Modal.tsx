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
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity duration-300",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          "w-full rounded-lg shadow-lg transition-transform duration-300 bg-white transform",
          sizeMap[size],
          open ? "scale-100" : "scale-95"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex  items-center justify-between px-4 py-3 border-b border-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">{icon ?? iconMap[variant]()}</span>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          </div>
          {closeButtonPosition === "right" && (
            <Button
              onClick={onClose}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </Button>
          )}
          {closeButtonPosition === "left" && (
            <Button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 order-first"
            >
              <X size={20} />
            </Button>
          )}
        </div>
        <div className="px-4 py-4">{children}</div>
        {(confirmButtonText || cancelButtonText) && (
          <div
            className={clsx(
              "flex gap-2 px-4 py-3 border-t border-gray-300",
              footerButtonPosition === "right" && "justify-end ",
              footerButtonPosition === "left" && "justify-start "
            )}
          >
            {cancelButtonText && (
              <Button
                onClick={onCancel ?? onClose}
                className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
              >
                {cancelButtonText}
              </Button>
            )}
            {confirmButtonText && (
              <Button
                onClick={onConfirm}
                className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
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
