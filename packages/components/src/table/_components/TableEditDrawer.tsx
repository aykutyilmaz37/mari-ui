import React from "react";
import { Drawer } from "../../drawer";

export interface TableEditDrawerProps {
  title?: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * Eskiden `_hook/useItemDrawer.tsx` içinde tanımlıydı, `AddNewItem` adını
 * taşıyordu (yanıltıcı — "yeni ekleme" değil "düzenleme" çekmecesi) ve
 * dosyanın kendisi bir `useItemDrawer()` hook'u da export ediyordu — ama bu
 * hook'un döndürdüğü `open`/`setOpen` HİÇBİR YERDE kullanılmıyordu
 * (`useTableBody` kendi `openRowId` state'ini ayrı tutuyordu). Ölü hook
 * silindi, gerçek component `_components/`e taşındı ve doğru adını aldı.
 */
export function TableEditDrawer({ title, description, open, onClose, children }: TableEditDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
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
}
