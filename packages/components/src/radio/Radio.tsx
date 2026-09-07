"use client";

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import clsx from "clsx";
import type {
  RadioClassNames,
  RadioSize,
  RadioStatus,
  RadioVariant,
  RadioType,
} from "./types";
import {
  getSizeClasses,
  getSizeDotClasses,
  getStatusClasses,
  getVariantClasses,
  getVariantDotClasses,
} from "./utils";

export type RadioProps = {
  autoFocus?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  classNames?: RadioClassNames;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: RadioSize;
  status?: RadioStatus;
  id?: string;
  variant?: RadioVariant;
  type?: RadioType;
  name?: string;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      autoFocus = false,
      checked,
      defaultChecked,
      disabled = false,
      onChange,
      onBlur,
      onFocus,
      className,
      classNames = {},
      label,
      description,
      variant = "outline",
      type = "primary",
      size = "middle",
      status,
      id,
      value,
      name,
      ...rest
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isChecked, setIsChecked] = useState(
      defaultChecked ?? checked ?? false
    );

    useImperativeHandle(ref, () => inputRef.current!, []);

    const baseClasses = clsx(
      "relative appearance-none border outline-none rounded-full",
      getStatusClasses(status),
      getSizeClasses(size),
      !status && getVariantClasses(variant, type),
      disabled && "opacity-50",
      classNames.radio,
      className
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    useEffect(() => {
      if (typeof checked === "boolean") {
        setIsChecked(checked);
      }
    }, [checked]);
    return (
      <label
        className={clsx(
          "inline-flex flex-col gap-1 cursor-pointer",
          disabled && "cursor-not-allowed",
          classNames.wrapper
        )}
      >
        <span className="inline-flex items-center gap-2">
          <span className="relative inline-flex items-center justify-center">
            <input
              ref={inputRef}
              id={id}
              type="radio"
              autoFocus={autoFocus}
              checked={checked ?? isChecked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              value={value}
              name={name}
              onChange={handleChange}
              onBlur={onBlur}
              onFocus={onFocus}
              className={baseClasses}
              {...rest}
            />
            {(checked ?? isChecked) && (
              <span
                className={clsx(
                  "absolute rounded-full",
                  getSizeDotClasses(size),
                  "pointer-events-none",
                  getVariantDotClasses(variant, type)
                )}
              />
            )}
          </span>

          {label && (
            <span
              className={clsx(
                "select-none text-base-color",
                disabled && "text-disabled",
                classNames.label
              )}
            >
              {label}
            </span>
          )}
        </span>

        {description && (
          <span
            className={clsx(
              "text-xs",
              status === "error" && "text-error-light",
              status === "warning" && "text-warning-light",
              !status && "text-base-color"
            )}
          >
            {description}
          </span>
        )}
      </label>
    );
  }
);

Radio.displayName = "Radio";
