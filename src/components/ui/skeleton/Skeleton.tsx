import React from "react";
import clsx from "clsx";
import {
  SkeletonAvatarProps,
  SkeletonParagraphProps,
  SkeletonTitleProps,
} from "./types";
import { getSizeClassSkeleton } from "./utils";
import { twMerge } from "tailwind-merge";

export interface SkeletonProps {
  active?: boolean;
  avatar?: boolean | SkeletonAvatarProps;
  loading?: boolean;
  paragraph?: boolean | SkeletonParagraphProps;
  round?: boolean;
  title?: boolean | SkeletonTitleProps;
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  active = false,
  avatar = false,
  loading,
  paragraph = true,
  round = false,
  title = true,
  className,
  children,
}) => {
  if (loading === false) return <>{children}</>;

  const avatarProps: SkeletonAvatarProps =
    typeof avatar === "boolean" ? {} : avatar;
  const titleProps: SkeletonTitleProps =
    typeof title === "boolean" ? {} : title;
  const paragraphProps: SkeletonParagraphProps =
    typeof paragraph === "boolean" ? {} : paragraph;

  const rows = paragraphProps.rows ?? 3;
  let paragraphWidths: (string | number)[] = [];

  if (Array.isArray(paragraphProps.width)) {
    paragraphWidths = paragraphProps.width;
  } else if (typeof paragraphProps.width !== "undefined") {
    paragraphWidths = [...Array(rows - 1).fill("100%"), paragraphProps.width];
  }

  return (
    <div
      className={clsx("animate-pulse", active && "animate-pulse", className)}
    >
      <div className="flex gap-4">
        {avatar && (
          <div
            className={twMerge(
              clsx(
                "bg-border",
                avatarProps.shape === "circle" && "rounded-full",
                avatarProps.shape === "square" && "rounded-none",
                (!avatarProps.shape || avatarProps.shape === undefined) &&
                  "rounded-md",
                getSizeClassSkeleton(avatarProps.size ?? "default", "w"),
                getSizeClassSkeleton(avatarProps.size ?? "default", "h")
              )
            )}
          />
        )}
        <div className="flex-1 space-y-2">
          {title && (
            <div
              className={twMerge(
                clsx(
                  "bg-border h-4",
                  round ? "rounded-full" : "rounded",
                  typeof titleProps.width === "number" ||
                    typeof titleProps.width === "string"
                    ? `w-[${titleProps.width}]`
                    : "w-1/2"
                )
              )}
            />
          )}
          {paragraph &&
            Array.from({ length: rows }).map((_, i) => {
              let widthClass: string;

              if (
                typeof paragraphWidths[i] === "number" ||
                typeof paragraphWidths[i] === "string"
              ) {
                widthClass = `w-[${paragraphWidths[i]}]`;
              } else if (i === rows - 1) {
                widthClass = "w-4/5";
              } else {
                widthClass = "w-full";
              }

              return (
                <div
                  key={i}
                  className={twMerge(
                    clsx(
                      "bg-border h-3",
                      round ? "rounded-full" : "rounded",
                      widthClass
                    )
                  )}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
