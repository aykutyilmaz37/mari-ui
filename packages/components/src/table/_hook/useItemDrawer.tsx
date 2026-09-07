import React from "react";
import { Drawer } from "../../drawer";

type ModalProps = {
  title?: string;
  description?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  children: React.ReactNode;
};

export const AddNewItem: React.FC<ModalProps> = ({
  title,
  description,
  open,
  setOpen,
  children,
}) => {
  return (
    <Drawer
      open={open}
      onClose={() => setOpen(!open)}
      header={
        <div>
          <span>{title}</span>
          <span>{description}</span>
        </div>
      }
    >
      <div>{children}</div>
    </Drawer>
  );
};

export const useItemDrawer = () => {
  const [open, setOpen] = React.useState(false);

  return { AddNewItem, open, setOpen };
};
