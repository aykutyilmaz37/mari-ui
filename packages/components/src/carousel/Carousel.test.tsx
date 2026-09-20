import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import { Carousel } from "./Carousel";

const slides = [
  <div key="1">Slayt 1</div>,
  <div key="2">Slayt 2</div>,
];

// embla-carousel, jsdom'da hiç bulunmayan `window.matchMedia`/`ResizeObserver`/
// `IntersectionObserver`'ı kullanıyor (breakpoint seçenekleri, slayt boyut/
// görünürlük takibi için) — başka hiçbir component'in ihtiyaç duymadığı,
// sadece Carousel'e özgü jsdom eksikleri.
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ??
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList);

  class ObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  (window as unknown as { ResizeObserver: unknown }).ResizeObserver ??= ObserverStub;
  (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver ??= ObserverStub;
});

describe("Carousel", () => {
  it("arrowsVisibility=\"hover\" iken oklar varsayılan olarak gizli, hover/focus'ta beliren class'ları taşır", () => {
    render(
      <Carousel arrows arrowsVisibility="hover">
        {slides}
      </Carousel>
    );
    const prev = screen.getByRole("button", { name: "Önceki slayt" });
    expect(prev.className).toContain("opacity-0");
    expect(prev.className).toContain("group-hover:opacity-100");
    expect(prev.className).toContain("focus-visible:opacity-100");
  });

  it("arrowsVisibility varsayılanı (\"always\") iken oklar gizleme class'ı taşımaz", () => {
    render(<Carousel arrows>{slides}</Carousel>);
    const prev = screen.getByRole("button", { name: "Önceki slayt" });
    expect(prev.className).not.toContain("opacity-0");
  });

  it("ok butonları artık dairesel bir arka plan taşımaz (kullanıcı isteğiyle çıplak ikona indirildi)", () => {
    render(<Carousel arrows>{slides}</Carousel>);
    const prev = screen.getByRole("button", { name: "Önceki slayt" });
    expect(prev.className).not.toContain("rounded-full");
    expect(prev.className).not.toContain("bg-mari-surface");
  });

  it("arrowsPlacement=\"top-right\" iken oklar tek bir köşede gruplanır (metin ağırlıklı slaytların üzerine binmemesi için)", () => {
    render(
      <Carousel arrows arrowsPlacement="top-right">
        {slides}
      </Carousel>
    );
    const prev = screen.getByRole("button", { name: "Önceki slayt" });
    const next = screen.getByRole("button", { name: "Sonraki slayt" });
    const wrapper = prev.parentElement;
    expect(wrapper).toBe(next.parentElement);
    expect(wrapper?.className).toContain("top-4");
    expect(wrapper?.className).toContain("right-4");
  });

  it("dotsPlacement=\"outside\" iken noktalar carousel'in üzerine binmez, altına akışta render edilir", () => {
    render(
      <Carousel dotsPlacement="outside">
        {slides}
      </Carousel>
    );
    const dot = screen.getByRole("button", { name: "1. slayta git" });
    expect(dot.parentElement?.className).not.toContain("absolute");
    expect(dot.parentElement?.className).toContain("mt-3");
  });
});
