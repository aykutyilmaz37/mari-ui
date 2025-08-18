import { Button } from "@/components/ui/button";
import { PlayIcon } from "lucide-react";
import React from "react";
import { twMerge } from "tailwind-merge";
import { SidebarPosition } from "../../types";

type SidebarButtonProps = {
  position: SidebarPosition;
  setVisible: (val: boolean) => void;
  visible: boolean;
};

export const SidebarButton: React.FC<SidebarButtonProps> = ({
  position,
  setVisible,
  visible,
}) => {
  console.log(position);

  return (
    <Button
      className={twMerge(
        "bg-secondary-light transition-all duration-500 ease-in-out w-8 h-8",
        position === "right" && "rounded-r-none ",
        position === "left" && "rounded-l-none "
      )}
      onClick={() => setVisible(!visible)}
    >
      <PlayIcon
        className={twMerge(
          "transition-transform duration-300 fill-secondary-light stroke-secondary",
          position === "right" && (visible ? "rotate-0" : "rotate-180"),
          position === "left" && (visible ? "rotate-180" : "rotate-0")
        )}
      />
    </Button>
  );
};
