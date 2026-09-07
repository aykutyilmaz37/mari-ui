import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Table } from "./Table";
import type { ColumnDef } from "./types";

interface DataType {
  id: string;
  name: string;
  age: number;
  address: string;
}

const initialData: DataType[] = [
  { id: "1", name: "John Brown", age: 32, address: "New York No. 1 Lake Park" },
  { id: "2", name: "Jim Green", age: 42, address: "London No. 1 Lake Park" },
  { id: "3", name: "Joe Black", age: 32, address: "Sydney No. 1 Lake Park" },
];

const meta: Meta<typeof Table<DataType>> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table<DataType>>;

/**
 * Not: eskiden `tableHeader: string[]` ve `tableBody: ColumnProps[]` iki
 * ayrı, elle senkron tutulan dizi olarak geçiliyordu. Artık tek bir
 * `columns` dizisi hem başlığı hem veri eşlemesini taşıyor.
 */
export const Default: Story = {
  render: () => {
    const columns: ColumnDef<DataType>[] = [
      { header: "İsim", columnName: "name" },
      { header: "Yaş", columnName: "age" },
      { header: "Adres", columnName: "address", info: true },
    ];
    return <Table<DataType> data={initialData} columns={columns} />;
  },
};

export const Loading: Story = {
  render: () => {
    const columns: ColumnDef<DataType>[] = [{ header: "İsim", columnName: "name" }];
    return <Table<DataType> data={initialData} columns={columns} loading />;
  },
};

export const Empty: Story = {
  render: () => {
    const columns: ColumnDef<DataType>[] = [{ header: "İsim", columnName: "name" }];
    return <Table<DataType> data={[]} columns={columns} />;
  },
};

const WithActionsStory = () => {
  const [data, setData] = useState(initialData);

  const columns: ColumnDef<DataType>[] = [
    { header: "İsim", columnName: "name" },
    { header: "Yaş", columnName: "age" },
    { header: "Adres", columnName: "address" },
    {
      header: "İşlemler",
      actions: {
        editRowInInline: {
          onChange: (updated) => setData((prev) => prev.map((row) => (row.id === updated.id ? updated : row))),
        },
        deleteRow: (id) => setData((prev) => prev.filter((row) => row.id !== id)),
      },
    },
  ];

  return <Table<DataType> data={data} columns={columns} />;
};

export const WithActions: Story = {
  render: () => <WithActionsStory />,
};
