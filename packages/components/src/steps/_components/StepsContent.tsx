import React from "react";
import { cn } from "@mari-ui/core";

export interface StepsContentProps {
  value: number;
  currentSteps: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Faz 13.5 kullanıcı bulgusu: eskiden `border-dashed` + `bg-mari-primary-subtle`
 * + `w-fit` taşıyordu — bir WIREFRAME/DEBUG yer tutucusu gibi görünüyordu,
 * gerçek bir uygulamada kullanılabilecek bir içerik kutusu gibi değil.
 * İçerik keyfi olduğundan (bir form, özet, herhangi bir şey olabilir) artık
 * hiçbir görsel kutu dayatmıyor — sadece tam genişlik + Steps'in gösterge
 * satırından ayrışsın diye üst boşluk sağlıyor.
 *
 * Hook yok, browser API yok — saf sunum, "use client" gerekmiyor.
 */
export function StepsContent({ value, currentSteps, children, className }: StepsContentProps) {
  return currentSteps === value && <div className={cn("w-full", className)} data-value={value}>{children}</div>;
}
