import { describe, expect, it } from "vitest";
import { buildSections, flattenOptions, foldForSearch, optionText, toggleValue } from "../Select/utils";

const items = [
  { value: "ist", label: "İstanbul" },
  { value: "izm", label: "İzmir" },
  { label: "Ege", options: [{ value: "mug", label: "Muğla" }, { value: "ayd", label: "Aydın" }] },
  { value: "ank", label: "Ankara" },
];

describe("Select", () => {
  it("Türkçe/aksansız arama", () => {
    expect(foldForSearch("IZMIR")).toBe(foldForSearch("İzmir"));
    expect(foldForSearch("Muğla")).toBe("mugla");
    expect(buildSections(items, "mugla")).toEqual([{ key: "group-2", label: "Ege", options: [{ value: "mug", label: "Muğla" }] }]);
  });
  it("başlıksız ardışık seçenekler tek bölüm; grup kendi bölümü", () => {
    const sections = buildSections(items, "");
    expect(sections.map((s) => s.options.length)).toEqual([2, 2, 1]);
    expect(buildSections(items, "zzz")).toEqual([]);
  });
  it("düz liste, metin ve çoklu aç/kapat", () => {
    expect(flattenOptions(items).map((o) => o.value)).toEqual(["ist", "izm", "mug", "ayd", "ank"]);
    expect(optionText({ value: 7 })).toBe("7");
    expect(optionText({ value: 1, label: "x", searchText: "ara" })).toBe("ara");
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
    expect(toggleValue(["a"], "c")).toEqual(["a", "c"]);
  });
});
