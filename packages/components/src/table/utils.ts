// TODO(faz-3/table): Table component'i tam migrate edilirken `ColumnProps<T>`
// generic'i buraya da taşınacak — şimdilik `any[]` sadece dizinin UZUNLUĞUNU
// okuduğu için zararsız, ama tip güvenliği eksik.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getColumnClass = (columnIndex: number, columns: any[]) => {
  if (columnIndex === 0) return "text-start";
  if (columnIndex === columns.length - 1) return "text-end";
  return "text-center";
};
