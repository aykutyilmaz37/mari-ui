import type { Meta, StoryObj } from "@storybook/react";
import { Table } from "./Table";
import { Columns } from "@/components/ui/table/columns";

// Define the DataType interface as in page.tsx
interface DataType {
  id: string;
  name: string;
  age: number;
  address: string;
}

// Mock data
const data: DataType[] = [
  {
    id: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
  },
  {
    id: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
  },
  {
    id: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
  },
];

const { tableHeader, tableBody } = Columns();

const meta: Meta<typeof Table<DataType>> = {
  title: "Components/Table",
  component: Table,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Table<DataType>>;

export const Default: Story = {
  render: () => (
    <Table<DataType>
      data={data}
      tableHeader={tableHeader}
      tableBody={tableBody}
      loading={false}
    />
  ),
};
