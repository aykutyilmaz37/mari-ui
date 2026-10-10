import { describe, expect, it } from "vitest";
import { backLabel, containsKey, findActiveKey, isBranch, levelItems } from "../Sidebar/sidebarUtils";

const DATA = [
  { key: "home", title: "Ana Sayfa", route: "/" },
  { key: "shop", title: "Kategoriler", heading: true },
  {
    key: "electronics",
    title: "Elektronik",
    route: "/elektronik",
    children: [
      { key: "computers", title: "Bilgisayar", children: [{ key: "laptop", title: "Laptop", route: "/elektronik/laptop" }] },
      { key: "phones", title: "Telefon", route: "/elektronik/telefon" },
    ],
  },
];

describe("Sidebar", () => {
  it("findActiveKey derinlemesine tam eşleşme; yol yoksa null", () => {
    expect(findActiveKey(DATA, "/elektronik/laptop")).toBe("laptop");
    expect(findActiveKey(DATA, "/elektronik")).toBe("electronics");
    expect(findActiveKey(DATA, "/yok")).toBeNull();
    expect(findActiveKey(DATA, undefined)).toBeNull();
  });

  it("containsKey üst satırı da aktif sayar", () => {
    const electronics = DATA[2]!;
    expect(containsKey(electronics, "laptop")).toBe(true);
    expect(containsKey(electronics, "home")).toBe(false);
    expect(containsKey(electronics, null)).toBe(false);
  });

  it("levelItems: yol boşsa kök, değilse son öğenin çocukları", () => {
    const electronics = DATA[2]!;
    const computers = electronics.children![0]!;
    expect(levelItems(DATA, [])).toBe(DATA);
    expect(levelItems(DATA, [electronics]).map((i) => i.key)).toEqual(["computers", "phones"]);
    expect(levelItems(DATA, [electronics, computers]).map((i) => i.key)).toEqual(["laptop"]);
  });

  it("backLabel bir üst seviyenin başlığı", () => {
    const electronics = DATA[2]!;
    const computers = electronics.children![0]!;
    expect(backLabel([electronics], "Ana Menü")).toBe("Ana Menü");
    expect(backLabel([electronics, computers], "Ana Menü")).toBe("Elektronik");
  });

  it("isBranch: çocuklu ve başlık değil", () => {
    expect(isBranch(DATA[2]!)).toBe(true);
    expect(isBranch(DATA[0]!)).toBe(false);
    expect(isBranch({ key: "h", heading: true, children: [{ key: "x" }] })).toBe(false);
  });
});
