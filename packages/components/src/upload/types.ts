export type ListType = "list" | "review";
export type InputType = "button" | "dragDrop" | "review";
export type ReviewType = "square" | "circle";

export interface UploadProps {
  inputType?: InputType;
  fileSize?: number;
  fileType?: string;
  max?: number;
  listType?: ListType;
  reviewType?: ReviewType;
}
