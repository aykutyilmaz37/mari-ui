import qrcode from "qrcode-generator";
import type { QRCornerDotType, QRCornerSquareType, QRDotType, QRErrorLevel } from "./types";

/**
 * Web `qrcode/utils` ile birebir — kullanıcının `qr-code-generator` projesindeki
 * `renderQRtoSVG` mantığının saf portu (react-native-svg yolları aynı sözdizimi). Birim = 1 modül: viewBox
 * modül cinsindendir, boyut CSS ile verilir → her çözünürlükte keskin.
 */

const r2 = (n: number) => Math.round(n * 100) / 100;

export function svgRect(x: number, y: number, w: number, h: number): string {
  return `M${r2(x)},${r2(y)}h${r2(w)}v${r2(h)}h${r2(-w)}z`;
}

export function svgCircle(cx: number, cy: number, radius: number): string {
  // İki 180° yay (başı = sonu olan tek yay SVG'de çizilmez).
  return `M${r2(cx - radius)},${r2(cy)}a${r2(radius)},${r2(radius)} 0 1,0 ${r2(radius * 2)},0a${r2(radius)},${r2(radius)} 0 1,0 ${r2(-radius * 2)},0z`;
}

export function svgRoundRect(x: number, y: number, w: number, h: number, rad: number): string {
  const r = Math.min(rad, w / 2, h / 2);
  return (
    `M${r2(x + r)},${r2(y)}` +
    `h${r2(w - 2 * r)}` +
    `a${r2(r)},${r2(r)} 0 0 1 ${r2(r)},${r2(r)}` +
    `v${r2(h - 2 * r)}` +
    `a${r2(r)},${r2(r)} 0 0 1 ${r2(-r)},${r2(r)}` +
    `h${r2(-(w - 2 * r))}` +
    `a${r2(r)},${r2(r)} 0 0 1 ${r2(-r)},${r2(-r)}` +
    `v${r2(-(h - 2 * r))}` +
    `a${r2(r)},${r2(r)} 0 0 1 ${r2(r)},${r2(-r)}z`
  );
}

export function svgHeart(x: number, y: number, s: number): string {
  const p = r2;
  return (
    `M${p(x + s * 0.5)},${p(y + s * 0.25)}` +
    `C${p(x + s * 0.3)},${p(y)} ${p(x)},${p(y)} ${p(x)},${p(y + s * 0.25)}` +
    `C${p(x)},${p(y + s * 0.55)} ${p(x + s * 0.3)},${p(y + s * 0.7)} ${p(x + s * 0.5)},${p(y + s * 0.9)}` +
    `C${p(x + s * 0.7)},${p(y + s * 0.7)} ${p(x + s)},${p(y + s * 0.55)} ${p(x + s)},${p(y + s * 0.25)}` +
    `C${p(x + s)},${p(y)} ${p(x + s * 0.7)},${p(y)} ${p(x + s * 0.5)},${p(y + s * 0.25)}z`
  );
}

/*
 * Kaynak renderer'daki kalp NOKTA ve kalp köşe HALKASI bilinçli olarak yok:
 * tarayıcıda jsQR ile çözdürüldüğünde (200/400px) hiçbir kombinasyonda
 * okunamadı. Kalp yalnız 3×3 merkezde (cornerDotType) — o okunuyor.
 */
function dotPath(x: number, y: number, s: number, type: QRDotType): string {
  switch (type) {
    case "square":
      return svgRect(x, y, s, s);
    case "dots":
      return svgCircle(x + s / 2, y + s / 2, s / 2);
    case "rounded":
      return svgRoundRect(x, y, s, s, s * 0.25);
    case "extra-rounded":
      return svgRoundRect(x, y, s, s, s * 0.48);
  }
}

/** Konum işaretinin 7×7 halkası: dış − iç (evenodd ile delinir). */
function cornerSquarePath(x: number, y: number, type: QRCornerSquareType): string {
  switch (type) {
    case "square":
      return `${svgRect(x, y, 7, 7)} ${svgRect(x + 1, y + 1, 5, 5)}`;
    case "extra-rounded":
      return `${svgRoundRect(x, y, 7, 7, 1.4)} ${svgRoundRect(x + 1, y + 1, 5, 5, 0.5)}`;
    case "dot":
      return `${svgCircle(x + 3.5, y + 3.5, 3.5)} ${svgCircle(x + 3.5, y + 3.5, 2.5)}`;
  }
}

/** Konum işaretinin 3×3 merkezi. */
function cornerDotPath(x: number, y: number, type: QRCornerDotType): string {
  switch (type) {
    case "square":
      return svgRect(x, y, 3, 3);
    case "dot":
      return svgCircle(x + 1.5, y + 1.5, 1.5);
    case "heart":
      return svgHeart(x, y, 3);
  }
}

/**
 * UTF-8 baytlarını tek baytlık karakter dizisine çevirir. `qrcode-generator`ın
 * varsayılan kodlaması her karakterin yalnız alt baytını alır: "ş" (U+015F)
 * "_" olur ve Türkçe içerik bozuk kodlanır. Kütüphanenin global
 * `stringToBytes` ayarına dokunmadan doğru baytları verir.
 */
export function toByteString(value: string): string {
  if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(value), (b) => String.fromCharCode(b)).join("");
  // TextEncoder'sız motor (eski Hermes): elle UTF-8.
  let out = "";
  for (const ch of value) {
    const cp = ch.codePointAt(0)!;
    if (cp < 0x80) out += String.fromCharCode(cp);
    else if (cp < 0x800) out += String.fromCharCode(0xc0 | (cp >> 6), 0x80 | (cp & 63));
    else if (cp < 0x10000) out += String.fromCharCode(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
    else out += String.fromCharCode(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 63), 0x80 | ((cp >> 6) & 63), 0x80 | (cp & 63));
  }
  return out;
}

export interface QRModel {
  /** Kenar boşluğu dahil viewBox kenarı (modül). */
  size: number;
  moduleCount: number;
  /** Konum işaretleri hariç tüm veri modülleri — tek yol. */
  dataPath: string;
  /** Üç konum işaretinin halka + merkez yolları. */
  corners: { ring: string; dot: string }[];
}

export interface QRModelOptions {
  value: string;
  errorLevel: QRErrorLevel;
  margin: number;
  dotType: QRDotType;
  cornerSquareType: QRCornerSquareType;
  cornerDotType: QRCornerDotType;
}

export function buildQRModel({ value, errorLevel, margin, dotType, cornerSquareType, cornerDotType }: QRModelOptions): QRModel {
  const qr = qrcode(0, errorLevel);
  qr.addData(toByteString(value), "Byte");
  qr.make();

  const n = qr.getModuleCount();
  const finders = [
    [0, 0],
    [0, n - 7],
    [n - 7, 0],
  ] as const;
  const isFinder = (row: number, col: number) => finders.some(([fr, fc]) => row >= fr && row < fr + 7 && col >= fc && col < fc + 7);

  // Her nokta modülün TAMAMINI kaplar. Kaynak renderer her yandan %15 boşluk
  // bırakıyordu (nokta = modülün %70'i): tarayıcıda jsQR ile çözdürüldüğünde o
  // boşlukla stilli kodlar hiç çözülmedi, %5'te bazı boyutlarda çözülmedi,
  // boşluksuz tüm stiller 150–600px'te çözüldü. Değiştirirseniz yeniden doğrulayın.
  let dataPath = "";
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      if (isFinder(row, col) || !qr.isDark(row, col)) continue;
      dataPath += dotPath(margin + col, margin + row, 1, dotType);
    }
  }

  const corners = finders.map(([fr, fc]) => ({
    ring: cornerSquarePath(margin + fc, margin + fr, cornerSquareType),
    dot: cornerDotPath(margin + fc + 2, margin + fr + 2, cornerDotType),
  }));

  return { size: n + margin * 2, moduleCount: n, dataPath, corners };
}
