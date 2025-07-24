import React from "react";
import { formatBytes, getFileExtension, getFileKey } from "../utils";
import { CircleXIcon, PaperclipIcon } from "lucide-react";
import { Button } from "../../button";

type UploadListProps = {
  fileItem: File;
  handleDelete: (fileToDelete: File) => void;
};
export const UploadList: React.FC<UploadListProps> = ({
  fileItem,
  handleDelete,
}) => {
  const extension = getFileExtension(fileItem).toLocaleUpperCase();
  const size = formatBytes(fileItem.size);

  return (
    <li
      key={getFileKey(fileItem)}
      className="flex justify-between items-center text-xs hover:bg-secondary-light rounded px-2"
    >
      <span className="flex gap-1 items-center">
        <PaperclipIcon size={14} />
        {fileItem.name} ({extension})
        <span className="text-secondary-muted">({size})</span>
      </span>
      <Button
        onClick={() => handleDelete(fileItem)}
        className="p-0 hover:text-error"
      >
        <CircleXIcon size={14} />
      </Button>
    </li>
  );
};
