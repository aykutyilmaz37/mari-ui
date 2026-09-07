"use client";

import React from "react";
import { PositionType, ToastType } from "./types";
import { XIcon } from "lucide-react";
import { getType } from "./useToastHook";
import clsx from "clsx";
import { getPositionInClass, getPositionOutClass } from "./utils";
import { twMerge } from "tailwind-merge";

type ToastProps = {
  title: string;
  description?: string;
  closeIcon?: boolean;
  position?: PositionType;
  type?: ToastType;
  onClose?: () => void;
};

export const Toast: React.FC<ToastProps> = ({
  title,
  description,
  type = "none",
  onClose,
  position = "bottomRight",
  closeIcon = true,
}) => {
  const TypeIcon = getType(type);
  const PositionInClass = getPositionInClass(position);
  const PositionOutClass = getPositionOutClass(position);
  const [classNames, setClassNames] = React.useState(PositionOutClass);

  React.useEffect(() => {
    const enterTimeout = setTimeout(() => {
      setClassNames(PositionInClass);
    }, 10);

    const exitTimeout = setTimeout(() => {
      setClassNames(PositionOutClass);
      setTimeout(() => {}, 500);
    }, 3000);

    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(exitTimeout);
    };
  }, [PositionInClass, PositionOutClass]);
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white absolute transition-all duration-500 ease-out transform shadow-2xl p-5 min-w-2xs min-h-16 flex items-start justify-between",
          classNames
        )
      )}
    >
      <div className="flex items-start gap-2">
        <span className="mt-1">{TypeIcon}</span>
        <div className="flex flex-col items-start gap-1">
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <h6 className="text-sm text-secondary">{description}</h6>
        </div>
      </div>
      {closeIcon && (
        <XIcon
          className="cursor-pointer hover:text-error"
          size={16}
          onClick={onClose}
        />
      )}
    </div>
  );
};
