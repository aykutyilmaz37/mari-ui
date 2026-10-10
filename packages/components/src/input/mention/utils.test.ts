import { describe, expect, it } from "vitest";
import { filterMentionOptions, findMention, insertMention } from "./utils";

describe("mention utils", () => {
  it("findMention: satır başı/boşluktan sonra tetik; kelime içi @ ve boşluklu sorgu tetiklemez", () => {
    expect(findMention("@ay", 3, ["@"])).toEqual({ prefix: "@", start: 0, query: "ay" });
    expect(findMention("Merhaba @", 9, ["@"])).toEqual({ prefix: "@", start: 8, query: "" });
    expect(findMention("ayse@mari-ui.com", 16, ["@"])).toBeNull();
    expect(findMention("@ayse demir", 11, ["@"])).toBeNull();
    expect(findMention("a\n@me", 5, ["@"])).toEqual({ prefix: "@", start: 2, query: "me" });
  });

  it("findMention: birden çok tetikte imlece en yakın olanı; imleç ortadaysa yalnız öncesi", () => {
    expect(findMention("@ali #sür", 9, ["@", "#"])).toEqual({ prefix: "#", start: 5, query: "sür" });
    expect(findMention("@ali sonra", 3, ["@"])).toEqual({ prefix: "@", start: 0, query: "al" });
  });

  it("insertMention: sorguyu değerle değiştirir, ayraç ekler (zaten varsa eklemez)", () => {
    const m = { prefix: "@", start: 4, query: "ay" };
    expect(insertMention("Selam @ay", { ...m, start: 6 }, 9, "ayse.demir", " ")).toEqual({ text: "Selam @ayse.demir ", caret: 18 });
    expect(insertMention("Hey @ay nasılsın", m, 7, "ayse", " ")).toEqual({ text: "Hey @ayse nasılsın", caret: 10 });
    expect(insertMention("@a", { prefix: "@", start: 0, query: "a" }, 2, "ali", "")).toEqual({ text: "@ali", caret: 4 });
  });

  it("filterMentionOptions: Türkçe/aksansız, searchText; false → süzmez", () => {
    const opts = [{ value: "ayse", label: "Ayşe Demir" }, { value: "cagri", label: "Çağrı Işık", searchText: "cagri isik cagri@mari-ui.com" }];
    expect(filterMentionOptions(opts, "ayşe").map((o) => o.value)).toEqual(["ayse"]);
    expect(filterMentionOptions(opts, "IŞIK").map((o) => o.value)).toEqual(["cagri"]);
    expect(filterMentionOptions(opts, "zzz", false)).toHaveLength(2);
    expect(filterMentionOptions(opts, "")).toHaveLength(2);
  });
});
