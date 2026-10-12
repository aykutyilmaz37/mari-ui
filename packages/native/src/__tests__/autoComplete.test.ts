import { describe, expect, it } from "vitest";
import { foldForSearch, getFilteredOption, splitMatch } from "../AutoComplete/autoCompleteUtils";

const CITIES = ["İstanbul", "İzmir", "Iğdır", "Şanlıurfa", "Çanakkale", "Muğla", "Ankara"].map((value, id) => ({ id, value }));

describe("AutoComplete utils", () => {
  it("foldForSearch: Türkçe harfler ve aksanlar, uzunluk korunur", () => {
    expect(foldForSearch("İstanbul")).toBe("istanbul");
    expect(foldForSearch("IĞDIR")).toBe("igdir");
    expect(foldForSearch("Şişli")).toBe("sisli");
    expect(foldForSearch("Café")).toBe("cafe");
    for (const c of CITIES) expect(foldForSearch(c.value)).toHaveLength(c.value.length);
  });

  it("getFilteredOption: aksansız / büyük-küçük harf duyarsız; boş sorgu hepsini döner", () => {
    const names = (q: string) => getFilteredOption(CITIES, q).map((o) => o.value);
    expect(names("istanbul")).toEqual(["İstanbul"]);
    expect(names("sanli")).toEqual(["Şanlıurfa"]);
    expect(names("IGDIR")).toEqual(["Iğdır"]);
    expect(names("ka")).toEqual(["Çanakkale", "Ankara"]);
    expect(names("  ")).toHaveLength(CITIES.length);
  });

  it("splitMatch: özgün harflerle [önce, eşleşen, sonra]", () => {
    expect(splitMatch("Şanlıurfa", "urfa")).toEqual(["Şanlı", "urfa", ""]);
    expect(splitMatch("İstanbul", "ist")).toEqual(["", "İst", "anbul"]);
    expect(splitMatch("Ankara", "zz")).toBeNull();
  });
});
