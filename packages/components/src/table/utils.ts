/** Eskiden tüm `columns` dizisini alıp `any[]` ile tipliyordu — tek ihtiyacı
 * dizinin UZUNLUĞUYDU. Artık sade bir sayı parametresi, tam tipli. */
export function getColumnClass(columnIndex: number, columnCount: number): string {
  if (columnIndex === 0) return "text-start";
  if (columnIndex === columnCount - 1) return "text-end";
  return "text-center";
}
