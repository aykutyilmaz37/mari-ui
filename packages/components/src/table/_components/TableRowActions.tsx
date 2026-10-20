"use client";

import React from "react";
import { CheckIcon, ChevronRightIcon, PencilIcon, Trash2Icon, XIcon } from "lucide-react";
import { Button } from "../../button";
import type { ActionProps } from "../types";

export interface TableRowActionsProps<T> {
  actions: ActionProps<T>;
  item: T;
  /** Satırın okunur adı — düğme adlarına eklenir ("Sil: Aykut Yılmaz"). */
  rowLabel: string;
  isInlineEditing: boolean;
  onStartInlineEdit: () => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
}

/*
 * Eskiden `_hook/useTableBody.tsx` diye adlandırılmış bir "hook" bu JSX'i
 * üretiyordu — ama hiçbir React hook kuralı taşımıyordu, düz bir JSX
 * factory'siydi. Artık gerçek bir component.
 */
export function TableRowActions<T extends { id: string }>({
  actions,
  item,
  rowLabel,
  isInlineEditing,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
}: Readonly<TableRowActionsProps<T>>) {
  // Faz 15: her satırın düğmesi eskiden aynı adı ("Sil") taşıyordu — ekran
  // okuyucuda hangi satırın silineceği belli değildi. Silme ikonu da bir
  // silgiydi (Eraser); evrensel karşılığı çöp kutusu. Düzenle/detay nötr,
  // sadece yıkıcı eylem renkli (her ikonun mavi olması satırı kalabalıklaştırıyordu).
  const name = (action: string) => `${action}: ${rowLabel}`;
  return (
    <div className="flex items-center gap-1">
      {actions.editRowInInline &&
        (isInlineEditing ? (
          <>
            <Button variant="ghost" color="success" size="sm" onClick={onSaveInlineEdit} icon={<CheckIcon size={16} aria-hidden />} aria-label={name("Kaydet")} />
            <Button variant="ghost" color="neutral" size="sm" onClick={onCancelInlineEdit} icon={<XIcon size={16} aria-hidden />} aria-label={name("Vazgeç")} />
          </>
        ) : (
          <Button variant="ghost" color="neutral" size="sm" onClick={onStartInlineEdit} icon={<PencilIcon size={16} aria-hidden />} aria-label={name("Düzenle")} />
        ))}
      {actions.editRow && (
        <Button variant="ghost" color="neutral" size="sm" onClick={() => actions.editRow?.(item)} icon={<PencilIcon size={16} aria-hidden />} aria-label={name("Düzenle")} />
      )}
      {actions.navigateRow && (
        <Button variant="ghost" color="neutral" size="sm" onClick={() => actions.navigateRow?.(item.id)} icon={<ChevronRightIcon size={16} aria-hidden />} aria-label={name("Detaya git")} />
      )}
      {actions.deleteRow && (
        <Button variant="ghost" color="error" size="sm" onClick={() => actions.deleteRow?.(item.id)} icon={<Trash2Icon size={16} aria-hidden />} aria-label={name("Sil")} />
      )}
    </div>
  );
}
