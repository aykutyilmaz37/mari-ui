import type { SkeletonableProps } from "../lib/skeleton";

export type ListType = "list" | "review";
export type InputType = "button" | "dragDrop" | "review";
export type ReviewType = "square" | "circle";

/**
 * Bir dosyanın yükleme durumu — gerçek bir sunucu/`action` yok, bu yüzden
 * `uploading` → `done` geçişi simüle edilir, ama UI bu durumu GERÇEKTEN render eder.
 */
export type UploadFileStatus = "uploading" | "done";

export interface UploadFileItem {
  file: File;
  id: string;
  status: UploadFileStatus;
  progress: number;
}

export interface UploadProps extends SkeletonableProps {
  inputType?: InputType;
  fileSize?: number;
  fileType?: string;
  max?: number;
  listType?: ListType;
  reviewType?: ReviewType;
  /*
   * Liste her değiştiğinde (ekleme, silme, yükleme tamamlandı) çağrılır.
   * `files`: listedeki dosyalar; `items`: durum/ilerleme bilgisiyle.
   * Eskiden HİÇ yoktu — bileşen seçilen dosyaları tüketiciye veremiyordu.
   */
  /** Liste değişince (ekleme ya da silme) çağrılır: seçilen dosyalar ve listenin güncel hali. */
  onChange?: (files: File[], items: UploadFileItem[]) => void;
  disabled?: boolean;
}
