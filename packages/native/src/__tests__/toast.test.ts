import { describe, expect, it } from "vitest";
import { ACTION_DURATION, DEFAULT_DURATION, announcementText, pushToast, resolveDuration, toastEdge } from "../Toast/utils";

describe("Toast", () => {
  it("web konumları en yakın kenara eşlenir, varsayılan alt", () => {
    expect(toastEdge("topRight")).toBe("top");
    expect(toastEdge("top")).toBe("top");
    expect(toastEdge("bottomLeft")).toBe("bottom");
    expect(toastEdge(undefined)).toBe("bottom");
  });
  it("süre: varsayılan, eylemli daha uzun, ekran okuyucuda eylemli kapanmaz", () => {
    expect(resolveDuration(undefined, false, false)).toBe(DEFAULT_DURATION);
    expect(resolveDuration(undefined, true, false)).toBe(ACTION_DURATION);
    expect(resolveDuration(3000, false, true)).toBe(3000);
    expect(resolveDuration(3000, true, true)).toBe(0);
  });
  it("kenar başına sınır aşılınca o kenardaki en eski düşer, diğer kenar etkilenmez", () => {
    const t = (id: string, edge: "top" | "bottom") => ({ id, edge });
    const list = [t("a", "bottom"), t("b", "top"), t("c", "bottom"), t("d", "bottom")];
    expect(pushToast(list, t("e", "bottom")).map((x) => x.id)).toEqual(["b", "c", "d", "e"]);
    expect(pushToast(list, t("f", "top")).map((x) => x.id)).toEqual(["a", "b", "c", "d", "f"]);
  });
  it("duyuru metni başlık + düz metin açıklama", () => {
    expect(announcementText("Kaydedildi", "Ekip güncel sürümü görüyor.")).toBe("Kaydedildi. Ekip güncel sürümü görüyor.");
    expect(announcementText("Kaydedildi", { not: "text" })).toBe("Kaydedildi");
  });
});
