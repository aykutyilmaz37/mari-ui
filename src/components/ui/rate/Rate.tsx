import React from "react";
import clsx from "clsx";
import { Star } from "lucide-react";
import { handleClick, handleMouseEnter, handleMouseLeave } from "./utils";

export interface RateProps {
  allowClear?: boolean;
  allowHalf?: boolean;
  autoFocus?: boolean;
  character?: React.ReactNode | ((props: RateProps) => React.ReactNode);
  className?: string;
  count?: number;
  defaultValue?: number;
  disabled?: boolean;
  value?: number;
  onBlur?: () => void;
  onChange?: (value: number) => void;
  onFocus?: () => void;
  onHoverChange?: (value: number) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  characterSize?: number;
  characterColor?: string;
}

export const Rate: React.FC<RateProps> = ({
  allowClear = true,
  allowHalf = false,
  autoFocus = false,
  character,
  className,
  count = 5,
  defaultValue = 0,
  disabled = false,
  value,
  onBlur,
  onChange,
  onFocus,
  onHoverChange,
  onKeyDown,
  characterSize = 24,
  characterColor,
}) => {
  const [hoverValue, setHoverValue] = React.useState<number | undefined>(
    undefined
  );
  const [internalValue, setInternalValue] =
    React.useState<number>(defaultValue);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const isControlled = value !== undefined;
  const displayValue = isControlled ? value : internalValue;

  React.useEffect(() => {
    if (autoFocus && rootRef.current) {
      rootRef.current.focus();
    }
  }, [autoFocus]);

  const stars = Array.from({ length: count }, (_, i) => {
    const currentValue = hoverValue ?? displayValue;
    const isFull = currentValue >= i + 1;
    const isHalf = !isFull && allowHalf && currentValue >= i + 0.5;
    const icon =
      typeof character === "function"
        ? character({})
        : character ?? (
            <Star
              fill="currentColor"
              stroke="currentColor"
              size={characterSize}
            />
          );
    return (
      <span
        key={i}
        onClick={(e) => {
          if (!disabled) {
            handleClick(
              e,
              i,
              allowHalf,
              allowClear,
              displayValue,
              isControlled,
              setInternalValue,
              onChange
            );
          }
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            handleMouseEnter(e, i, allowHalf, setHoverValue, onHoverChange);
          }
        }}
        onMouseMove={(e) => {
          if (!disabled) {
            handleMouseEnter(e, i, allowHalf, setHoverValue, onHoverChange);
          }
        }}
        onMouseLeave={() => {
          if (!disabled) {
            handleMouseLeave(setHoverValue, onHoverChange);
          }
        }}
        className={clsx(
          "relative inline-flex items-center justify-center  select-none",
          {
            "text-gray-300": !isFull && !isHalf,
            "text-yellow-400": isFull || isHalf,
             'cursor-not-allowed': disabled, 'cursor-pointer': !disabled,
          },
          className
        )}
        style={{ fontSize: characterSize }}
      >
        <span
          className="absolute inset-0 w-full h-full text-gray-300 pointer-events-none"
          aria-hidden
        >
          {icon}
        </span>
        {/* Dolu yıldız veya yarım yıldız */}
        {isFull ? (
          <span
            className={clsx(
              "absolute inset-0 w-full h-full  pointer-events-none",
              characterColor || "text-yellow-400"
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : isHalf ? (
          <span
            className={clsx(
              "absolute inset-0 h-full w-1/2 overflow-hidden pointer-events-none",
              characterColor || "text-yellow-400"
            )}
            aria-hidden
            style={{ left: 0 }}
          >
            {icon}
          </span>
        ) : null}
        {/* Tıklanabilir alan (görseli hizalamak için) */}
        <span className="invisible" aria-hidden>
          {icon}
        </span>
      </span>
    );
  });

  return (
    <div
      ref={rootRef}
      className={clsx("flex gap-1 outline-none", className)}
      tabIndex={disabled ? -1 : 0}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    >
      {stars}
    </div>
  );
};

export default Rate;
