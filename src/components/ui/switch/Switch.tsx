import React from "react";
import clsx from "clsx";
import { Button } from "../button";
import { getSizeBallClasses, getSizeClasses } from "./utils";
import { SwitchColor, SwitchSize } from "./types";
import { Loader2Icon } from "lucide-react";

interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  label?: string;
  switchTrueLabel?: string;
  switchFalseLabel?: string;
  size?: SwitchSize;
  color?: SwitchColor;
  loading?: boolean;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
  switchTrueLabel,
  switchFalseLabel,
  size = "middle",
  color = "primary",
  loading,
  className,
}) => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.blur();
    }
  }, [checked]);

  const switchSize = getSizeClasses(size);
  const switchBallSize = getSizeBallClasses(size, checked);

  return (
    <div className="flex items-center w-full gap-2">
      {label && <span className="text-sm">{label}</span>}
      <Button
        ref={buttonRef}
        type={color}
        onClick={() => !disabled && onChange(!checked)}
        className={clsx(
          "relative inline-flex items-center justify-start !p-0.5 rounded-full focus:ring-0 duration-300 overflow-hidden hover:opacity-50 group",
          disabled && "opacity-50 cursor-not-allowed",
          loading && "opacity-50 cursor-not-allowed",
          !checked && "opacity-70",
          switchSize,
          className
        )}
        disabled={disabled || loading}
      >
        <span
          className={clsx(
            "inline-block rounded-full absolute bg-white transform transition-all duration-300",
            checked && "group-focus:scale-x-[1.166] group-focus:origin-right",
            !checked && "group-focus:scale-x-[1.166] group-focus:origin-left",
            switchBallSize
          )}
        >
          {loading && <Loader2Icon className="animate-spin" color="black" />}
        </span>
        <span
          className={clsx(
            "inline-block absolute transform transition-all duration-300",
            checked ? "top-1 left-1" : "top-1 -left-20"
          )}
        >
          {switchTrueLabel}
        </span>
        <span
          className={clsx(
            "inline-block absolute transform transition-all duration-300",
            !checked ? "top-1 right-1" : "top-1 -right-20"
          )}
        >
          {switchFalseLabel}
        </span>
      </Button>
    </div>
  );
};
