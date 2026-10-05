import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Splitter, SplitterPanel } from "./Splitter";
import { getA11yViolations } from "../testUtils/a11y";

// jsdom yerleşim yapmaz: kapsayıcı genişliği 1000px kabul edilir.
Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 1000 });
Object.defineProperty(HTMLElement.prototype, "clientHeight", { configurable: true, get: () => 600 });

function setup(onResizeEnd = vi.fn()) {
  render(
    <Splitter onResizeEnd={onResizeEnd}>
      <SplitterPanel defaultSize={300} min={100} collapsible label="Liste">
        Liste
      </SplitterPanel>
      <SplitterPanel label="Detay">Detay</SplitterPanel>
    </Splitter>
  );
  return { handle: screen.getByRole("separator", { name: "Liste panelini yeniden boyutlandır" }), onResizeEnd };
}

describe("Splitter", () => {
  it("tutamaç: separator, değer önceki panelin yüzdesi, panele bağlı", () => {
    const { handle } = setup();
    expect(handle).toHaveAttribute("aria-valuenow", "30");
    expect(handle).toHaveAttribute("aria-valuemin", "10");
    expect(handle).toHaveAttribute("aria-orientation", "vertical");
    expect(document.getElementById(handle.getAttribute("aria-controls")!)).toHaveTextContent("Liste");
  });

  it("klavye: → 16px, Shift 64px, Home en küçük; onResizeEnd oranları verir", () => {
    const { handle, onResizeEnd } = setup();
    fireEvent.keyDown(handle, { key: "ArrowRight" });
    expect(Number(handle.getAttribute("aria-valuenow"))).toBe(32);
    fireEvent.keyDown(handle, { key: "ArrowLeft", shiftKey: true });
    expect(Number(handle.getAttribute("aria-valuenow"))).toBe(25);
    fireEvent.keyDown(handle, { key: "Home" });
    expect(handle).toHaveAttribute("aria-valuenow", "10");
    expect(onResizeEnd).toHaveBeenLastCalledWith([expect.closeTo(0.1, 5), expect.closeTo(0.9, 5)]);
  });

  it("Enter: daraltılabilir paneli kapatır (inert) ve önceki boyutuna açar", () => {
    const { handle } = setup();
    const panel = document.getElementById(handle.getAttribute("aria-controls")!)!;
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(handle).toHaveAttribute("aria-valuenow", "0");
    expect(panel).toHaveAttribute("inert");
    fireEvent.keyDown(handle, { key: "Enter" });
    expect(handle).toHaveAttribute("aria-valuenow", "30");
    expect(panel).not.toHaveAttribute("inert");
  });

  it("daraltma düğmesi adı panelden", () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: "Liste panelini kapat", hidden: true }));
    expect(screen.getByRole("button", { name: "Liste panelini aç", hidden: true })).toBeInTheDocument();
  });

  it("storageKey: düzen kaydedilir ve geri yüklenir", () => {
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v) });
    const { unmount } = render(
      <Splitter storageKey="t-split">
        <SplitterPanel label="A">A</SplitterPanel>
        <SplitterPanel label="B">B</SplitterPanel>
      </Splitter>
    );
    fireEvent.keyDown(screen.getByRole("separator"), { key: "End" });
    unmount();
    render(
      <Splitter storageKey="t-split">
        <SplitterPanel label="A">A</SplitterPanel>
        <SplitterPanel label="B">B</SplitterPanel>
      </Splitter>
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "100");
    vi.unstubAllGlobals();
  });

  it("a11y ihlali yok", async () => {
    const { container } = render(
      <Splitter>
        <SplitterPanel label="A">A</SplitterPanel>
        <SplitterPanel collapsible label="B">B</SplitterPanel>
      </Splitter>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
