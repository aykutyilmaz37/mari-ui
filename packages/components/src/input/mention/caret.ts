"use client";

const MIRROR_PROPS = [
  "boxSizing", "width", "height", "overflowX", "overflowY",
  "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth",
  "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "fontStyle", "fontVariant", "fontWeight", "fontStretch", "fontSize", "lineHeight", "fontFamily",
  "textAlign", "textTransform", "textIndent", "letterSpacing", "wordSpacing", "tabSize",
] as const;

/**
 * İmlecin ekrandaki konumu (viewport koordinatı). Alanın stilini kopyalayan
 * görünmez bir "ayna" kutuda imlece kadar olan metin yazılır, ardından gelen
 * işaretçinin konumu ölçülür — tarayıcılar textarea imlecinin konumunu
 * doğrudan vermiyor.
 */
export function getCaretRect(el: HTMLInputElement | HTMLTextAreaElement, position: number): { top: number; left: number; height: number } {
  const style = getComputedStyle(el);
  const mirror = document.createElement("div");
  const isInput = el.nodeName === "INPUT";
  for (const prop of MIRROR_PROPS) mirror.style[prop] = style[prop];
  Object.assign(mirror.style, {
    position: "absolute",
    visibility: "hidden",
    top: "0",
    left: "-9999px",
    whiteSpace: isInput ? "pre" : "pre-wrap",
    overflowWrap: "break-word",
    overflow: "hidden",
  });
  mirror.textContent = el.value.slice(0, position);
  const marker = document.createElement("span");
  marker.textContent = el.value.slice(position) || ".";
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const rect = el.getBoundingClientRect();
  const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.25;
  const top = rect.top + marker.offsetTop + Number.parseFloat(style.borderTopWidth) - el.scrollTop;
  const left = rect.left + marker.offsetLeft + Number.parseFloat(style.borderLeftWidth) - el.scrollLeft;
  mirror.remove();
  return { top, left: Math.min(left, rect.right), height: lineHeight };
}
