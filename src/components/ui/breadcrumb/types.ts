export type BreadcrumbItemType = {
    title: React.ReactNode;
    href?: string;
    path?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
    className?: string;
  };