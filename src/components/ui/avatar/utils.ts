import clsx from "clsx";
import { AvatarShape, AvatarSize } from "./types";

export const getSizeStyle = (size: AvatarSize): React.CSSProperties => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
  
    const sizeMap: Record<string, number> = {
      small: 24,
      default: 32,
      large: 40,
    };
  
    if (typeof size === 'string') {
      return { width: sizeMap[size], height: sizeMap[size] };
    }
  
    return {
      width: size.md || 32,
      height: size.md || 32,
    };
  };

  export const getShapeClasses = (shape: AvatarShape) => {
    return clsx('flex items-center justify-center overflow-hidden bg-gray-200 ', {
      'rounded-full': shape === 'circle',
      'rounded-sm': shape === 'square',
    });
  };

  export const getNoUser = (alt: string) => {
    return alt.charAt(0).toUpperCase();
  };
