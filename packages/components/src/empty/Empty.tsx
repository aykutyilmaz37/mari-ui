import React from "react";
import { FileWarning } from "lucide-react";
import { Button } from "../button";

export interface EmptyProps {
  title: string;
  description?: string;
  buttonText?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  buttonIcon?: React.ReactNode;
}

/**
 * ant.design'ın gerçek Empty'si (`getComputedStyle`, ant.design/components/empty)
 * bizimkinden daha yalın: ayrı bir kalın başlık yok, tek bir 14px/soluk
 * (`rgba(0,0,0,.45)`) `description` satırı görselin 8px altında duruyor.
 * Bizim `title`+`description` ikilisi ant'a göre daha zengin bir API (kasıtlı
 * bir üst küme, kaldırılmadı) ama görselin altındaki boşluk ve description'ın
 * font-size'ı ant'ın ölçüleriyle hizalandı: `mb-4`→`mb-2`, description artık
 * `text-sm` (14px).
 */
// Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
export function Empty({ title, description, buttonText, onClick, icon, buttonIcon }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="mb-2 text-mari-muted">{icon ?? <FileWarning className="w-12 h-12" />}</div>
      <h2 className="text-xl font-semibold mb-2 text-mari-foreground">{title}</h2>
      {description && <p className="text-sm text-mari-muted mb-4 max-w-md">{description}</p>}
      {buttonText && (
        <Button color="primary" onClick={onClick} disabled={!onClick} icon={buttonIcon}>
          {buttonText}
        </Button>
      )}
    </div>
  );
}
