import React from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "../../button";

export interface UploadListButtonProps {
  handleClick: () => void;
}

export function UploadListButton({ handleClick }: UploadListButtonProps) {
  return (
    <Button onClick={handleClick} className="flex justify-between items-center" variant="outline" color="primary" icon={<UploadIcon size={16} />}>
      Yüklemek için tıklayın
    </Button>
  );
}
