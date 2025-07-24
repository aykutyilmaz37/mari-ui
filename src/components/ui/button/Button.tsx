import React, { forwardRef } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

import {
  ButtonClassNames,
  ButtonIconPosition,
  ButtonLoading,
  ButtonShape,
  ButtonSize,
  ButtonType,
  ButtonVariant,
} from "./types";
import {
  getShapeClasses,
  getSizeClasses,
  getVariantClasses,
  resolveLoading,
} from "./utils";

export type ButtonProps = {
  block?: boolean;
  classNames?: ButtonClassNames;
  className?: string;
  disabled?: boolean;
  href?: string;
  htmlType?: "submit" | "reset" | "button";
  icon?: React.ReactNode;
  iconPosition?: ButtonIconPosition;
  loading?: ButtonLoading;
  shape?: ButtonShape;
  size?: ButtonSize;
  target?: string;
  type?: ButtonType;
  variant?: ButtonVariant;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  onDrop?: (event: React.DragEvent<HTMLElement>) => void;
  onDragOver?: (event: React.DragEvent<HTMLElement>) => void;
  children?: React.ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const {
      block = false,
      classNames = {},
      className = "",
      disabled = false,
      href,
      htmlType = "button",
      icon,
      iconPosition = "start",
      loading = false,
      shape = "default",
      size = "middle",
      target,
      type = "text",
      variant = "filled",
      onClick,
      onDragOver,
      onDrop,
      children,
    } = props;

    const { isLoading, loadingIcon, loadingIconPosition } =
      resolveLoading(loading);

    const shapeClasses = getShapeClasses(shape);
    const sizeClasses = getSizeClasses(size);
    const variantClasses = getVariantClasses(variant, type);

    const baseClasses = twMerge(
      clsx(
        "inline-flex items-center justify-center font-medium transition-all duration-300 select-none cursor-pointer focus:ring-opacity-50 focus-visible:outline-0",
        block && "w-full",
        disabled && "opacity-50 pointer-not-allowed",
        shapeClasses,
        sizeClasses,
        variantClasses,
        className
      )
    );

    const content = (
      <span className="inline-flex items-center gap-2">
        {isLoading && loadingIconPosition === "start" && (
          <span className={classNames.icon}>{loadingIcon}</span>
        )}
        {icon && iconPosition === "start" && (
          <span className={classNames.icon}>{icon}</span>
        )}
        {children && <span>{children}</span>}
        {icon && iconPosition === "end" && (
          <span className={classNames.icon}>{icon}</span>
        )}
        {isLoading && loadingIconPosition === "end" && (
          <span className={classNames.icon}>{loadingIcon}</span>
        )}
      </span>
    );

    const commonProps = {
      className: baseClasses,
      onClick,
      onDragOver,
      onDrop,
    };

    if (href) {
      return (
        <a
          href={href}
          target={target}
          {...commonProps}
          // @ts-expect-error - ref type mismatch expected
          ref={ref}
        >
          {content}
        </a>
      );
    }

    return (
      <button type={htmlType} disabled={disabled} {...commonProps} ref={ref}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
