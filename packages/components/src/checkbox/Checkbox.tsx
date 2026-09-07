"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import type {
  CheckboxChangeEvent,
  CheckboxClassNames,
  CheckboxShape,
  CheckboxSize,
  CheckboxStatus,
  CheckboxType,
  CheckboxVariant,
} from "./types";
import {
  getShapeClasses,
  getSizeClasses,
  getSizeIndeterminateClasses,
  getStatusClasses,
  getVariantClasses,
} from "./utils";
import { CheckIcon } from "lucide-react";

export type CheckboxProps = {
  autoFocus?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (e: CheckboxChangeEvent) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  classNames?: CheckboxClassNames;
  label?: React.ReactNode;
  description?: React.ReactNode;
  size?: CheckboxSize;
  status?: CheckboxStatus;
  shape?: CheckboxShape;
  id?: string;
  variant?: CheckboxVariant;
  type?: CheckboxType;
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      autoFocus = false,
      checked,
      defaultChecked,
      disabled = false,
      indeterminate = false,
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
      shape = "default",
      status,
      id,
      ...rest
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState(
      defaultChecked ?? checked ?? false
    );

    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!, []);

    const baseClasses = clsx(
      "appearance-none border outline-none focus:outline-none",
      getSizeClasses(size),
      getStatusClasses(status),
      getShapeClasses(shape),
      !status && getVariantClasses(variant, type),
      disabled && "opacity-50 cursor-not-allowed",
      classNames.checkbox,
      className
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      onChange?.(e);
    };

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <label
        className={clsx(
          "inline-flex flex-col gap-1 cursor-pointer",
          disabled && "cursor-not-allowed",
          classNames.wrapper
        )}
      >
        <span className="inline-flex items-center gap-2 relative">
          <input
            ref={inputRef}
            id={id}
            type="checkbox"
            autoFocus={autoFocus}
            checked={typeof checked === "boolean" ? checked : isChecked}
            defaultChecked={defaultChecked}
            disabled={disabled}
            onChange={handleChange}
            onBlur={onBlur}
            onFocus={onFocus}
            className={baseClasses}
            {...rest}
          />
          {(indeterminate ||
            (typeof checked === "boolean" ? checked : isChecked)) && (
            <span
              className={clsx(
                "absolute pointer-events-none",
                getSizeClasses(size),
                "flex items-center justify-center"
              )}
            >
              {indeterminate ? (
                <span
                  className={clsx(
                    "rounded-sm",
                    getSizeIndeterminateClasses(size),
                    {
                      "bg-primary": type === "primary",
                      "bg-secondary": type === "secondary",
                    }
                  )}
                />
              ) : (
                <CheckIcon className="text-white" size={16} />
              )}
            </span>
          )}
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
              !status && type === "primary" && "text-primary",
              !status && type === "secondary" && "text-secondary"
            )}
          >
            {description}
          </span>
        )}
      </label>
    );
  }
);

Checkbox.displayName = "Checkbox";
