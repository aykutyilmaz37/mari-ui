import React from "react";
import type { Side } from "./floating";

/**
 * Yüzey renkli yüzen panellerin (Dropdown, Popover, Popconfirm) ortak ölçüleri
 * ve oku — Faz 16.2'de DropdownContent'ten taşındı.
 *
 * Yapısal ölçüler ant.design'ın canlı Dropdown sayfasından `getComputedStyle`
 * ile alındı: ok yokken tetikleyiciyle panel arasında 4px, okluyken 12px
 * (8px'lik ok kutusu + 4px); ok, panelin hizalandığı kenardan 12px içeride
 * başlayan 16px'lik bir kutu, yani ORTASI kenardan 20px. GÖRÜNÜM (gölge,
 * kenarlık, renk) ant'tan değil kendi token'larımızdan gelir.
 */
export const FLOATING_GAP_PX = 4;
export const FLOATING_ARROW_GAP_PX = 12;
export const FLOATING_ARROW_INSET_PX = 20;
/** Panel viewport kenarına YAPIŞMASIN diye bırakılan minimum boşluk. */
export const FLOATING_EDGE_PX = 8;

/** ant.design okunun birebir `clip-path`i: 16×8, ucu yuvarlak, taban köşeleri panele yumuşakça karışan üçgen. */
const ARROW_FILL_PATH = "M 0 8 A 4 4 0 0 0 2.82843 6.82843 L 6.58579 3.07107 A 2 2 0 0 1 9.41421 3.07107 L 13.1716 6.82843 A 4 4 0 0 0 16 8 Z";
/** Aynı yol KAPATILMADAN — kenarlık rengiyle sadece eğik kenarlar çizilir; taban çizgisi panelin kenarlığının üstünden geçmesin diye (dolgu o kısmı örter). */
const ARROW_STROKE_PATH = "M 0 8 A 4 4 0 0 0 2.82843 6.82843 L 6.58579 3.07107 A 2 2 0 0 1 9.41421 3.07107 L 13.1716 6.82843 A 4 4 0 0 0 16 8";

const ARROW_LONG_PX = 16;
const ARROW_SHORT_PX = 8;
/** Panelin kenarlığı: mutlak konumlu ok padding kutusuna göre konumlanır, bu yüzden çapraz eksende 1px düzeltilir. */
const BORDER_PX = 1;

/** `side` panelin tetikleyiciye GÖRE konumu; ok panelin tetikleyiciye bakan kenarında durur ve tetikleyiciyi gösterir. */
function getArrowBox(side: Side, offset: number): { style: React.CSSProperties; rotation: number } {
  const half = ARROW_LONG_PX / 2 + BORDER_PX;
  switch (side) {
    case "bottom":
      return { style: { left: offset - half, top: -ARROW_SHORT_PX, width: ARROW_LONG_PX, height: ARROW_SHORT_PX }, rotation: 0 };
    case "top":
      return { style: { left: offset - half, top: "100%", width: ARROW_LONG_PX, height: ARROW_SHORT_PX }, rotation: 180 };
    case "right":
      return { style: { left: -ARROW_SHORT_PX, top: offset - half, width: ARROW_SHORT_PX, height: ARROW_LONG_PX }, rotation: -90 };
    default:
      return { style: { left: "100%", top: offset - half, width: ARROW_SHORT_PX, height: ARROW_LONG_PX }, rotation: 90 };
  }
}

export function FloatingArrow({ side, offset }: { side: Side; offset: number }) {
  const { style, rotation } = getArrowBox(side, offset);
  return (
    <span aria-hidden="true" className="pointer-events-none absolute" style={style}>
      <svg
        width={ARROW_LONG_PX}
        height={ARROW_SHORT_PX}
        viewBox="0 0 16 8"
        className="absolute left-1/2 top-1/2 overflow-visible"
        style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      >
        <path d={ARROW_FILL_PATH} className="fill-mari-surface" />
        {/* Taban ucu panelin 1px kenarlığının TAM ortasına otursun diye yarım piksel yukarı: aksi halde çizgi kenarlığın 0.5px dışına/altına taşıp çıkıntı bırakır. */}
        <path d={ARROW_STROKE_PATH} fill="none" transform="translate(0 -0.5)" className="stroke-mari-border" />
      </svg>
    </span>
  );
}
