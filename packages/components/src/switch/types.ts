import type { ColorRole, Size } from "@mari-ui/core";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  switchTrueLabel?: string;
  switchFalseLabel?: string;
  size?: Size;
  /** Varsayılan: `primary`. */
  color?: ColorRole;
  loading?: boolean;
  className?: string;
}
