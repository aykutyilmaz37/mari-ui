export type ActionProps<T = unknown> = {
  onEditWithDrawer?: {
    form: React.ComponentType<{
      refetch: () => void;
      initialData: T;
      closeModal: () => void;
    }>;
    title: string;
    description: string;
  };
  editRowInInline?: {
    onChange: (item: T) => void;
  };
  deleteRow?: (id: string) => void;
  navigateRow?: (id: string) => void;
  refetch?: () => void;
};

export type ColumnProps<T> = {
  columnName: keyof T | string;
  actions?: ActionProps | null;
  info?: boolean;
};
