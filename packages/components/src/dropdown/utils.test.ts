import { describe, expect, it } from "vitest";
import { computePanelPosition, getRovingTarget, parsePlacement } from "./utils";

const VIEWPORT = { width: 1000, height: 800 };
const PANEL = { width: 200, height: 100 };
// Ekranın ortasında 100x40'lık bir tetikleyici.
const ANCHOR = { top: 400, left: 450, width: 100, height: 40 };
const GAP = 8;
const EDGE = 8;

const place = (placement: Parameters<typeof computePanelPosition>[2], anchor = ANCHOR, panel = PANEL) =>
  computePanelPosition(anchor, panel, placement, VIEWPORT, GAP, EDGE);

describe("parsePlacement", () => {
  it("hizası yoksa center döner", () => {
    expect(parsePlacement("bottom")).toEqual({ side: "bottom", align: "center" });
    expect(parsePlacement("left-end")).toEqual({ side: "left", align: "end" });
  });
});

describe("computePanelPosition", () => {
  it("bottom: panel tetikleyicinin ALTINDA ve tetikleyiciye ortalı (sarmalayıcıya değil)", () => {
    expect(place("bottom")).toMatchObject({ top: 448, left: 400 });
  });

  it("bottom-start: panelin sol kenarı tetikleyicinin sol kenarıyla hizalı", () => {
    expect(place("bottom-start")).toMatchObject({ top: 448, left: 450 });
  });

  it("bottom-end: panelin sağ kenarı tetikleyicinin sağ kenarıyla hizalı (kebab menü için)", () => {
    expect(place("bottom-end")).toMatchObject({ top: 448, left: 350 });
  });

  it("top: panel tetikleyicinin ÜSTÜNDE", () => {
    expect(place("top")).toMatchObject({ top: 292, left: 400 });
  });

  it("left: panel tetikleyicinin soluna, dikeyde ortalı", () => {
    expect(place("left")).toMatchObject({ top: 370, left: 242 });
  });

  it("right-start: panel tetikleyicinin sağına, üst kenarlar hizalı", () => {
    expect(place("right-start")).toMatchObject({ top: 400, left: 558 });
  });

  it("altta yer yoksa ama üstte varsa yönü çevirir (flip) — tetikleyicinin üstüne binmez", () => {
    const nearBottom = { top: 740, left: 450, width: 100, height: 40 };
    const { top } = place("bottom", nearBottom);
    expect(top).toBe(740 - GAP - PANEL.height);
  });

  it("dönüş değeri flip sonrası gerçek yönü (side) bildirir", () => {
    expect(place("bottom").side).toBe("bottom");
    expect(place("bottom", { top: 740, left: 450, width: 100, height: 40 }).side).toBe("top");
  });

  const ARROW = { inset: 20, pointAtCenter: false };
  const arrowOf = (placement: Parameters<typeof computePanelPosition>[2], arrow = ARROW, anchor = ANCHOR) =>
    computePanelPosition(anchor, PANEL, placement, VIEWPORT, GAP, EDGE, arrow);

  it("ok (ant.design): hizalanan kenardan sabit inset içeride; ortalıda panelin ortasında", () => {
    expect(arrowOf("bottom-start").arrowOffset).toBe(20);
    expect(arrowOf("bottom-end").arrowOffset).toBe(PANEL.width - 20);
    expect(arrowOf("bottom").arrowOffset).toBe(PANEL.width / 2);
  });

  it("ok pointAtCenter: panel kayar, ok tetikleyicinin ortasını gösterir ve inset kadar içeride kalır", () => {
    const end = arrowOf("bottom-end", { inset: 20, pointAtCenter: true });
    // tetikleyici ortası x=500; ok panelin sağından 20 içeride olacak şekilde panel left=320.
    expect(end.left).toBe(320);
    expect(end.left + end.arrowOffset).toBe(500);
    const start = arrowOf("bottom-start", { inset: 20, pointAtCenter: true });
    expect(start.left).toBe(480);
    expect(start.left + start.arrowOffset).toBe(500);
  });

  it("ok pointAtCenter: küçük tetikleyicide (kebab) panelin sağ kenarı tetikleyiciyi taşar, ok tam ortayı gösterir", () => {
    const kebab = { top: 400, left: 700, width: 28, height: 28 };
    const { left, arrowOffset } = arrowOf("bottom-end", { inset: 20, pointAtCenter: true }, kebab);
    expect(left + arrowOffset).toBe(714);
    expect(left + PANEL.width).toBe(714 + 20);
  });

  it("ok: viewport kelepçesi paneli kaydırsa da ok panelin köşesine taşmaz", () => {
    const nearRight = { top: 400, left: 985, width: 30, height: 40 };
    const { arrowOffset } = arrowOf("bottom-end", { inset: 20, pointAtCenter: true }, nearRight);
    expect(arrowOffset).toBeLessThanOrEqual(PANEL.width - 20);
    expect(arrowOffset).toBeGreaterThanOrEqual(20);
  });

  it("ok: yatay yönlerde (left/right) dikey eksende hizaya göre konumlanır", () => {
    const { arrowOffset, side } = arrowOf("right");
    expect(side).toBe("right");
    expect(arrowOffset).toBe(PANEL.height / 2);
    expect(arrowOf("right-start").arrowOffset).toBe(20);
  });

  it("iki yönde de yer yoksa tercih edilen yönde kalıp viewport içinde kelepçelenir", () => {
    const tiny = { width: 1000, height: 150 };
    const { top } = computePanelPosition({ top: 60, left: 450, width: 100, height: 40 }, PANEL, "bottom", tiny, GAP, EDGE);
    expect(top).toBeGreaterThanOrEqual(EDGE);
    expect(top + PANEL.height).toBeLessThanOrEqual(tiny.height - EDGE);
  });

  it("yatay eksende viewport dışına taşmaz", () => {
    const nearRight = { top: 400, left: 960, width: 30, height: 40 };
    const { left } = place("bottom", nearRight);
    expect(left + PANEL.width).toBeLessThanOrEqual(VIEWPORT.width - EDGE);
    const nearLeft = { top: 400, left: 0, width: 30, height: 40 };
    expect(place("bottom", nearLeft).left).toBe(EDGE);
  });

  it("yatayda iki yön de sığmıyorsa dik yöne (üst/alt) geçer — tetikleyiciyi örtmez", () => {
    const narrow = { width: 375, height: 800 };
    const anchor = { top: 400, left: 330, width: 30, height: 30 };
    const pos = computePanelPosition(anchor, { width: 320, height: 80 }, "right", narrow, 8, 8);
    expect(pos.side).toBe("top");
    expect(pos.left).toBeGreaterThanOrEqual(8);
    expect(pos.left + 320).toBeLessThanOrEqual(375 - 8);
  });

  it("çapraz eksende ekrana kıstırma paneli tetikleyiciden koparmaz (kenara yakın tetikleyici)", () => {
    const vp = { width: 1000, height: 600 };
    // Sağa açılan 40px'lik panel; tetikleyici ekranın alt kenarında (y 580–596).
    const anchor = { top: 580, left: 100, width: 16, height: 16 };
    const pos = computePanelPosition(anchor, { width: 120, height: 40 }, "right", vp, 8, 8, { inset: 12, pointAtCenter: true });
    const anchorCenter = anchor.top + anchor.height / 2;
    expect(pos.top).toBeLessThanOrEqual(anchorCenter - 12);
    expect(pos.top + 40).toBeGreaterThanOrEqual(anchorCenter + 12);
  });
});

describe("getRovingTarget", () => {
  const make = (...labels: string[]) =>
    labels.map((label) => {
      const el = document.createElement("button");
      el.textContent = label;
      return el;
    });

  it("↓/↑ sarar, Home/End uçlara gider, başka tuşta null", () => {
    const items = make("A", "B", "C");
    expect(getRovingTarget(items, items[2]!, "ArrowDown")).toBe(items[0]);
    expect(getRovingTarget(items, items[0]!, "ArrowUp")).toBe(items[2]);
    expect(getRovingTarget(items, null, "ArrowDown")).toBe(items[0]);
    expect(getRovingTarget(items, items[1]!, "End")).toBe(items[2]);
    expect(getRovingTarget(items, items[1]!, "Home")).toBe(items[0]);
    expect(getRovingTarget(items, items[1]!, "Enter")).toBeNull();
    expect(getRovingTarget(items, items[1]!, " ")).toBeNull();
    expect(getRovingTarget([], null, "ArrowDown")).toBeNull();
  });

  it("harfle atlama Türkçe büyük/küçük harf duyarsızdır ve mevcut öğeden sonrasına bakar", () => {
    const items = make("İndir", "Ayarlar", "ırmak", "İptal");
    expect(getRovingTarget(items, items[0]!, "i")).toBe(items[3]);
    expect(getRovingTarget(items, items[3]!, "i")).toBe(items[0]);
    expect(getRovingTarget(items, null, "ı")).toBe(items[2]);
    expect(getRovingTarget(items, items[0]!, "z")).toBeNull();
  });
});

