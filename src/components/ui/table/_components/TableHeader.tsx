import React from "react";
import { twMerge } from "tailwind-merge";

type TableHeaderProps = {
  data: string[];
};
export const TableHeader: React.FC<TableHeaderProps> = ({ data }) => {
  return (
    <thead>
      <tr className="w-full text-center">
        {data.map((header, index) => {
          return (
            <th
              key={header}
              className={twMerge(
                "bg-secondary mb-1 p-2 text-white",
                index === 0 && "text-start rounded-tl-md",
                index === data.length - 1 && "text-end rounded-tr-md",
                index > 0 && index < data.length - 1 && "text-center"
              )}
            >
              {header}
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
