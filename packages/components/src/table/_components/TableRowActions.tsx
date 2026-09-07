"use client";

import React, { useState } from "react";
import { CheckIcon, ChevronRightIcon, EraserIcon, PencilIcon, XIcon } from "lucide-react";
import { Button } from "../../button";
import { TableEditDrawer } from "./TableEditDrawer";
import type { ActionProps } from "../types";

export interface TableRowActionsProps<T> {
  actions: ActionProps<T>;
  item: T;
  isInlineEditing: boolean;
  onStartInlineEdit: () => void;
  onSaveInlineEdit: () => void;
  onCancelInlineEdit: () => void;
}

/**
 * Eskiden `_hook/useTableBody.tsx` diye adlandırılmış bir "hook" bu JSX'i
 * üretiyordu — ama hiçbir React hook kuralı taşımıyordu, düz bir JSX
 * factory'siydi (bkz. plan denetimi: "hook değil, component'e
 * dönüştürülecek"). Artık gerçek bir component.
 */
export function TableRowActions<T extends { id: string }>({
  actions,
  item,
  isInlineEditing,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
}: TableRowActionsProps<T>) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      {actions.editRowInInline &&
        (isInlineEditing ? (
          <>
            <Button variant="ghost" color="info" size="sm" onClick={onSaveInlineEdit} icon={<CheckIcon size={16} />} />
            <Button variant="ghost" color="error" size="sm" onClick={onCancelInlineEdit} icon={<XIcon size={16} />} />
          </>
        ) : (
          <Button variant="ghost" color="info" size="sm" onClick={onStartInlineEdit} icon={<PencilIcon size={16} />} />
        ))}

      {actions.onEditWithDrawer && (
        <>
          <Button variant="ghost" color="info" size="sm" onClick={() => setDrawerOpen(true)} icon={<PencilIcon size={16} />} />
          <TableEditDrawer title={actions.onEditWithDrawer.title} description={actions.onEditWithDrawer.description} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <actions.onEditWithDrawer.form refetch={actions.refetch ?? (() => {})} initialData={item} closeModal={() => setDrawerOpen(false)} />
          </TableEditDrawer>
        </>
      )}

      {actions.navigateRow && <Button variant="ghost" color="info" size="sm" onClick={() => actions.navigateRow?.(item.id)} icon={<ChevronRightIcon size={16} />} />}
      {actions.deleteRow && <Button variant="ghost" color="error" size="sm" onClick={() => actions.deleteRow?.(item.id)} icon={<EraserIcon size={16} />} />}
    </div>
  );
}
