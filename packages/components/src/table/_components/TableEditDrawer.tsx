import React from "react";
import { Drawer } from "../../drawer";

export interface TableEditDrawerProps {
  title?: string;
  description?: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/*
 * Eskiden `_hook/useItemDrawer.tsx` içinde tanımlıydı, `AddNewItem` adını
 * taşıyordu (yanıltıcı — "yeni ekleme" değil "düzenleme" çekmecesi) ve
 * dosyanın kendisi bir `useItemDrawer()` hook'u da export ediyordu — ama bu
 * hook'un döndürdüğü `open`/`setOpen` HİÇBİR YERDE kullanılmıyordu
 * (`useTableBody` kendi `openRowId` state'ini ayrı tutuyordu). Ölü hook
 * silindi, gerçek component `_components/`e taşındı ve doğru adını aldı.
 */
export function TableEditDrawer({ title, description, open, onClose, children }: Readonly<TableEditDrawerProps>) {
  return (
    // Faz 13.6: eskiden `header`'a yan yana iki <span> veriliyordu (başlık ve
    // açıklama arasında boşluk bile yoktu, ortalanmıştı). Artık Drawer'ın
    // kendi `title`/`description`'ı — dialog'un erişilebilir adı da başlık.
    <Drawer open={open} onClose={onClose} title={title} description={description} aria-label={title ? undefined : "Kaydı düzenle"}>
      {children}
    </Drawer>
  );
}
