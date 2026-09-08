import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "mari-ui Tema Stüdyosu",
  description: "mari-ui için renk, tipografi ve yoğunluk ayarlarını gerçek bileşen önizlemesiyle düzenleyin.",
};

/**
 * Hook yok, browser API yok — saf sunum. `"use client"` gerekmiyor
 * (interaktif her şey `StudioApp.tsx`e taşındı).
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
