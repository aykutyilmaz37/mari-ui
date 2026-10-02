import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { ImageGallery, type ImageGalleryItem } from ".";
import { getA11yViolations } from "../testUtils/a11y";

// jsdom yerleşim yapmaz: galeri 400px genişlikte varsayılsın.
const widthDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth");
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 400 });
  vi.spyOn(window, "scrollBy").mockImplementation(() => {});
});
afterAll(() => {
  if (widthDescriptor) Object.defineProperty(HTMLElement.prototype, "clientWidth", widthDescriptor);
  vi.restoreAllMocks();
});

const day = (n: number) => new Date(2026, 8, n, 12);
const items: ImageGalleryItem[] = [
  { key: "a", src: "/a.jpg", alt: "Kaş", date: day(20) },
  { key: "b", src: "/b.jpg", alt: "Efes", date: day(20) },
  { key: "c", src: "/c.jpg", alt: "Ayder", date: day(20) },
  { key: "v", src: "/v.mp4", alt: "Çiçek", date: day(18), type: "video", poster: "/v.jpg", duration: 75 },
  { key: "d", src: "/d.jpg", alt: "Datça", date: new Date(2025, 4, 1) },
];

const cells = () => screen.getAllByRole("gridcell").filter((c) => c.hasAttribute("data-index"));

describe("ImageGallery", () => {
  it("tarihe göre bölümler, video süresi, tek sekme durağı", () => {
    render(<ImageGallery items={items} />);
    const grid = screen.getByRole("grid", { name: "Fotoğraflar" });
    expect(screen.getByRole("heading", { name: /20 Eylül/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /2025/ })).toBeInTheDocument();
    expect(within(grid).getByText("1:15")).toBeInTheDocument();
    expect(cells().filter((c) => c.tabIndex === 0)).toHaveLength(1);
    expect(grid).toHaveAttribute("aria-rowcount");
  });

  it("görünüm: Yıllar başlıkları; başlığa tıklayınca Aylar", async () => {
    const onViewChange = vi.fn();
    render(<ImageGallery items={items} defaultView="year" onViewChange={onViewChange} />);
    expect(screen.getByRole("heading", { name: "2026" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "2025" }));
    expect(onViewChange).toHaveBeenLastCalledWith("month");
    expect(screen.getByRole("heading", { name: "Mayıs 2025" })).toBeInTheDocument();
  });

  it("tarih yoksa düz ızgara, görünüm seçici yok", () => {
    render(<ImageGallery items={items.map(({ date: _date, ...i }) => i)} />);
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.queryByRole("radiogroup", { name: "Görünüm" })).toBeNull();
  });

  it("ok tuşları odağı taşır, Enter görüntüleyiciyi açar", async () => {
    render(<ImageGallery items={items} columns={2} />);
    const first = cells()[0]!;
    act(() => first.focus());
    await userEvent.keyboard("{ArrowRight}");
    expect(document.activeElement).toHaveAttribute("data-index", "1");
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toHaveAttribute("data-index", "2");
    await userEvent.keyboard("{Control>}{End}{/Control}");
    expect(document.activeElement).toHaveAttribute("data-index", "4");
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Datça, 5 \/ 5/)).toBeInTheDocument();
  });

  it("seçim modu: tıklama seçer, Shift aralık, Escape çıkar ve temizler", async () => {
    const onSelectionChange = vi.fn();
    render(<ImageGallery items={items} selectable onSelectionChange={onSelectionChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Seç" }));
    const grid = screen.getByRole("grid");
    expect(grid).toHaveAttribute("aria-multiselectable", "true");
    await userEvent.click(cells()[0]!);
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a"]);
    fireEvent.click(cells()[2]!, { shiftKey: true });
    expect(onSelectionChange).toHaveBeenLastCalledWith(["a", "b", "c"]);
    expect(cells()[1]).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("3 öğe seçildi")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
    act(() => cells()[2]!.focus());
    await userEvent.keyboard("{Escape}");
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
    expect(grid).not.toHaveAttribute("aria-multiselectable");
  });

  it("seçim eylemleri seçili anahtarları alır", async () => {
    render(
      <ImageGallery
        items={items}
        selectable
        defaultSelectionMode
        defaultSelectedKeys={["b"]}
        selectionActions={(keys) => <button type="button">Sil ({keys.length})</button>}
      />
    );
    expect(screen.getByRole("button", { name: "Sil (1)" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tümünü seç" }));
    expect(screen.getByRole("button", { name: "Sil (5)" })).toBeInTheDocument();
  });

  it("sütun düğmeleri", async () => {
    const onColumnsChange = vi.fn();
    render(<ImageGallery items={items} defaultColumns={3} onColumnsChange={onColumnsChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Küçük resimleri büyüt" }));
    expect(onColumnsChange).toHaveBeenLastCalledWith(2);
    expect(screen.getByRole("button", { name: "Küçük resimleri büyüt" })).toBeDisabled();
  });

  it("boş ve iskelet", () => {
    const { unmount } = render(<ImageGallery items={[]} />);
    expect(screen.getByText("Henüz fotoğraf yok")).toBeInTheDocument();
    unmount();
    const { container } = render(<ImageGallery items={items} skeleton columns={4} />);
    expect(screen.queryByRole("grid")).toBeNull();
    expect(container.querySelectorAll(".aspect-square")).toHaveLength(16);
  });

  it("erişilebilirlik ihlali yok (normal ve seçim modu)", async () => {
    const first = render(<ImageGallery items={items} title="Albüm" selectable />);
    expect(await getA11yViolations(first.container)).toEqual([]);
    first.unmount();
    const { container } = render(<ImageGallery items={items} title="Albüm" selectable selectionMode selectedKeys={["a"]} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
