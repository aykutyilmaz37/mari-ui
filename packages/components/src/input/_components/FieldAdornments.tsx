import React from "react";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";

const ICON_BUTTON_CLASS =
  "flex shrink-0 cursor-pointer items-center justify-center rounded-sm text-mari-muted hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-mari-ring";

interface ClearButtonProps {
  visible: boolean;
  label: string;
  icon?: React.ReactNode;
  onClear: () => void;
  className?: string;
}

/** Input/Textarea ortak temizle butonu. `invisible` yer ayırır (yazınca metin kaymaz) ve sekme sırasından çıkarır. */
export function ClearButton({ visible, label, icon, onClear, className }: ClearButtonProps) {
  return (
    <button
      type="button"
      onClick={onClear}
      aria-label={label}
      className={cn(ICON_BUTTON_CLASS, "invisible size-5 hover:bg-mari-surface-alt", visible && "visible", className)}
    >
      {icon ?? <XIcon size={14} aria-hidden />}
    </button>
  );
}

interface PasswordToggleProps {
  visible: boolean;
  disabled: boolean;
  onToggle: () => void;
  iconRender?: (visible: boolean) => React.ReactNode;
}

export function PasswordToggle({ visible, disabled, onToggle, iconRender }: PasswordToggleProps) {
  const defaultIcon = visible ? <EyeIcon size={16} aria-hidden /> : <EyeOffIcon size={16} aria-hidden />;
  const icon = iconRender ? iconRender(visible) : defaultIcon;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
      aria-pressed={visible}
      disabled={disabled}
      className={cn(ICON_BUTTON_CLASS, "size-6")}
    >
      {icon}
    </button>
  );
}

export function clearIconOf(allowClear: boolean | { clearIcon?: React.ReactNode }): React.ReactNode | undefined {
  return typeof allowClear === "object" ? allowClear.clearIcon : undefined;
}
