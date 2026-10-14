import React from "react";
import { PaperclipIcon, XIcon } from "lucide-react";
import { cn } from "@mari-ui/core";
import { Button } from "../../button";
import type { UploadFileItem } from "../types";

export interface UploadListProps {
  item: UploadFileItem;
  handleDelete: (id: string) => void;
}

/*
 * ant.design'ın varsayılan dosya listesiyle birebir karşılaştırıldı: satır
 * sadece ataç ikonu + dosya adından oluşur (uzantı/boyut AYRICA yazılmaz —
 * eskiden "ad.ext (UZANTI) (boyut)" şeklinde kalabalıktı). Silme ikonu
 * SADECE satır hover'ındayken görünür (eskiden hep görünürdü). `uploading`
 * durumunda satırın altında ince bir ilerleme çubuğu belirir.
 */
export function UploadList({ item, handleDelete }: Readonly<UploadListProps>) {
  const isUploading = item.status === "uploading";

  return (
    <li className="group flex flex-col gap-1 rounded-sm px-2 py-1 hover:bg-mari-surface-alt">
      <span className="flex items-center justify-between gap-2 text-sm">
        <span className="flex min-w-0 items-center gap-1.5 text-mari-foreground">
          <PaperclipIcon size={14} className={cn("shrink-0", isUploading ? "text-mari-primary" : "text-mari-muted")} />
          <span className="truncate">{item.file.name}</span>
        </span>
        <Button
          variant="ghost"
          color="neutral"
          size="sm"
          shape="circle"
          // Dokunmatikte hover yok — sil butonu orada hep görünür (eskiden görünmez ama dokunulabilir bir hedefti).
          className="shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100"
          aria-label={`${item.file.name} dosyasını kaldır`}
          onClick={() => handleDelete(item.id)}
        >
          <XIcon size={14} />
        </Button>
      </span>
      {isUploading && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-mari-border" role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full rounded-full bg-mari-primary-solid transition-all duration-200" style={{ width: `${item.progress}%` }} />
        </div>
      )}
    </li>
  );
}
