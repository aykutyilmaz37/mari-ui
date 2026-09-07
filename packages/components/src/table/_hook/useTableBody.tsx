"use client";

import {
  CheckIcon,
  ChevronRightIcon,
  EraserIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import { Button } from "../../button";
import { AddNewItem } from "./useItemDrawer";
import React from "react";
import { ActionProps } from "../types";

export const useTableBody = <T extends { id: string }>() => {
  const [openRowId, setOpenRowId] = React.useState<string | null>(null);

  const deleteRow = (actions: ActionProps, item: T) => {
    return (
      <Button
        onClick={() => actions.deleteRow!(item.id)}
        size="small"
        className="hover:text-error"
        icon={<EraserIcon />}
      />
    );
  };
  const navigateRow = (actions: ActionProps, item: T) => {
    return (
      <Button
        onClick={() => actions.navigateRow!(item.id)}
        size="small"
        className="hover:text-info"
        icon={<ChevronRightIcon />}
      />
    );
  };
  const editRowWithDrawer = (actions: ActionProps, item: T) => {
    return (
      <>
        <Button
          onClick={() => setOpenRowId(item.id)}
          size="small"
          className="hover:text-info"
          icon={<PencilIcon />}
        />
        <AddNewItem
          title={actions.onEditWithDrawer?.title ?? ""}
          description={actions.onEditWithDrawer?.description ?? ""}
          open={openRowId === item.id}
          setOpen={() => setOpenRowId(null)}
        >
          {actions.onEditWithDrawer?.form && (
            <actions.onEditWithDrawer.form
              refetch={actions.refetch!}
              initialData={item}
              closeModal={() => setOpenRowId(null)}
            />
          )}
        </AddNewItem>
      </>
    );
  };

  const editRowInInline = (
    actions: ActionProps,
    item: T,
    inlineValues: Record<string, Record<string, string>>,
    setInlineValues: React.Dispatch<
      React.SetStateAction<Record<string, Record<string, string>>>
    >,
    setOpenInlineId: (value: string | null) => void,
    openInline: string | null
  ) => {
    const handleSave = () => {
      const updatedItem = {
        ...item,
        ...inlineValues[item.id],
      };
      actions.editRowInInline?.onChange(updatedItem);
      setOpenInlineId(null);
      setInlineValues((prev) => {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      });
    };

    return openInline === item.id ? (
      <>
        <Button
          onClick={handleSave}
          size="small"
          className="hover:text-info"
          icon={<CheckIcon />}
        />
        <Button
          onClick={() => setOpenInlineId(null)}
          size="small"
          className="hover:text-error"
          icon={<XIcon />}
        />
      </>
    ) : (
      <Button
        onClick={() => setOpenInlineId(item.id)}
        size="small"
        className="hover:text-info"
        icon={<PencilIcon />}
      />
    );
  };

  
  return { deleteRow, navigateRow, editRowWithDrawer, editRowInInline };
};
