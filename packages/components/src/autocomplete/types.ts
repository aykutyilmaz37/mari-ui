import type React from "react";
import type { ColorRole, Size } from "@mari-ui/core";
import type { SkeletonableProps } from "../lib/skeleton";

export interface Option {
  id: number;
  value: string;
}

export interface AutoCompleteProps extends SkeletonableProps {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onSearch?: (value: string) => void;
  /** Bir seçenek seçildiğinde çağrılır. */
  onSelect?: (value: string) => void;
  placeholder?: string;
  /** @deprecated `closeOnBlur` kullanın — aynı şey, daha açık bir isim. */
  onBlur?: boolean;
  closeOnBlur?: boolean;
  /** Hiçbir seçenek eşleşmezken listede gösterilecek içerik. Verilmezse liste kapanır. */
  notFoundContent?: React.ReactNode;
  size?: Size;
  /** `error`/`warning` doğrulama durumu olarak da işlev görür. */
  color?: ColorRole;
  disabled?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  className?: string;
}
