import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Typewriter } from "./Typewriter";
import { getA11yViolations } from "../testUtils/a11y";

const setReducedMotion = (reduce: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: reduce && query.includes("reduce"), media: query })) as typeof window.matchMedia;
};

/** Yazılan (gizli) katmanın metni — imleç boş span, metne katkısı yok. */
const typed = (container: HTMLElement) => container.querySelector("[aria-hidden] > :last-child, span[aria-hidden]:not(.inline-grid)")?.textContent ?? "";

/** Her harf bir sonraki render'da planlanır → zamanı küçük adımlarla ilerlet. */
const tick = (ms: number, step = 10) => {
  for (let t = 0; t < ms; t += step) act(() => vi.advanceTimersByTime(step));
};

describe("Typewriter", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    // @ts-expect-error — testte eklenen matchMedia kaldırılır (jsdom'da yok).
    delete window.matchMedia;
  });

  it("hareket azaltma / matchMedia yok: metin doğrudan tam, imleç yok", () => {
    const { container } = render(<Typewriter text="Merhaba" />);
    expect(screen.getByText("Merhaba")).toBeInTheDocument();
    expect(container.querySelector("[class*='mari-caret-blink']")).toBeNull();
    setReducedMotion(true);
    render(<Typewriter text="Selam" />);
    expect(screen.getByText("Selam")).not.toHaveClass("sr-only");
  });

  it("karakter karakter yazar; ekran okuyucu baştan tam metni okur", () => {
    setReducedMotion(false);
    const { container } = render(<Typewriter text="Merhaba" trigger="mount" typeSpeed={50} />);
    expect(screen.getByText("Merhaba", { selector: ".sr-only" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(0));
    tick(50 * 3 + 5, 5);
    expect(typed(container)).toBe("Mer");
    tick(50 * 10);
    expect(typed(container)).toBe("Merhaba");
    expect(container.querySelector("[class*='mari-caret-blink']")).not.toBeNull();
  });

  it("dizi: yaz → bekle → sil → sıradaki; döngüsüzse son metin kalır ve onComplete çağrılır", () => {
    setReducedMotion(false);
    const onComplete = vi.fn();
    const { container } = render(<Typewriter text={["ab", "cd"]} trigger="mount" typeSpeed={10} deleteSpeed={10} pauseMs={100} onComplete={onComplete} />);
    act(() => vi.advanceTimersByTime(0));
    tick(25, 5);
    expect(typed(container)).toBe("ab");
    tick(100 + 20); // bekleme + iki harf silme
    expect(typed(container)).toBe("");
    tick(100);
    expect(typed(container)).toBe("cd");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText("ab, cd")).toHaveClass("sr-only");
  });

  it("loop: son metinden sonra başa döner, onComplete çağrılmaz", () => {
    setReducedMotion(false);
    const onComplete = vi.fn();
    const { container } = render(<Typewriter text={["a", "b"]} loop trigger="mount" typeSpeed={10} deleteSpeed={10} pauseMs={50} onComplete={onComplete} />);
    tick(400);
    expect(["", "a", "b"]).toContain(typed(container));
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("skeleton: gizli yer tutucu; a11y ihlali yok", async () => {
    const { container, rerender } = render(<Typewriter text="Başlık" skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    rerender(<Typewriter text={["Hızlı", "Tutarlı"]} />);
    vi.useRealTimers();
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
