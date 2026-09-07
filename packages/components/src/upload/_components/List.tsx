import React from "react";
import { CircleXIcon, PaperclipIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import { formatBytes, getFileExtension, getFileKey } from "../utils";

export interface UploadListProps {
  fileItem: File;
  handleDelete: (fileToDelete: File) => void;
}

export function UploadList({ fileItem, handleDelete }: UploadListProps) {
  const extension = getFileExtension(fileItem).toLocaleUpperCase();
  const size = formatBytes(fileItem.size);

  return (
    <li key={getFileKey(fileItem)} className="flex justify-between items-center text-xs hover:bg-mari-surface-alt rounded px-2">
      <span className="flex gap-1 items-center">
        <PaperclipIcon size={14} />
        {fileItem.name} ({extension})
        <span className="text-mari-muted">({size})</span>
      </span>
      <Button variant="ghost" color="error" size="sm" className={cn("p-0")} onClick={() => handleDelete(fileItem)}>
        <CircleXIcon size={14} />
      </Button>
    </li>
  );
}
