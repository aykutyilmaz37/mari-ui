import { describe, expect, it } from "vitest";
import { cn } from "../cn";

/*
 * `cn`'in className ezme sözleşmesi: bileşenin sınıfları ÖNCE, tüketicinin
 * `className`'i SONRA gelir; çakışan utility'de sonraki kazanır, çakışmayanlar
 * korunur. Örnekler bileşenlerdeki gerçek kalıplardan (button `sizeClass`,
 * divider boşluğu, skeleton dolgusu, colorVariant renkleri …).
 */
describe("cn — tüketici className'i bileşen sınıflarını ezer", () => {
  it.each([
    // [bileşen, tüketici, beklenen]
    ["h-8 px-3 py-1.5 text-sm gap-2 rounded-md", "px-6", "h-8 py-1.5 text-sm gap-2 rounded-md px-6"],
    ["h-8 px-3 py-1.5 text-sm gap-2 rounded-md", "p-0", "h-8 text-sm gap-2 rounded-md p-0"],
    ["h-8 px-3 py-1.5 text-sm gap-2 rounded-md", "h-12 text-lg", "px-3 py-1.5 gap-2 rounded-md h-12 text-lg"],
    ["h-8 px-3 py-1.5 text-sm gap-2 rounded-md", "rounded-full", "h-8 px-3 py-1.5 text-sm gap-2 rounded-full"],
    ["h-8 px-3 py-1.5 text-sm gap-2 rounded-md", "gap-x-4", "h-8 px-3 py-1.5 text-sm gap-2 rounded-md gap-x-4"],
    ["rounded-md", "rounded-t-none", "rounded-md rounded-t-none"],
    ["rounded-t-md", "rounded-none", "rounded-none"],
    ["w-full items-center my-4", "my-2", "w-full items-center my-2"],
    ["h-full flex-col justify-center mx-3", "mx-0", "h-full flex-col justify-center mx-0"],
    ["my-4", "mt-8", "my-4 mt-8"],
    ["mt-8", "my-4", "my-4"],
    ["px-2", "pl-4", "px-2 pl-4"],
    ["pl-4", "px-2", "px-2"],
    ["w-4 h-4", "size-6", "size-6"],
  ])("boyut/boşluk: %s + %s", (base, consumer, expected) => {
    expect(cn(base, consumer)).toBe(expected);
  });

  it.each([
    ["bg-mari-primary text-mari-primary-solid-contrast hover:bg-mari-primary-hover", "bg-red-500", "text-mari-primary-solid-contrast hover:bg-mari-primary-hover bg-red-500"],
    ["bg-mari-primary text-mari-primary-solid-contrast", "text-white", "bg-mari-primary text-white"],
    ["text-mari-muted text-sm", "text-mari-foreground", "text-sm text-mari-foreground"],
    ["text-mari-muted text-sm", "text-lg", "text-mari-muted text-lg"],
    ["text-sm leading-5", "text-base/7", "text-base/7"],
    ["border border-mari-border", "border-mari-primary", "border border-mari-primary"],
    ["border border-mari-border", "border-2", "border-mari-border border-2"],
    ["border-t border-mari-border", "border-0", "border-mari-border border-0"],
    ["shadow-sm", "shadow-none", "shadow-none"],
    ["ring-2 ring-mari-ring", "ring-0", "ring-mari-ring ring-0"],
    ["focus-visible:outline-2 focus-visible:outline-mari-ring", "focus-visible:outline-none", "focus-visible:outline-2 focus-visible:outline-mari-ring focus-visible:outline-none"],
    ["opacity-50 cursor-not-allowed", "opacity-100 cursor-pointer", "opacity-100 cursor-pointer"],
    ["divide-x divide-mari-border", "divide-mari-primary", "divide-x divide-mari-primary"],
    ["placeholder:text-mari-muted", "placeholder:text-mari-foreground", "placeholder:text-mari-foreground"],
  ])("renk/kenarlık: %s + %s", (base, consumer, expected) => {
    expect(cn(base, consumer)).toBe(expected);
  });

  it.each([
    ["inline-flex max-w-full items-center justify-center whitespace-nowrap", "flex justify-between", "max-w-full items-center whitespace-nowrap flex justify-between"],
    ["flex flex-col-reverse gap-2 sm:flex-row", "flex-col sm:flex-col", "flex gap-2 flex-col sm:flex-col"],
    ["fixed inset-0", "absolute inset-x-4", "inset-0 absolute inset-x-4"],
    ["w-full min-w-0 flex-grow", "w-auto grow-0", "min-w-0 flex-grow w-auto grow-0"],
    ["shrink-0", "shrink", "shrink"],
    ["min-w-0 truncate", "whitespace-normal", "min-w-0 truncate whitespace-normal"],
    ["overflow-hidden", "overflow-x-auto", "overflow-hidden overflow-x-auto"],
    ["grid grid-cols-3", "grid-cols-1 md:grid-cols-2", "grid grid-cols-1 md:grid-cols-2"],
    ["transition-[color,background-color] duration-150", "transition-none duration-300", "transition-none duration-300"],
    ["active:scale-[0.98]", "active:scale-100", "active:scale-100"],
    ["font-medium select-none", "font-bold", "select-none font-bold"],
    ["cursor-pointer", "cursor-default", "cursor-default"],
  ])("yerleşim/etkileşim: %s + %s", (base, consumer, expected) => {
    expect(cn(base, consumer)).toBe(expected);
  });

  it.each([
    // Değiştirici (variant) kapsamı: aynı değiştiricili sınıflar çakışır, farklıları değil.
    ["hover:bg-mari-primary", "bg-red-500", "hover:bg-mari-primary bg-red-500"],
    ["hover:bg-mari-primary", "hover:bg-red-500", "hover:bg-red-500"],
    ["md:px-4 px-2", "md:px-8", "px-2 md:px-8"],
    ["dark:md:hover:bg-black", "md:dark:hover:bg-white", "md:dark:hover:bg-white"],
    ["[&>svg]:size-4", "[&>svg]:size-6", "[&>svg]:size-6"],
    // Keyfi değerler ve önem işareti.
    ["h-[0.7em] rounded-sm", "h-[2rem]", "rounded-sm h-[2rem]"],
    ["w-[calc(100%-2rem)]", "w-1/2", "w-1/2"],
    ["rounded-full aspect-square !px-0", "px-4", "rounded-full aspect-square !px-0 px-4"],
    ["!px-0", "!px-4", "!px-4"],
    ["bg-[#fbf8f3]", "bg-mari-surface", "bg-mari-surface"],
    ["[mask-type:luminance]", "[mask-type:alpha]", "[mask-type:alpha]"],
  ])("değiştirici/keyfi değer: %s + %s", (base, consumer, expected) => {
    expect(cn(base, consumer)).toBe(expected);
  });

  it("skeleton: dolgu ve şeffaf metin tüketici rengini ezer (kendisi sonda)", () => {
    expect(cn("pointer-events-none select-none", "text-mari-foreground px-4", "bg-mari-skeleton animate-pulse", "text-transparent")).toBe(
      "pointer-events-none select-none px-4 bg-mari-skeleton animate-pulse text-transparent"
    );
  });

  it("tanınmayan / özel sınıflar ve koşullu girdiler olduğu gibi kalır", () => {
    const hidden = false as boolean;
    expect(cn("mari-button", hidden && "hidden", null, undefined, { "is-active": true, "is-x": false }, ["z-mari-modal", ["data-foo"]])).toBe(
      "mari-button is-active z-mari-modal data-foo"
    );
    expect(cn("z-mari-modal", "z-50")).toBe("z-mari-modal z-50");
  });

  it("tekrarlanan sınıf tekilleşir, boş girdi boş dizge verir", () => {
    expect(cn("px-2 px-2", "px-2")).toBe("px-2");
    expect(cn()).toBe("");
    expect(cn("", false, "  ")).toBe("");
  });
});
