import Image from "next/image";
import { getFileExtension, getFileKey, isImageFile } from "../utils";
import { twMerge } from "tailwind-merge";
import { Button } from "../../button";
import { CircleXIcon } from "lucide-react";
import React from "react";
import { ReviewType } from "../types";

type ReviewListProps = {
  fileItem: File;
  reviewType: ReviewType;
  handleDelete: (fileToDelete: File) => void;
};
export const ReviewList: React.FC<ReviewListProps> = ({
  fileItem,
  reviewType,
  handleDelete,
}) => {
  const extension = getFileExtension(fileItem).toLocaleUpperCase();
  const isImage = isImageFile(fileItem);

  return (
    <div
      key={getFileKey(fileItem)}
      className={twMerge(
        "group relative flex items-center justify-center  border-2 border-secondary border-dashed bg-secondary-light p-2 rounded-lg hover:border-info hover:text-info",
        reviewType === "square" && "rounded-lg h-28 w-32",
        reviewType === "circle" && "rounded-full h-32 w-32"
      )}
    >
      {isImage ? (
        <Image
          src={URL.createObjectURL(fileItem)}
          alt={fileItem.name}
          onLoadingComplete={(img) => URL.revokeObjectURL(img.src)}
          width={128}
          height={112}
          className={twMerge(
            "object-cover w-full h-full",
            reviewType === "square" && "rounded",
            reviewType === "circle" && "rounded-full"
          )}
          unoptimized
        />
      ) : (
        <span className="text-primary font-bold text-2xl">{extension}</span>
      )}
      <div
        className={twMerge(
          "group-hover:opacity-100 opacity-0 flex items-center justify-center w-full h-full bg-secondary/20 rounded-lg absolute top-0 left-0 z-10 transition-all duration-300 ease-in-out",
          reviewType === "square" && "rounded-lg",
          reviewType === "circle" && "rounded-full"
        )}
      >
        <Button
          onClick={() => handleDelete(fileItem)}
          className="p-0 text-white hover:text-error"
        >
          <CircleXIcon size={20} />
        </Button>
      </div>
    </div>
  );
};
