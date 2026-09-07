import React from "react";
import { cn } from "@mari-ui/core";
import type { ColumnDef } from "../types";

export interface TableHeaderProps<T extends { id: string }> {
  columns: ColumnDef<T>[];
}

export function TableHeader<T extends { id: string }>({ columns }: TableHeaderProps<T>) {
  return (
    <thead>
      <tr className="w-full text-center">
        {columns.map((col, index) => (
          <th
            key={index}
            className={cn(
              "bg-mari-neutral-solid mb-1 p-2 text-mari-neutral-solid-contrast",
              index === 0 && "text-start rounded-tl-md",
              index === columns.length - 1 && "text-end rounded-tr-md",
              index > 0 && index < columns.length - 1 && "text-center"
            )}
          >
            {col.header}
          </th>
        ))}
      </tr>
    </thead>
  );
}
