import React from "react";
import { UploadIcon } from "lucide-react";
import { Button } from "../../button";

export interface UploadListButtonProps {
  handleClick: () => void;
}

export function UploadListButton({ handleClick }: UploadListButtonProps) {
  return (
    // `self-start` — ant.design'ın butonu da içeriği kadar geniştir; flex-col
    // ebeveynin `align-items: stretch` varsayılanı (Faz 13'te fark edildi)
    // butonu tam genişliğe geriyor, ikon/metni köşelere itip garip
    // görünmesine sebep oluyordu.
    <Button onClick={handleClick} className="self-start" variant="outline" color="primary" icon={<UploadIcon size={16} />}>
      Yüklemek için tıklayın
    </Button>
  );
}
