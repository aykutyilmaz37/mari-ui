import { describe, expect, it } from "vitest";
import { buildIndex } from "../tree/utils";
import type { TreeNode } from "../tree/types";
import { applyStrategy, initialExpanded, isPickable, removeValue, toggleCheckedValue, valueToChecked } from "./utils";

// tr ─┬ ist ─┬ kad
//     │      └ bes
//     └ ank ── cank
// de ── ber (disabled)
const data: TreeNode[] = [
  {
    key: "tr",
    title: "Türkiye",
    children: [
      { key: "ist", title: "İstanbul", children: [{ key: "kad", title: "Kadıköy" }, { key: "bes", title: "Beşiktaş" }] },
      { key: "ank", title: "Ankara", children: [{ key: "cank", title: "Çankaya" }] },
    ],
  },
  { key: "de", title: "Almanya", children: [{ key: "ber", title: "Berlin", disabled: true }] },
];
const index = buildIndex(data);

describe("TreeSelect utils", () => {
  it("valueToChecked: üst işaretliyse altlar da; strict'te olduğu gibi", () => {
    expect(valueToChecked(["ist"], index, false)).toEqual({ checked: ["ist", "kad", "bes"], halfChecked: ["tr"] });
    expect(valueToChecked(["ist", "yok"], index, true)).toEqual({ checked: ["ist"], halfChecked: [] });
  });

  it("applyStrategy: child yapraklar, parent tam dal tek anahtar, all hepsi", () => {
    const all = valueToChecked(["tr"], index, false).checked;
    expect(applyStrategy(all, index, "child")).toEqual(["kad", "bes", "cank"]);
    expect(applyStrategy(all, index, "parent")).toEqual(["tr"]);
    expect(applyStrategy(all, index, "all")).toEqual(["tr", "ist", "kad", "bes", "ank", "cank"]);
  });

  it("toggleCheckedValue: yaprağı işaretlemek dalı tamamlar → parent stratejisinde üst anahtar olur", () => {
    expect(toggleCheckedValue(["kad"], "bes", index, "parent", false)).toEqual(["ist"]);
    expect(toggleCheckedValue(["ist"], "kad", index, "parent", false)).toEqual(["bes"]);
    expect(toggleCheckedValue(["kad"], "bes", index, "child", false)).toEqual(["kad", "bes"]);
    expect(toggleCheckedValue(["kad"], "kad", index, "child", true)).toEqual([]);
  });

  it("removeValue: checkable'da etiketten kaldırmak altlarıyla kaldırır", () => {
    expect(removeValue(["ist", "cank"], "ist", index, "parent", false, true)).toEqual(["ank"]);
    expect(removeValue(["kad", "cank"], "kad", index, "child", false, false)).toEqual(["cank"]);
  });

  it("initialExpanded: seçililerin ataları ya da hepsi", () => {
    expect(initialExpanded(index, ["kad"], false).sort()).toEqual(["ist", "tr"]);
    expect(initialExpanded(index, [], true)).toEqual(["tr", "ist", "ank", "de"]);
  });

  it("isPickable: devre dışı ve selectable=false", () => {
    expect(isPickable({ key: "x", title: "x", disabled: true }, false)).toBe(false);
    expect(isPickable({ key: "x", title: "x", selectable: false }, false)).toBe(false);
    expect(isPickable({ key: "x", title: "x", selectable: false }, true)).toBe(true);
    expect(isPickable({ key: "x", title: "x", disableCheckbox: true }, true)).toBe(false);
  });
});
