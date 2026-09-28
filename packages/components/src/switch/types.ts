import type { ColorRole, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface SwitchProps extends SkeletonableProps {
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
  /** Etiket yoksa ekran okuyucu için ad. */
  "aria-label"?: string;
}
