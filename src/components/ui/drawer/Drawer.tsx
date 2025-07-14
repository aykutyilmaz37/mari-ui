import { X } from "lucide-react";
import clsx from "clsx";
import React from "react";
import {
  getDimensionClass,
  getBasePositionClass,
  getAnimationClass,
} from "./utils";
import { DrawerPosition, DrawerSize } from "./types";

type DrawerProps = {
  position?: DrawerPosition;
  size?: DrawerSize;
  open: boolean;
  onClose: () => void;
  showCloseButton?: boolean;
  closeButtonPosition?: "left" | "right";
  loading?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children?: React.ReactNode;
};

export const Drawer: React.FC<DrawerProps> = ({
  position = "right",
  size = "md",
  open,
  onClose,
  showCloseButton = true,
  closeButtonPosition = "right",
  loading = false,
  header,
  footer,
  children,
}) => {
  const isHorizontal = position === "left" || position === "right";

  const dimensionClass = getDimensionClass(size, isHorizontal);
  const basePositionClass = getBasePositionClass(position);
  const animationClass = getAnimationClass(open, position);

  return (
    <div
      className={clsx(
        "fixed inset-0 z-40 transition-opacity duration-300",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className="absolute inset-0 bg-black/30"
        role="none"
        onClick={onClose}
      />
      <div
        className={clsx(
          basePositionClass,
          dimensionClass,
          animationClass,
          "flex flex-col",
          "bg-background",
          "text-foreground"
        )}
      >
        {(header || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {closeButtonPosition === "left" && showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="mr-2 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
            <div className="flex-1 text-center">{header}</div>
            {closeButtonPosition === "right" && showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close drawer"
                className="ml-2 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-4 flex-1 overflow-auto">
          {loading ? (
            <p className="text-center text-base">Loading...</p>
          ) : (
            children
          )}
        </div>

        {footer && <div className="border-t border-border p-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Drawer;
