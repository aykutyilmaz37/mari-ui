import { UploadIcon } from "lucide-react";
import { Button } from "../../button";

type UploadDragDropButtonProps = {
  handleClick: () => void;
  addFiles: (files: File[]) => void;
};
export const UploadDragDropButton: React.FC<UploadDragDropButtonProps> = ({
  handleClick,
  addFiles,
}) => {
  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <Button
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="min-w-xl min-h-72 border-2 border-secondary border-dashed bg-secondary-light p-2 rounded-lg hover:border-info hover:text-info"
    >
      <span className="flex flex-col items-center !justify-center">
        <UploadIcon />
        <span>Click to Upload or Drag&Drop</span>
      </span>
    </Button>
  );
};
