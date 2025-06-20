import { X } from "lucide-react";
import { ReactNode } from "react";
import { getTagClass, getTagStatuClass } from "./utils";

export type TagProps = {
  children: ReactNode;
  statu?: "success" | "processing" | "error" | "default" | "warning" | string;
  color?: string;
  icon?: ReactNode;
  closeIcon?: ReactNode | boolean;
  bordered?: boolean;
  onClose?: () => void;
  className?: string;
};
export function Tag({
  children,
  statu,
  icon,
  closeIcon,
  bordered = true,
  onClose,
  className,
}: TagProps) {
  const baseColorClass = getTagStatuClass(statu);
  const tagClass = getTagClass(baseColorClass, bordered, className);

  const renderCloseIcon = () => {
    if (closeIcon === false || closeIcon === null) return null;
    const iconEl =
      closeIcon === true || closeIcon === undefined ? (
        <X size={14} />
      ) : (
        closeIcon
      );

    return (
      <button
        type="button"
        onClick={onClose}
        className="ml-1 inline-flex items-center justify-center rounded-full hover:opacity-70 focus:outline-none"
      >
        {iconEl}
      </button>
    );
  };

  return (
    <span className={tagClass}>
      {icon && <span className="mr-1 inline-flex items-center">{icon}</span>}
      <span>{children}</span>
      {renderCloseIcon()}
    </span>
  );
}

export default Tag;
