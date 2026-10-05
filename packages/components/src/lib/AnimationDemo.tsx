"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../button";

/**
 * YALNIZ STORY'LER İÇİN — giriş animasyonu (`animated`) olan bileşenlerin
 * "Animasyon" story'si: "Tekrar oynat" bileşeni yeniden bağlar (key), giriş
 * animasyonu baştan çalışır. Paket girişlerinden import edilmez.
 */
export function AnimationDemo({ children, className }: { children: React.ReactNode; className?: string }) {
  const [run, setRun] = useState(0);
  return (
    <div className="flex flex-col items-start gap-4">
      <Button size="sm" variant="outline" color="neutral" icon={<RotateCcw />} onClick={() => setRun((n) => n + 1)}>
        Tekrar oynat
      </Button>
      <div key={run} className={className ?? "w-full"}>
        {children}
      </div>
    </div>
  );
}

/** "Animasyon" story'lerinin ortak açıklaması. */
export const ANIMATION_STORY_DOC =
  "`animated`: ilk çizimde — iskeletten yüklü hale geçerken de — işaretler büyür / çizilir. Varsayılan açık; `animated={false}` ile kapatılır. " +
  "İşletim sisteminde hareket azaltma açıksa çalışmaz, grafik doğrudan son halinde görünür.";
