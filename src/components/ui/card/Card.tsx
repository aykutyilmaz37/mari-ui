import { ReactNode, CSSProperties } from "react";
import clsx from "clsx";
import { CardSize, CardType, CardVariant, SemanticDOM } from "./types";
import { getBaseClassname } from "./utils";

export type CardProps = {
  children: ReactNode;
  title?: ReactNode;
  extra?: ReactNode;
  cover?: ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  loading?: boolean;
  size?: CardSize;
  type?: CardType;
  className?: string;
  classNames?: Partial<Record<SemanticDOM, string>>;
  styles?: Partial<Record<SemanticDOM, CSSProperties>>;
};

export function Card({
  children,
  title,
  extra,
  cover,
  variant = "outlined",
  hoverable = false,
  loading = false,
  size = "middle",
  type,
  className,
  classNames,
}: CardProps) {
  const base = getBaseClassname({ variant, hoverable, size, type, className });

  return (
    <div className={base}>
      {cover && (
        <div className={clsx("mb-4", classNames?.cover)}>
          {cover}
        </div>
      )}

      {(title || extra) && (
        <div>
          <div
            className={clsx(
              "p-4 flex items-center justify-between font-semibold",
              classNames?.header
            )}
          >
            <div>{title}</div>
            <div>{extra}</div>
          </div>
          <div className="h-[1px] bg-gray-300 min-w-full" />
        </div>
      )}

      <div className={clsx('p-4',classNames?.body)}>
        {loading ? (
          <div className="animate-pulse text-sm text-gray-500">
            Loading...
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

export default Card;
