import { UploadIcon } from "lucide-react";
import { Button } from "../../button";
import { twMerge } from "tailwind-merge";
import { ReviewType } from "../types";

type UploadReviewButtonProps = {
  handleClick: () => void;
  reviewType: ReviewType;
};
export const UploadReviewButton: React.FC<UploadReviewButtonProps> = ({
  handleClick,
  reviewType,
}) => {
  return (
    <div className={twMerge("flex gap-2")}>
      <Button
        onClick={handleClick}
        className={twMerge(
          "h-28 w-32 border-2 border-secondary border-dashed bg-secondary-light p-2  hover:border-info hover:text-info shrink-0",
          reviewType === "square" && "rounded-lg h-28 w-32",
          reviewType === "circle" && "rounded-full h-32 w-32"
        )}
      >
        <span className="flex flex-col items-center !justify-center">
          <UploadIcon />
          <span>Click to Upload</span>
        </span>
      </Button>
    </div>
  );
};
