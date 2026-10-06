import { describe, expect, it } from "vitest";
import { toggleKey, toKeys } from "../Accordion/utils";

describe("Accordion", () => {
  it("activeKey her zaman dizi", () => {
    expect(toKeys("a")).toEqual(["a"]);
    expect(toKeys(["a", "b"])).toEqual(["a", "b"]);
    expect(toKeys(undefined)).toBeUndefined();
  });
  it("aç/kapat; tekli modda açılan diğerlerini kapatır", () => {
    expect(toggleKey(["a"], "b", false)).toEqual(["a", "b"]);
    expect(toggleKey(["a"], "b", true)).toEqual(["b"]);
    expect(toggleKey(["a", "b"], "a", false)).toEqual(["b"]);
  });
});
