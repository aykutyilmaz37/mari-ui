import type { HexColor } from "../contrast";

export type ColorRamp = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  HexColor
>;

/**
 * Ham renk rampaları. Her rampa 50 (en açık) → 950 (en koyu) arası 11 tondan
 * oluşur. Semantic katman (`semantic/colors.ts`) bunları rol'e (primary,
 * success, ...) bağlar; component'ler asla bu dosyayı doğrudan import etmez.
 *
 * Faz 13 (madde 18 — tasarım geçişi): palet Tailwind blue/slate/orange'dan
 * kullanıcının blue-grey paletine geçti. Turuncu accent TAMAMEN kaldırıldı.
 * Anchor swatch'lar: primary #88BDF2 (300/400), accent #6A89A7 (500),
 * neutral #384959 (700). Rampalar elle yazıldı — her biri `deriveColorRole`
 * aramasının WCAG AA geçen bir `solid` ton bulabilmesi için yeterince derin
 * uçlara sahip (doğrulama: contrast.test.ts).
 */
export const primaryRamp: ColorRamp = {
  50: "#eef6fe",
  100: "#d9ebfd",
  200: "#bdddfc", // kullanıcı swatch
  300: "#93c6f6",
  400: "#88bdf2", // kullanıcı swatch — "seçtiğim rengi görüyorum"
  500: "#5b9fe0",
  600: "#3f82c8",
  700: "#2f66a3", // solid hedef (beyaz metin ~5.9:1)
  800: "#274f7d",
  900: "#213f61",
  950: "#16273f",
};

/** İkincil vurgu — muted steel-blue (#6A89A7 ailesi). Neutral'dan doygunlukla ayrışır. */
export const accentRamp: ColorRamp = {
  50: "#f1f4f7",
  100: "#e2e8ee",
  200: "#c9d5df",
  300: "#a8bccd",
  400: "#88a1b8",
  500: "#6a89a7", // kullanıcı swatch
  600: "#557293", // solid hedef (beyaz metin ~5.0:1)
  700: "#455d79",
  800: "#3a4d63",
  900: "#334153",
  950: "#1f2a37",
};

/**
 * Nötr rampa — surface/border/foreground/muted/input token'ları burada türer.
 * Düşük doygunluklu blue-grey: metin/kenarlık "gri" okunur ama palete uygun
 * hafif mavi tint taşır. `950` (#141d26) koyu tema yüzeyidir — bilinçli olarak
 * saf siyah DEĞİL, palete özgü görünür bir koyu blue-grey.
 */
export const neutralRamp: ColorRamp = {
  50: "#f4f6f8",
  100: "#e7ebef",
  200: "#d0d8df",
  300: "#b0bdc8",
  400: "#8395a5",
  500: "#5f7183",
  600: "#4a5a6b",
  700: "#384959", // kullanıcı swatch
  800: "#2a3946",
  900: "#1e2a35",
  950: "#141d26", // koyu tema yüzeyi
};

export const successRamp: ColorRamp = {
  50: "#ecfdf5",
  100: "#d1fae5",
  200: "#a7f3d0",
  300: "#6ee7b7",
  400: "#34d399",
  500: "#10b981",
  600: "#059669",
  700: "#047857",
  800: "#065f46",
  900: "#064e3b",
  950: "#022c22",
};

export const errorRamp: ColorRamp = {
  50: "#fef2f2",
  100: "#fee2e2",
  200: "#fecaca",
  300: "#fca5a5",
  400: "#f87171",
  500: "#ef4444",
  600: "#dc2626",
  700: "#b91c1c",
  800: "#991b1b",
  900: "#7f1d1d",
  950: "#450a0a",
};

export const warningRamp: ColorRamp = {
  50: "#fffbeb",
  100: "#fef3c7",
  200: "#fde68a",
  300: "#fcd34d",
  400: "#fbbf24",
  500: "#f59e0b",
  600: "#d97706",
  700: "#b45309",
  800: "#92400e",
  900: "#78350f",
  950: "#451a03",
};

export const infoRamp: ColorRamp = {
  50: "#f0f9ff",
  100: "#e0f2fe",
  200: "#bae6fd",
  300: "#7dd3fc",
  400: "#38bdf8",
  500: "#0ea5e9",
  600: "#0284c7",
  700: "#0369a1",
  800: "#075985",
  900: "#0c4a6e",
  950: "#082f49",
};

export const WHITE: HexColor = "#ffffff";
export const BLACK: HexColor = "#000000";
