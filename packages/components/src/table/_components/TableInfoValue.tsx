import React from "react";
import { Tooltip } from "../../tooltip";

export interface TableInfoValueProps {
  info?: boolean;
  value: string;
}

export function TableInfoValue({ info, value }: TableInfoValueProps) {
  return info ? (
    <Tooltip
      className="w-2xs"
      placement="bottom"
      trigger={<span className="truncate text-pretty line-clamp-3">{value}</span>}
      content={<span>{value}</span>}
    />
  ) : (
    <span className="truncate text-pretty line-clamp-3">{value}</span>
  );
}
