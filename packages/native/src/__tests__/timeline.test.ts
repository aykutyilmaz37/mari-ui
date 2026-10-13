import { describe, expect, it } from "vitest";
import { buildItems, resolveSide } from "../Timeline/timelineUtils";
import type { TimelineItem } from "../Timeline/types";

const items: TimelineItem[] = [
  { title: "09:12", content: "Sipariş alındı" },
  { title: "10:40", content: "Hazırlanıyor", color: "info" },
  { title: "15:05", content: "Kargoya verildi", color: "success" },
];

describe("Timeline utils", () => {
  it("buildItems: pending sona eklenir, reverse'te başa gelir", () => {
    expect(buildItems(items, undefined, false)).toHaveLength(3);
    const withPending = buildItems(items, true, false);
    expect(withPending.at(-1)).toMatchObject({ loading: true, content: "Devam ediyor…" });
    expect(buildItems(items, "Dağıtımda", true)[0]).toMatchObject({ loading: true, content: "Dağıtımda" });
    expect(buildItems(items, false, false)).toHaveLength(3);
  });

  it("resolveSide: start/end sabit, alternate sırayla, placement önceliklidir", () => {
    expect(resolveSide("start", 1, undefined)).toBe("after");
    expect(resolveSide("end", 0, undefined)).toBe("before");
    expect(resolveSide("alternate", 0, undefined)).toBe("after");
    expect(resolveSide("alternate", 1, undefined)).toBe("before");
    expect(resolveSide("alternate", 1, "start")).toBe("after");
  });
});
