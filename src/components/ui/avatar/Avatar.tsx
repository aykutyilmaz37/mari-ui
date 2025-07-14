"use client";

import React from "react";
import clsx from "clsx";
import Image from "next/image";
import { AvatarShape, AvatarSize, GetAvatarContent } from "./types";
import { getShapeClasses, getSizeStyle, getNoUser } from "./utils";

export type AvatarProps = {
  alt?: string;
  icon?: React.ReactNode;
  shape?: AvatarShape;
  size?: AvatarSize;
  src?: string | React.ReactNode;
  width?: number;
  height?: number;
  onError?: () => boolean;
};

const getAvatarContent = ({
  src,
  alt,
  imgError,
  handleImgError,
  icon,
  width = 40,
  height = 40,
  noUser = "No User",
  ...rest
}: GetAvatarContent): React.ReactNode => {
  switch (true) {
    case typeof src === "string" && !imgError:
      return (
        <Image
          src={String(src)}
          alt={alt}
          onError={handleImgError}
          width={width}
          height={height}
          className="w-full h-full object-cover"
          {...rest}
        />
      );

    case typeof src === "object" && src !== null:
      return src;

    default:
      return icon || <span className="text-base font-medium">{noUser}</span>;
  }
};

export const Avatar: React.FC<AvatarProps> = ({
  alt = "",
  icon,
  shape = "circle",
  size = "middle",
  src,
  width = 32,
  height = 32,
  onError,
}) => {
  const [imgError, setImgError] = React.useState(false);

  const handleImgError = () => {
    const preventDefault = onError?.() === false;
    if (!preventDefault) {
      setImgError(true);
    }
  };

  const shapeClassName = getShapeClasses(shape);
  const sizeStyle = getSizeStyle(size);
  const noUser = getNoUser(alt);

  const avatar = getAvatarContent({
    src,
    alt,
    imgError,
    handleImgError,
    icon,
    width,
    height,
    noUser,
  });

  return (
    <div className={clsx(shapeClassName)} style={sizeStyle}>
      {avatar}
    </div>
  );
};

export default Avatar;
