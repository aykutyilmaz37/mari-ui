import React, { JSX } from "react";
import { twMerge } from "tailwind-merge";
import { getColumnClass } from "../utils";
import { ColumnProps } from "../types";
import { useTableBody } from "../_hook/useTableBody";
import { Input } from "../../input";
import { TableInfoValue } from "./TableInfoValue";

type TableBodyProps<T> = {
  data?: T[];
  columns: ColumnProps<T>[];
};

export const TableBody = <T extends { id: string }>({
  data,
  columns,
}: TableBodyProps<T>) => {
  const { deleteRow, navigateRow, editRowWithDrawer, editRowInInline } =
    useTableBody();
  const [inlineValues, setInlineValues] = React.useState<
    Record<string, Record<string, string>>
  >({});

  const [openInlineId, setOpenInlineId] = React.useState<string | null>(null);
  if (!data) {
    return <span>No data!</span>;
  }

  const renderCell = (
    item: T,
    col: ColumnProps<T>,
    columnIndex: number
  ): JSX.Element => {
    const value = item[col.columnName as keyof T]
      ? String(item[col.columnName as keyof T])
      : "-";

    if (col.actions) {
      return (
        <td
          className={twMerge("p-2", getColumnClass(columnIndex, columns))}
          key={columnIndex}
        >
          {col.actions.editRowInInline &&
            editRowInInline(
              col.actions,
              item,
              inlineValues,
              setInlineValues,
              setOpenInlineId,
              openInlineId
            )}
          {col.actions.onEditWithDrawer && editRowWithDrawer(col.actions, item)}
          {col.actions.navigateRow && navigateRow(col.actions, item)}
          {col.actions.deleteRow && deleteRow(col.actions, item)}
        </td>
      );
    }

    return (
      <td
        key={columnIndex}
        className={twMerge("w-fit p-2", getColumnClass(columnIndex, columns))}
      >
        {openInlineId === item.id ? (
          <Input
            value={inlineValues[item.id]?.[col.columnName as string] ?? value}
            onChange={(e) =>
              setInlineValues((prev) => ({
                ...prev,
                [item.id]: {
                  ...prev[item.id],
                  [col.columnName as string]: e.target.value,
                },
              }))
            }
          />
        ) : (
          <TableInfoValue
            info={col.info}
            value={value}
          />
        )}
      </td>
    );
  };

  return (
    <tbody>
      {data.map((item) => (
        <tr key={item.id}>
          {columns.map((col, columnIndex) =>
            renderCell(item, col, columnIndex)
          )}
        </tr>
      ))}
    </tbody>
  );
};
