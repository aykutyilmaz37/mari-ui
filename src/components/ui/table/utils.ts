export const getColumnClass = (columnIndex: number, columns: any[]) => {
  if (columnIndex === 0) return "text-start";
  if (columnIndex === columns.length - 1) return "text-end";
  return "text-center";
};
