import { describe, expect, it } from "vitest";
import type { TransferItem } from "./types";
import { countLabel, filterItems, moveKeys, rangeSelect, selectAllState, splitLists, toggleAll } from "./utils";

const items: TransferItem[] = [
  { key: "a", title: "Ankara" },
  { key: "b", title: "Bursa" },
  { key: "c", title: "Çanakkale", disabled: true },
  { key: "d", title: "Diyarbakır" },
  { key: "i", title: "İzmir" },
];

describe("Transfer utils", () => {
  it("splitLists: sol dataSource sırası, sağ targetKeys sırası; bilinmeyen anahtar düşer", () => {
    const { left, right } = splitLists(items, ["d", "x", "a"]);
    expect(left.map((i) => i.key)).toEqual(["b", "c", "i"]);
    expect(right.map((i) => i.key)).toEqual(["d", "a"]);
  });

  it("filterItems: Türkçe/aksansız; özel filterOption", () => {
    expect(filterItems(items, "izmir", "left").map((i) => i.key)).toEqual(["i"]);
    expect(filterItems(items, "canak", "left").map((i) => i.key)).toEqual(["c"]);
    expect(filterItems(items, "DIYAR", "left").map((i) => i.key)).toEqual(["d"]);
    expect(filterItems(items, "  ", "left")).toHaveLength(5);
    expect(filterItems(items, "x", "right", (_q, item, dir) => dir === "right" && item.key === "a").map((i) => i.key)).toEqual(["a"]);
  });

  it("moveKeys: sağa → sona eklenir, devre dışı taşınmaz; sola → çıkar", () => {
    expect(moveKeys(items, ["d"], ["i", "a", "c"], "right")).toEqual({ targetKeys: ["d", "a", "i"], moved: ["a", "i"] });
    expect(moveKeys(items, ["d", "a", "i"], ["a", "i"], "left")).toEqual({ targetKeys: ["d"], moved: ["a", "i"] });
    expect(moveKeys(items, ["c"], ["c"], "left")).toEqual({ targetKeys: ["c"], moved: [] });
  });

  it("selectAllState / toggleAll yalnız görünen etkin öğeler; gizli seçimler korunur", () => {
    const visible = items.slice(0, 3);
    expect(selectAllState(visible, new Set(["a"]))).toEqual({ checked: false, indeterminate: true });
    expect(selectAllState(visible, new Set(["a", "b"]))).toEqual({ checked: true, indeterminate: false });
    expect(toggleAll(visible, ["i"], true).sort((a, b) => a.localeCompare(b))).toEqual(["a", "b", "i"]);
    expect(toggleAll(visible, ["a", "b", "i"], false)).toEqual(["i"]);
  });

  it("rangeSelect: anchor ile tıklanan arası (devre dışı atlanır); anchor yoksa tek öğe", () => {
    expect(rangeSelect(items, [], "a", "i", true).sort((a, b) => a.localeCompare(b))).toEqual(["a", "b", "d", "i"]);
    expect(rangeSelect(items, ["a", "b", "d"], "d", "a", false)).toEqual([]);
    expect(rangeSelect(items, [], null, "b", true)).toEqual(["b"]);
  });

  it("countLabel", () => {
    expect(countLabel(0, 12)).toBe("12 öğe");
    expect(countLabel(3, 12)).toBe("3/12 öğe");
  });
});
