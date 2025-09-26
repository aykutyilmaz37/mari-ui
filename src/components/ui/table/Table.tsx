import React from "react";
import { twMerge } from "tailwind-merge";
import { Loading } from "../loading";
import { TableBody } from "./_components/TableBody";
import { TableHeader } from "./_components/TableHeader";
import { ColumnProps } from "./types";

type TableProps<T> = {
  data: T[];
  tableHeader: string[];
  tableBody: ColumnProps<T>[];
  loading: boolean;
  className?: string;
};

export const Table = <T extends { id: string }>({
  data,
  tableHeader,
  tableBody,
  loading = false,
  className,
}: TableProps<T>) => {
  if (loading) {
    return <Loading />;
  }
  return (
    <div
      className={twMerge(
        "border-primary/15 rounded-md border",
        className
      )}
    >
      <table className="table-fixed w-full">
        <TableHeader data={tableHeader} />
        <TableBody data={data} columns={tableBody} />
      </table>
    </div>
  );
};
