import { describe, expect, it } from "vitest";
import { bypassesRouter, getLinkAttrs, isExternalHref } from "./linkBehavior";

describe("linkBehavior", () => {
  it("şemalı ve protokol-göreli adresler dış adrestir; yollar değildir", () => {
    for (const href of ["https://a.com", "sftp://a.com", "mailto:a@b.c", "tel:+90", "//cdn.a.com/x"]) expect(isExternalHref(href)).toBe(true);
    for (const href of ["/", "/urunler", "urunler", "#bolum", "?q=1"]) expect(isExternalHref(href)).toBe(false);
  });

  it("target (_self dışı), reloadDocument ve dış adres router'ı atlar", () => {
    expect(bypassesRouter("/a", {})).toBe(false);
    expect(bypassesRouter("/a", { target: "_self" })).toBe(false);
    for (const target of ["_blank", "_parent", "_top", "onizleme"]) expect(bypassesRouter("/a", { target })).toBe(true);
    expect(bypassesRouter("/a", { reloadDocument: true })).toBe(true);
    expect(bypassesRouter("https://a.com", {})).toBe(true);
  });

  it("yalnızca _blank rel=noopener noreferrer alır; _self/boş öznitelik üretmez", () => {
    expect(getLinkAttrs(undefined)).toEqual({});
    expect(getLinkAttrs("_self")).toEqual({});
    expect(getLinkAttrs("_blank")).toEqual({ target: "_blank", rel: "noopener noreferrer" });
    expect(getLinkAttrs("_top")).toEqual({ target: "_top", rel: undefined });
  });
});
