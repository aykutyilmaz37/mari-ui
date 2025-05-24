"use client";
import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  getTextareaSizeClasses,
  getVariantClasses,
  getStatusClasses,
  isClearable,
} from "./utils";
import { TextareaAutoSize } from "./types";
import { InputProps } from "./Input";

export type TextareaProps = Omit<
  InputProps,
  | "type"
  | "onChange"
  | "onPressEnter"
  | "onClear"
  | "icon"
  | "iconPosition"
  | "onKeyDown"
  | "onFocus"
  | "onInput"
> & {
  autoSize?: TextareaAutoSize;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear?: () => void;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      placeholder,
      allowClear = false,
      classNames = {},
      className = "",
      count,
      defaultValue = "",
      disabled = false,
      id,
      maxLength,
      showCount,
      status,
      size = "middle",
      variant = "outlined",
      value,
      onChange,
      onClear,
      autoSize = false,
      ...rest
    },
    ref
  ) => {
    const innerRef = useRef<HTMLTextAreaElement>(null);

    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const [internalValue, setInternalValue] = useState(value ?? defaultValue);
    const currentValue = value ?? internalValue;
    const charCount = currentValue.length;
    const showClear = isClearable(allowClear) && currentValue && !disabled;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
    };

    useEffect(() => {
      if (autoSize && innerRef.current) {
        const el = innerRef.current;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
      }
    }, [currentValue, autoSize]);

    const wrapperClass = twMerge(
      clsx(
        "flex gap-2 items-start rounded-md transition-colors duration-300",
        getTextareaSizeClasses(size),
        getVariantClasses(variant),
        getStatusClasses(status),
        disabled && "opacity-50 pointer-events-none",
        classNames.wrapper,
        className
      )
    );

    const textareaClass = clsx(
      "w-full resize-none bg-transparent focus:outline-none",
      classNames.input
    );

    return (
      <div className="flex flex-col gap-2">
        <div className={wrapperClass}>
          <textarea
            id={id}
            ref={innerRef}
            value={currentValue}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            className={textareaClass}
            {...rest}
          />

          {allowClear && (
            <button
              type="button"
              onClick={handleClear}
              className={twMerge(
                clsx(
                  "shrink-0 invisible cursor-pointer",
                  { visible: showClear },
                  classNames.clear
                )
              )}
            >
              {typeof allowClear === "object" && allowClear.clearIcon
                ? allowClear.clearIcon
                : "×"}
            </button>
          )}
        </div>

        {(showCount || count?.formatter) && (
          <span
            className={clsx(
              "text-muted text-xs flex flex-none items-center justify-end",
              classNames.count
            )}
          >
            {count?.formatter
              ? count.formatter({
                  value: currentValue,
                  count: charCount,
                  maxLength,
                })
              : `${charCount}${maxLength ? ` / ${maxLength}` : ""}`}
          </span>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
