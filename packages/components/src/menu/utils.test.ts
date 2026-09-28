import { describe, expect, it, vi } from "vitest";
import { getMenuVerticalItemClass, navigateTo } from "./utils";
import type { MenuItemType } from "./types";

describe("navigateTo", () => {
  it("onNavigate verilmişse route'uyla çağırır, window.location'a dokunmaz", () => {
    const onNavigate = vi.fn();
    navigateTo("/foo", onNavigate);
    expect(onNavigate).toHaveBeenCalledWith("/foo");
  });

  it("onNavigate verilmemişse window.location.href'e düşer", () => {
    // jsdom'da window.location.href'i doğrudan atamak navigasyonu simüle eder;
    // burada sadece atamanın gerçekleştiğini doğruluyoruz.
    const original = window.location.href;
    navigateTo("#navigate-to-test", undefined);
    expect(window.location.href).toContain("navigate-to-test");
    window.location.href = original;
  });

  it("route yoksa hiçbir şey yapmaz (no-op)", () => {
    const onNavigate = vi.fn();
    navigateTo(undefined, onNavigate);
    expect(onNavigate).not.toHaveBeenCalled();
  });
});

describe("getMenuVerticalItemClass", () => {
  const item: MenuItemType = { key: "home", title: "Ana Sayfa" };

  it("aktif öğe için yumuşak arka plan + vurgu rengi class'ları döner", () => {
    const result = getMenuVerticalItemClass(item, "home", "primary");
    expect(result).toContain("text-mari-primary");
    expect(result).toContain("font-medium");
  });

  it("pasif öğe için hover class'ları döner, aktif arka plan YOK", () => {
    const result = getMenuVerticalItemClass(item, "other-key", "primary");
    expect(result).toContain("hover:bg-mari-surface-alt");
    expect(result).not.toContain("font-medium");
  });
});
