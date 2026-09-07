import type React from "react";
import type { Size } from "@mari-ui/core";

export type SliderValue = number | [number, number];
export type SliderIconItem = { icon: React.ReactNode; value: number };
export type SliderIconPosition = "top" | "bottom";

export interface SliderProps {
  value?: SliderValue;
  defaultValue?: SliderValue;
  size?: Size;
  min?: number;
  max?: number;
  vertical?: boolean;
  disabled?: boolean;
  tooltipVisible?: boolean;
  tooltipAlwaysVisible?: boolean;
  iconList?: SliderIconItem[];
  iconPosition?: SliderIconPosition;
  showInput?: boolean;
  onChange?: (value: number | [number, number]) => void;
}
