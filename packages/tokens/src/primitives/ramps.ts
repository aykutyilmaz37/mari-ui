import type { HexColor } from "../contrast";

export type ColorRamp = Record<
  50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950,
  HexColor
>;

/** Soft Iris: marka rampaları; semantik roller kontrast kontrolüyle türetilir. */
export const primaryRamp: ColorRamp = {
  50: "#f4f1ff",
  100: "#ebe6ff",
  200: "#d5caff",
  300: "#c6b8ff",
  400: "#b7a5ff",
  500: "#8972e4",
  600: "#6951ce",
  700: "#5842b3",
  800: "#493594",
  900: "#382c59",
  950: "#251c3b",
};

/** İkincil vurgu: iris ile uyumlu, düşük doygunluklu mor. */
export const accentRamp: ColorRamp = {
  50: "#f4f1f8",
  100: "#eae3f2",
  200: "#d5c7e4",
  300: "#c4b2d9",
  400: "#b19cca",
  500: "#8f76ac",
  600: "#765991",
  700: "#634879",
  800: "#503b63",
  900: "#392a48",
  950: "#261d30",
};

/** Mor alt tonlu nötrler. Dekoratif border ve işlevsel input ayrı seçilir. */
export const neutralRamp: ColorRamp = {
  50: "#f8f8fc",
  100: "#f1effa",
  200: "#e2dfef",
  300: "#bcb5cf",
  400: "#898398",
  500: "#79718e",
  600: "#696579",
  700: "#403b54",
  800: "#2c2938",
  900: "#242331",
  950: "#191822",
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
