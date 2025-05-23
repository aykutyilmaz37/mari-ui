"use client";
import React, { forwardRef, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import {
  getSizeClasses,
  getVariantClasses,
  getStatusClasses,
  isClearable,
} from "./utils";
import { InputClassNames, InputSize, InputStatus, InputVariant } from "./types";
import { InputMask } from "@react-input/mask";
import { EyeIcon, EyeOffIcon, XIcon } from "lucide-react";

export type InputProps = {
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPressEnter?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  allowClear?: boolean | { clearIcon?: React.ReactNode };
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  disabled?: boolean;
  size?: InputSize;
  variant?: InputVariant;
  status?: InputStatus;
  maxLength?: number;
  showCount?: boolean;
  count?: {
    formatter?: (info: {
      value: string;
      count: number;
      maxLength?: number;
    }) => React.ReactNode;
  };
  type?: string;
  id?: string;
  classNames?: InputClassNames;
  className?: string;
  mask?: string;
  replacement?: Record<string, RegExp>;
  visibilityToggle?: boolean | { visible?: boolean };
  visibilityIconRender?: (visible: boolean) => React.ReactNode;
};
export const Input = forwardRef<HTMLInputElement, InputProps>(
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
      icon,
      iconPosition = "start",
      showCount,
      status,
      size = "middle",
      type = "text",
      value,
      variant = "outlined",
      onChange,
      onPressEnter,
      onClear,
      mask,
      replacement = { _: /\d/ },
      visibilityToggle,
      visibilityIconRender,
      ...rest
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<string>(
      value ?? defaultValue
    );
    const [passwordVisible, setPasswordVisible] = useState(false);
    const defaultIconRender = (visible: boolean) =>
      visible ? <EyeIcon size={16} /> : <EyeOffIcon size={16} />;
    const showPasswordToggle =
      type === "password" && visibilityToggle !== false;

    const inputType = showPasswordToggle
      ? passwordVisible
        ? "text"
        : "password"
      : type;

    const currentValue = value ?? internalValue;
    const charCount = currentValue.length;

    const showClear = isClearable(allowClear) && currentValue && !disabled;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onPressEnter?.(e);
      }
    };

    const handleClear = () => {
      setInternalValue("");
      onClear?.();
    };

    const wrapperClass = twMerge(
      clsx(
        "flex items-center gap-2 rounded-md group transition-colors duration-300",
        getSizeClasses(size),
        getVariantClasses(variant),
        getStatusClasses(status),
        disabled && "opacity-50 pointer-events-none",
        classNames.wrapper,
        className
      )
    );

    const inputClass = clsx(
      "flex-grow bg-transparent focus:outline-none",
      classNames.input
    );

    return (
      <div className={wrapperClass}>
        {icon && iconPosition === "start" && (
          <span className="mr-2">{icon}</span>
        )}

        {mask ? (
          <InputMask
            ref={ref}
            id={id}
            mask={mask}
            replacement={replacement}
            disabled={disabled}
            type={inputType}
            maxLength={maxLength}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            {...rest}
          />
        ) : (
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            type={inputType}
            maxLength={maxLength}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            {...rest}
          />
        )}

        {icon && iconPosition === "end" && <span className="ml-2">{icon}</span>}

        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setPasswordVisible((prev) => !prev)}
            className="ml-2 cursor-pointer text-muted"
          >
            {visibilityIconRender
              ? visibilityIconRender(passwordVisible)
              : defaultIconRender(passwordVisible)}
          </button>
        )}

        {allowClear && (
          <button
            type="button"
            onClick={handleClear}
            className={twMerge(
              clsx(
                "shrink-0 invisible cursor-pointer",
                {
                  visible: showClear,
                },
                classNames.clear
              )
            )}
          >
            {typeof allowClear === "object" && allowClear.clearIcon ? (
              allowClear.clearIcon
            ) : (
              <XIcon size={16} />
            )}
          </button>
        )}

        {(showCount || count?.formatter) && (
          <span
            className={clsx(
              "ml-2 text-muted text-xs flex flex-none items-center",
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

Input.displayName = "Input";
