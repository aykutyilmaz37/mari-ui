import React from "react";
import { cn } from "@mari-ui/core";
import { Loading } from "../loading";
import { TableBody } from "./_components/TableBody";
import { TableHeader } from "./_components/TableHeader";
import type { TableProps } from "./types";

export type { TableProps };

/**
 * Eskiden `tableHeader: string[]` ve `tableBody: ColumnProps<T>[]` İKİ AYRI
 * paralel diziydi, elle senkron tutuluyordu (bkz. plan denetimi ve
 * types.ts'teki not). Artık tek bir `columns` dizisi.
 */
export function Table<T extends { id: string }>({ data, columns, loading = false, className }: TableProps<T>) {
  if (loading) {
    return <Loading />;
  }

  return (
    <div className={cn("border border-mari-border rounded-md overflow-hidden", className)}>
      <table className="table-fixed w-full">
        <TableHeader columns={columns} />
        <TableBody data={data} columns={columns} />
      </table>
    </div>
  );
}
