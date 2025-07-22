import React from "react";
import { CircleXIcon, PaperclipIcon, UploadIcon } from "lucide-react";
import { Button } from "../button";
import { Input } from "../input";
import { formatBytes } from "./utils";
import { useToast } from "../toast";

type UploadProps = {
  dragDrop?: boolean;
  fileSize?: number;
  fileType?: string;
};
export const Upload: React.FC<UploadProps> = ({
  dragDrop,
  fileSize = 5 * 1024 * 1024,
  fileType,
}) => {
  const { showToast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileList, setFileList] = React.useState<File[]>([]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (fileType && file && file.type !== fileType) {
      showToast({
        title: "Hata",
        description: "Geçersiz dosya türü",
        type: "error",
      });
      return;
    }
    if (file) {
      if (file.size > fileSize) {
        showToast({
          title: "Hata",
          description: "Dosya boyutu çok büyük",
          type: "error",
        });
      } else {
        setFileList((prev) => [...prev, file]);
      }
    } else {
      console.warn("Herhangi bir dosya seçilmedi.");
    }
  };

  const handleDelete = (fileToDelete: File) => {
    setFileList((prev) => prev.filter((file) => file !== fileToDelete));
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;

    if (droppedFiles && droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      setFileList((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  return (
    <div className="flex flex-col gap-2">
      {dragDrop ? (
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
      ) : (
        <Button
          onClick={handleClick}
          className="flex justify-between items-center"
          variant="outlined"
          type="primary"
          icon={<UploadIcon size={16} />}
        >
          Click to Upload
        </Button>
      )}
      <Input
        ref={fileInputRef}
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />
      <ul>
        {fileList.map((fileItem) => {
          const fileSizeInReadableFormat = formatBytes(fileItem.size); // örnek: "132.89 KB" veya "1.3 MB"

          return (
            <li
              key={fileItem.lastModified}
              className="flex justify-between items-center text-xs hover:bg-secondary-light rounded px-2"
            >
              <span className="flex gap-1 items-center">
                <PaperclipIcon size={14} />
                {fileItem?.name}
                <span className="text-secondary-muted">
                  {`(${fileSizeInReadableFormat})`}
                </span>
              </span>
              <Button
                onClick={() => handleDelete(fileItem)}
                className="p-0 hover:text-error"
              >
                <CircleXIcon size={14} />
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
