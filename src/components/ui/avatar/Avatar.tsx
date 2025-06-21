"use client";

import Image from "next/image";
import { AvatarShape, AvatarSize } from "./types";
import { getSizeStyle, getShapeClasses, getNoUser } from "./utils";
import clsx from "clsx";
import React from "react";

export type AvatarProps = {
  alt?: string;
  icon?: React.ReactNode;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string | React.ReactNode;
  onError?: () => boolean;
};
export const Avatar: React.FC<AvatarProps> = ({
  alt = "",
  icon,
  shape = "circle",
  size = "default",
  src,
  onError,
}) => {
  const [imgError, setImgError] = React.useState(false);

  const handleImgError = () => {
    const preventDefault = onError?.() === false;
    if (!preventDefault) {
      setImgError(true);
    }
  };

  const sizeStyle = getSizeStyle(size);
  const shapeClassName = getShapeClasses(shape);
  const noUser = getNoUser(alt);

  return (
    <div className={clsx(shapeClassName)} style={sizeStyle}>
      {typeof src === "string" && !imgError ? (
        <Image
          src={src}
          alt={alt}
          onError={handleImgError}
          className="w-full h-full object-cover"
        />
      ) : typeof src === "object" && src ? (
        src
      ) : (
        icon || <span className="text-sm">{noUser}</span>
      )}
    </div>
  );
};

export default Avatar;
