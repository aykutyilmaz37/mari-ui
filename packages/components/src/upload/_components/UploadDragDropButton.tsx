import React from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "../../button";

export interface UploadDragDropButtonProps {
  handleClick: () => void;
  addFiles: (files: File[]) => void;
}

export function UploadDragDropButton({ handleClick, addFiles }: UploadDragDropButtonProps) {
  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <Button
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      variant="ghost"
      color="neutral"
      className="min-w-xl min-h-72 border-2 border-mari-border border-dashed bg-mari-surface-alt p-2 rounded-lg hover:border-mari-info-border hover:text-mari-info"
    >
      <span className="flex flex-col items-center justify-center">
        <UploadIcon />
        <span>Yüklemek için tıklayın veya sürükleyip bırakın</span>
      </span>
    </Button>
  );
}
