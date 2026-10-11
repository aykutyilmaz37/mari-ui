import { describe, expect, it } from "vitest";
import type { TreeNode } from "../Tree/types";
import { buildIndex, conductCheck, flattenVisible, getParentKeys, isExpandable, searchTree, splitMatch, toggleCheck } from "../Tree/treeUtils";

const data: TreeNode[] = [
  {
    key: "src",
    title: "src",
    children: [
      { key: "app", title: "App.tsx" },
      { key: "lib", title: "lib", children: [{ key: "utils", title: "utils.ts" }, { key: "api", title: "api.ts" }] },
      { key: "legacy", title: "legacy.js", disabled: true },
    ],
  },
  { key: "readme", title: "README.md" },
  { key: "İstanbul", title: "İstanbul Şubesi" },
];

const index = buildIndex(data);
const open = (...keys: string[]) => new Set(keys);

describe("tree/utils", () => {
  it("buildIndex: seviye, ebeveyn, çocuklar; getParentKeys", () => {
    expect(index.get("utils")).toMatchObject({ level: 3, parentKey: "lib" });
    expect(index.get("src")!.childKeys).toEqual(["app", "lib", "legacy"]);
    expect(getParentKeys(index)).toEqual(["src", "lib"]);
  });

  it("isExpandable: çocuklu ya da (tembel modda) isLeaf olmayan çocuksuz", () => {
    expect(isExpandable({ key: "a", title: "a", children: [] }, false)).toBe(false);
    expect(isExpandable({ key: "a", title: "a" }, true)).toBe(true);
    expect(isExpandable({ key: "a", title: "a", isLeaf: true }, true)).toBe(false);
  });

  it("flattenVisible: yalnız açık düğümlerin çocukları; posinset/setsize görünür kardeşlere göre", () => {
    expect(flattenVisible(data, open()).map((v) => v.node.key)).toEqual(["src", "readme", "İstanbul"]);
    const v = flattenVisible(data, open("src", "lib"));
    expect(v.map((x) => x.node.key)).toEqual(["src", "app", "lib", "utils", "api", "legacy", "readme", "İstanbul"]);
    expect(v[3]).toMatchObject({ level: 3, posinset: 1, setsize: 2, parentKey: "lib" });
    const filtered = flattenVisible(data, open("src"), new Set(["src", "lib", "readme"]));
    expect(filtered.map((x) => [x.node.key, x.posinset, x.setsize])).toEqual([["src", 1, 2], ["lib", 1, 1], ["readme", 2, 2]]);
  });

  it("toggleCheck: üst işaretlenince uygun altlar; devre dışı düğüm yayılıma katılmaz", () => {
    const r = toggleCheck([], "src", true, index, false);
    expect(r.checked).toEqual(["src", "app", "lib", "utils", "api"]);
    expect(r.halfChecked).toEqual([]);
  });

  it("toggleCheck: bir yaprak kaldırılınca atalar kısmi olur", () => {
    const all = toggleCheck([], "src", true, index, false).checked;
    const r = toggleCheck(all, "api", false, index, false);
    expect(r.checked).toEqual(["app", "utils"]);
    expect(r.halfChecked).toEqual(["src", "lib"]);
  });

  it("toggleCheck: tüm kardeşler işaretlenince ebeveyn işaretli olur", () => {
    let c = toggleCheck([], "utils", true, index, false);
    expect(c.halfChecked).toEqual(["src", "lib"]);
    c = toggleCheck(c.checked, "api", true, index, false);
    expect(c.checked).toContain("lib");
    expect(c.halfChecked).toEqual(["src"]);
  });

  it("checkStrictly: bağımsız işaret, kısmi yok", () => {
    expect(toggleCheck(["app"], "src", true, index, true)).toEqual({ checked: ["app", "src"], halfChecked: [] });
    expect(toggleCheck(["app", "src"], "src", false, index, true).checked).toEqual(["app"]);
  });

  it("conductCheck: dışarıdan gelen üst işaret alta yayılır", () => {
    expect(conductCheck(["lib"], index)).toEqual({ checked: ["lib", "utils", "api"], halfChecked: ["src"] });
  });

  it("searchTree + splitMatch: Türkçe harf duyarsız; atalar açılır", () => {
    const r = searchTree(index, "UTİL")!;
    expect([...r.matches]).toEqual(["utils"]);
    expect([...r.expand].sort()).toEqual(["lib", "src"]);
    expect(r.visible.has("app")).toBe(false);
    expect([...searchTree(index, "istanbul")!.matches]).toEqual(["İstanbul"]);
    // Latin büyük I: tr küçültmesi "ı" yapardı.
    expect([...searchTree(index, "API")!.matches]).toEqual(["api"]);
    expect(splitMatch("ILIK su", "ılık")).toEqual([
      { text: "ILIK", match: true },
      { text: " su", match: false },
    ]);
    expect(searchTree(index, "  ")).toBeNull();
    expect(splitMatch("İstanbul Şubesi", "şube")).toEqual([
      { text: "İstanbul ", match: false },
      { text: "Şube", match: true },
      { text: "si", match: false },
    ]);
  });

});
