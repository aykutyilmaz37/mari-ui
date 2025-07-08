export type AvatarSize = number | "large" | "small" | "middle";
export type AvatarShape = "circle" | "square";
export type GetAvatarContent = {
  src: string | React.ReactNode | null | undefined;
  alt: string;
  imgError: boolean;
  handleImgError: () => void;
  icon?: React.ReactNode;
  noUser?: string;
  width: number;
  height: number;
};
