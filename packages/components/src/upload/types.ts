export type ListType = "list" | "review";
export type InputType = "button" | "dragDrop" | "review";
export type ReviewType = "square" | "circle";

/** Bir dosyanın yükleme durumu — gerçek bir sunucu/`action` yok, bu yüzden
 * `uploading` → `done` geçişi simüle edilir (ant.design'ın kendi demo
 * sayfalarının da yaptığı gibi), ama UI bu durumu GERÇEKTEN render eder. */
export type UploadFileStatus = "uploading" | "done";

export interface UploadFileItem {
  file: File;
  id: string;
  status: UploadFileStatus;
  progress: number;
}

export interface UploadProps {
  inputType?: InputType;
  fileSize?: number;
  fileType?: string;
  max?: number;
  listType?: ListType;
  reviewType?: ReviewType;
}
