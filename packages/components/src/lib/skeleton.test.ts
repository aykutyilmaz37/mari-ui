import { describe, expect, it } from "vitest";
import { skeletonBoxProps, skeletonFill } from "./skeleton";

describe("skeletonBoxProps", () => {
  it("ekran okuyucudan gizler ve işaretler", () => {
    const props = skeletonBoxProps();
    expect(props["aria-hidden"]).toBe(true);
    expect(props["data-skeleton"]).toBe("");
  });

  it("component'in kendi boyut sınıflarını korur, parıltı dolgusunu ekler", () => {
    const { className } = skeletonBoxProps("h-8 px-3 rounded-md");
    expect(className).toContain("h-8");
    expect(className).toContain("rounded-md");
    expect(className).toContain("animate-[mari-skeleton-shimmer");
    expect(className).toContain("motion-reduce:animate-none");
  });

  it("skeletonFill active=false düz dolgu verir", () => {
    expect(skeletonFill(false)).toBe("bg-mari-border/70");
  });

  it("className'deki metin rengi şeffaflığı ezmez", () => {
    const { className } = skeletonBoxProps("text-mari-foreground");
    expect(className).toContain("text-transparent");
    expect(className).not.toContain("text-mari-foreground");
  });
});
