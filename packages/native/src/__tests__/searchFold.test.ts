import { describe, expect, it } from "vitest";
import { foldForSearch } from "../lib/searchFold";

describe("searchFold", () => {
  it("Türkçe harfler ve aksanlar tek karaktere iner, uzunluk korunur", () => {
    expect(foldForSearch("İstanbul")).toBe("istanbul");
    expect(foldForSearch("IĞDIR")).toBe("igdir");
    expect(foldForSearch("Şişli")).toBe("sisli");
    expect(foldForSearch("Çanakkale")).toBe("canakkale");
    expect(foldForSearch("Café")).toBe("cafe");
    for (const w of ["İstanbul", "Iğdır", "Şanlıurfa", "Muğla", "Ödemiş"]) expect(foldForSearch(w)).toHaveLength(w.length);
  });
});
