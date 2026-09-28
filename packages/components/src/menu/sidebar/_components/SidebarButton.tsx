import React from "react";
import { PanelLeftCloseIcon, PanelLeftOpenIcon, PanelRightCloseIcon, PanelRightOpenIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import type { SidebarPosition } from "../../types";
import { touchTargetSquareClass } from "../../../lib/sizeClasses";

export interface SidebarButtonProps {
  position: SidebarPosition;
  setVisible: (val: boolean) => void;
  visible: boolean;
  controlsId: string;
}

/**
 * `variant="click"`in aç/kapa düğmesi. Eskiden bir ▶ "oynat" ikonuydu
 * (döndürülerek yön veriliyordu) — anlamı "medya oynat"; kenar çubuğu
 * için standart olan panel aç/kapa ikonları kullanılıyor. Kenara yapışık
 * küçük bir sekme: sidebar kapalıyken de ekranda kalan tek tutamaç.
 */
export function SidebarButton({ position, setVisible, visible, controlsId }: SidebarButtonProps) {
  const isLeft = position === "left";
  let Icon = isLeft ? PanelLeftOpenIcon : PanelRightOpenIcon;
  if (visible) Icon = isLeft ? PanelLeftCloseIcon : PanelRightCloseIcon;

  return (
    <button
      type="button"
      aria-label={visible ? "Kenar çubuğunu kapat" : "Kenar çubuğunu aç"}
      aria-expanded={visible}
      aria-controls={controlsId}
      onClick={() => setVisible(!visible)}
      className={cn(
        "relative mt-3 inline-flex size-9 shrink-0",
        touchTargetSquareClass.md,
        " cursor-pointer items-center justify-center self-start border border-mari-border bg-mari-surface text-mari-muted shadow-mari-sm transition-colors hover:bg-mari-surface-alt hover:text-mari-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mari-ring",
        isLeft ? "rounded-r-lg border-l-0" : "rounded-l-lg border-r-0"
      )}
    >
      <Icon aria-hidden="true" size={18} />
    </button>
  );
}
