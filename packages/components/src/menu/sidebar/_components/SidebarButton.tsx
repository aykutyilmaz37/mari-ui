import React from "react";
import { PlayIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../../button";
import type { SidebarPosition } from "../../types";

export interface SidebarButtonProps {
  position: SidebarPosition;
  setVisible: (val: boolean) => void;
  visible: boolean;
}

export function SidebarButton({ position, setVisible, visible }: SidebarButtonProps) {
  return (
    <Button
      variant="soft"
      color="neutral"
      aria-label={visible ? "Kenar çubuğunu kapat" : "Kenar çubuğunu aç"}
      className={cn("transition-all duration-500 ease-in-out w-8 h-8", position === "right" && "rounded-r-none", position === "left" && "rounded-l-none")}
      onClick={() => setVisible(!visible)}
    >
      <PlayIcon
        className={cn(
          "transition-transform duration-300",
          position === "right" && (visible ? "rotate-0" : "rotate-180"),
          position === "left" && (visible ? "rotate-180" : "rotate-0")
        )}
      />
    </Button>
  );
}
