import React from "react";
import { Input } from "../input";
import { InputType, ListType, ReviewType } from "./types";
import { twMerge } from "tailwind-merge";
import { ReviewList } from "./components/ReviewList";
import { UploadList } from "./components/List";
import { UploadListButton } from "./components/UploadListButton";
import { UploadDragDropButton } from "./components/UploadDragDropButton";
import { UploadReviewButton } from "./components/UploadReviewButton";
import { useUpload } from "./useUpload";

type UploadProps = {
  inputType?: InputType;
  fileSize?: number;
  fileType?: string;
  max?: number;
  listType?: ListType;
  reviewType?: ReviewType;
};
export const Upload: React.FC<UploadProps> = ({
  inputType = "button",
  fileSize = 5 * 1024 * 1024,
  fileType,
  max = 5,
  listType = "list",
  reviewType = "square",
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { fileList, addFile, deleteFile, addFiles } = useUpload({
    fileSize,
    fileType,
    max,
  });

  const handleClick = React.useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return console.warn("Herhangi bir dosya seçilmedi.");
    addFile(file);
  };

  const renderFilePreview = (fileItem: File, listType: ListType) => {
    if (listType === "review") {
      return (
        <ReviewList
          fileItem={fileItem}
          reviewType={reviewType}
          handleDelete={deleteFile}
        />
      );
    } else {
      return <UploadList fileItem={fileItem} handleDelete={deleteFile} />;
    }
  };

  const renderUploadButton = (inputType: InputType) => {
    switch (inputType) {
      case "button": {
        return <UploadListButton handleClick={handleClick} />;
      }
      case "dragDrop": {
        return (
          <UploadDragDropButton addFiles={addFiles} handleClick={handleClick} />
        );
      }
      case "review": {
        return (
          <UploadReviewButton
            handleClick={handleClick}
            reviewType={reviewType}
          />
        );
      }
    }
  };

  return (
    <div
      className={twMerge(
        "flex gap-2",
        listType === "review" ? "flex-row" : "flex-col"
      )}
    >
      {renderUploadButton(inputType)}
      <Input
        ref={fileInputRef}
        className="hidden"
        type="file"
        onChange={handleFileChange}
      />
      {listType === "review" ? (
        <div className="grid grid-cols-5 gap-1 shrink-0">
          {fileList.map((file) => renderFilePreview(file, listType))}
        </div>
      ) : (
        <ul>{fileList.map((file) => renderFilePreview(file, listType))}</ul>
      )}
    </div>
  );
};
