const formD = () => {
  return <div>form</div>;
};
import { ColumnProps } from "@/components/ui/table/types";
import { DataType } from "../../../app/page";
export const Columns = () => {
  const navigateRow = () => {
    console.log("tık");
  };
  const deleteRow = () => {
    console.log("delete");
  };
  const handleInlineChange = (item: any) => {
    console.log("Row updated:", { item });
    // burada API PATCH isteği atabilirsin
  };
  const tableHeader = ["Name", "Age", "Address", "Actions"];
  const tableBody: ColumnProps<DataType>[] = [
    {
      columnName: "name",
      actions: null,
    },
    {
      columnName: "age",
      actions: null,
    },
    {
      columnName: "address",
      actions: null,
      info: true,
    },
    {
      columnName: "actionType",
      actions: {
        deleteRow: deleteRow,
        navigateRow: navigateRow,
        editRowInInline: {
          onChange: handleInlineChange,
        },
        onEditWithDrawer: {
          title: "başlık",
          description: "açıklama",
          form: formD,
        },
      },
    },
  ];

  return { tableHeader, tableBody } as const;
};
