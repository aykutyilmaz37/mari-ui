import type React from "react";
import { cn, type Size } from "@mari-ui/core";

/*
 * Avatar'ın kutu geometrisi (boyut + şekil). Avatar VE Skeleton'ın avatar
 * parçası aynı kaynağı kullanır ki iskelet yüklenince zıplamasın. Burada
 * (lib) durur, `avatar/` içinde değil: skeleton'ı kullanan her bileşen
 * (Card, Modal, Drawer, Toast…) aksi halde avatar klasörünü bundle'a
 * çekiyordu (bundle performansı Faz 4b).
 */

/** Sayı = px (açık kaçış); preset boyutlar `rem`. */
export type AvatarGeometrySize = number | Size;
export type AvatarGeometryShape = "circle" | "square";

/**
 * Preset boyutlar `rem` — 4K/yüksek-DPI ekranlarda `px` kök font'la
 * ölçeklenmediği için küçük kalıyordu. Değerler `@mari-ui/core` componentSize
 * yükseklikleriyle hizalı (h-6/h-8/h-10 = 1.5/2/2.5rem). `size` bir sayı
 * olarak verilirse (açık kaçış) `px` kabul edilir — çağıranın kararı.
 */
const SIZE_REM: Record<Size, string> = { sm: "1.5rem", md: "2rem", lg: "2.5rem" };
const SQUARE_RADIUS_CLASS: Record<Size, string> = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-lg" };

export function getAvatarSizeStyle(size: AvatarGeometrySize): React.CSSProperties {
  const dimension = typeof size === "number" ? size : SIZE_REM[size];
  return { width: dimension, height: dimension };
}

/** Sadece geometri (şekil + radius) — Avatar, iskeleti ve "+N" avatarı bunu kullanır. */
export function getAvatarShapeClasses(shape: AvatarGeometryShape, size: AvatarGeometrySize): string {
  const squareRadius = typeof size === "number" ? SQUARE_RADIUS_CLASS.md : SQUARE_RADIUS_CLASS[size];
  return cn("flex shrink-0 items-center justify-center overflow-hidden", shape === "circle" ? "rounded-full" : squareRadius);
}
