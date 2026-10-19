import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Image, ImageViewer } from ".";
import { getA11yViolations } from "../testUtils/a11y";

const loader = ({ src, width }: { src: string; width: number }) => `https://cdn.x${src}?w=${width}`;

describe("Image", () => {
  it("yüklenene kadar saydam, yüklenince görünür", () => {
    render(<Image src="/a.jpg" alt="Kapadokya" aspectRatio="4/3" />);
    const img = screen.getByRole("img", { name: "Kapadokya" });
    expect(img).toHaveClass("opacity-0");
    expect(img).toHaveAttribute("loading", "lazy");
    fireEvent.load(img);
    expect(img).toHaveClass("opacity-100");
  });

  it("fade={false} opaklık geçişini kaldırır", () => {
    render(<Image src="/a.jpg" alt="Bayrak" fade={false} />);
    expect(screen.getByRole("img", { name: "Bayrak" })).not.toHaveClass("transition-opacity");
  });

  it("varsayılanda geçiş sınıfı vardır", () => {
    render(<Image src="/a.jpg" alt="Foto" />);
    expect(screen.getByRole("img", { name: "Foto" })).toHaveClass("transition-opacity");
  });

  it("kutu oranı yer ayırır", () => {
    const { container } = render(<Image src="/a.jpg" alt="x" width={200} height={100} />);
    const box = container.firstElementChild as HTMLElement;
    expect(box.style.width).toBe("200px");
    expect(box.style.aspectRatio).toBe("200 / 100");
  });

  it("loader: src + srcSet; priority hemen ve yüksek öncelikle yükler", () => {
    render(<Image src="/a.jpg" alt="x" width={300} loader={loader} priority />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.x/a.jpg?w=300");
    expect(img).toHaveAttribute("srcset", "https://cdn.x/a.jpg?w=300 1x, https://cdn.x/a.jpg?w=600 2x");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("placeholder: bulanık ön izleme yüklenince kalkar", () => {
    const { container } = render(<Image src={{ src: "/a.jpg", blurDataURL: "data:image/png;base64,AA" }} alt="x" />);
    expect(container.querySelector('img[src^="data:"]')).not.toBeNull();
    fireEvent.load(screen.getByRole("img", { name: "x" }));
    expect(container.querySelector('img[src^="data:"]')).toBeNull();
  });

  it("hata: varsayılan yedek, URL yedeği", () => {
    const { rerender } = render(<Image src="/yok.jpg" alt="x" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByText("Görsel yüklenemedi")).toBeInTheDocument();
    rerender(<Image src="/yok2.jpg" alt="x" fallback="/yedek.png" />);
    fireEvent.error(screen.getByRole("img"));
    expect(screen.getByRole("img")).toHaveAttribute("src", "/yedek.png");
  });

  it("skeleton: aynı kutu, ekran okuyucudan gizli", () => {
    const { container } = render(<Image src="/a.jpg" alt="x" aspectRatio="16/9" skeleton />);
    const box = container.firstElementChild as HTMLElement;
    expect(box).toHaveAttribute("aria-hidden", "true");
    expect(box.style.aspectRatio).toBe("16/9");
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("preview: düğme görüntüleyiciyi açar, Escape kapatır ve odak düğmeye döner", async () => {
    const user = userEvent.setup();
    render(<Image src="/a.jpg" alt="Kaş" aspectRatio="1" preview />);
    const trigger = screen.getByRole("button", { name: "Kaş — büyüt" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Görsel görüntüleyici" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kapat" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("axe: yüklü, hatalı ve preview", async () => {
    const { container } = render(
      <div>
        <Image src="/a.jpg" alt="Kapadokya" aspectRatio="4/3" />
        <Image src="/b.jpg" alt="Kaş" aspectRatio="1" preview />
      </div>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});

const items = [
  { key: 1, src: "/1.jpg", alt: "Bir" },
  { key: 2, src: "/2.jpg", alt: "İki" },
  { key: 3, src: "/3.mp4", alt: "Üç", type: "video" as const },
];

describe("ImageViewer", () => {
  it("sayaç, oklarla geçiş, uçta durur", async () => {
    const user = userEvent.setup();
    render(<ImageViewer items={items} open onClose={() => {}} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Önceki" })).toBeNull();
    await user.keyboard("{ArrowRight}");
    await act(() => new Promise((r) => setTimeout(r, 300)));
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    await user.keyboard("{ArrowLeft}");
    await act(() => new Promise((r) => setTimeout(r, 300)));
    await user.keyboard("{ArrowLeft}");
    await act(() => new Promise((r) => setTimeout(r, 300)));
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("alt şerit: geçerli öğe işaretli, tıklayınca atlar; video yakınlaştırılamaz", async () => {
    const user = userEvent.setup();
    const { baseElement } = render(<ImageViewer items={items} open onClose={() => {}} />);
    const strip = screen.getByRole("group", { name: "Küçük resimler" });
    expect(strip.querySelector('[aria-current="true"]')).toHaveAccessibleName("Bir");
    await user.click(screen.getByRole("button", { name: "Üç" }));
    expect(screen.getByText("3 / 3")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Yakınlaştır" })).toBeNull();
    expect(baseElement.querySelector("[data-viewer-active] video")).not.toBeNull();
  });

  it("yalnız komşu dilimler çizilir; geçerli olmayanlar gizli", () => {
    const many = Array.from({ length: 10 }, (_, i) => ({ key: i, src: `/${i}.jpg`, alt: `G${i}` }));
    const { baseElement } = render(<ImageViewer items={many} open onClose={() => {}} defaultIndex={5} />);
    const slides = baseElement.querySelectorAll("[data-viewer-slide]");
    expect(slides).toHaveLength(3);
    expect(baseElement.querySelectorAll('[data-viewer-slide][aria-hidden="true"]')).toHaveLength(2);
  });

  it("yakınlaştır düğmeleri sınırlarda devre dışı", async () => {
    const user = userEvent.setup();
    render(<ImageViewer items={items.slice(0, 1)} open onClose={() => {}} />);
    const zoomOut = screen.getByRole("button", { name: "Uzaklaştır" });
    expect(zoomOut).toBeDisabled();
    for (let i = 0; i < 5; i++) await user.click(screen.getByRole("button", { name: "Yakınlaştır" }));
    expect(screen.getByRole("button", { name: "Yakınlaştır" })).toBeDisabled();
    expect(zoomOut).toBeEnabled();
    await user.keyboard("0");
    expect(zoomOut).toBeDisabled();
  });

  it("axe", async () => {
    const { baseElement } = render(<ImageViewer items={items} open onClose={() => {}} />);
    expect(await getA11yViolations(baseElement)).toEqual([]);
  });
});
