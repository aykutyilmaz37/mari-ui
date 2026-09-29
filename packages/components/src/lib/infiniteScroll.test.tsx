import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { List, ListItem } from "../list";
import { Masonry } from "../masonry";

/** jsdom'da IntersectionObserver yok: gözlenenleri tutan ve elle tetiklenen sahte. */
let observers: { cb: IntersectionObserverCallback; targets: Element[] }[] = [];
beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      targets: Element[] = [];
      constructor(public cb: IntersectionObserverCallback) {
        observers.push(this);
      }
      observe(el: Element) {
        this.targets.push(el);
      }
      disconnect() {
        observers = observers.filter((o) => o !== this);
      }
    }
  );
});
afterEach(() => vi.unstubAllGlobals());

const intersect = () =>
  act(() => {
    for (const o of observers) o.cb(o.targets.map((target) => ({ isIntersecting: true, target })) as IntersectionObserverEntry[], o as never);
  });

const rows = ["Bir", "İki", "Üç"];

describe("sonsuz kaydırma", () => {
  it("List: son görünüme girince onLoadMore; yüklenirken gözlem yok ve 'Yükleniyor' duyurulur", () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(<List aria-label="Akış" dataSource={rows} renderItem={(r) => <ListItem>{r}</ListItem>} infinite={{ hasMore: true, onLoadMore }} />);
    intersect();
    expect(onLoadMore).toHaveBeenCalledOnce();
    rerender(<List aria-label="Akış" dataSource={rows} renderItem={(r) => <ListItem>{r}</ListItem>} infinite={{ hasMore: true, loading: true, onLoadMore }} />);
    expect(observers).toHaveLength(0);
    expect(screen.getByText("Yükleniyor…").closest("[role=status]")).not.toBeNull();
  });

  it("hasMore=false: gözlem yok, bitiş mesajı; endMessage özelleştirilir", () => {
    const { rerender } = render(<List aria-label="Akış" dataSource={rows} renderItem={(r) => <ListItem>{r}</ListItem>} infinite={{ hasMore: false, onLoadMore: vi.fn() }} />);
    expect(observers).toHaveLength(0);
    expect(screen.getByText("Hepsi bu kadar").closest("[role=status]")).not.toBeNull();
    rerender(<List aria-label="Akış" dataSource={rows} renderItem={(r) => <ListItem>{r}</ListItem>} infinite={{ hasMore: false, onLoadMore: vi.fn(), endMessage: "Tüm bildirimleri gördünüz" }} />);
    expect(screen.getByText("Tüm bildirimleri gördünüz").closest("[role=status]")).not.toBeNull();
  });

  it("klavye: 'Daha fazla yükle' düğmesi Tab ile erişilir ve yükler", async () => {
    const user = userEvent.setup();
    const onLoadMore = vi.fn();
    render(<Masonry aria-label="Pano" items={rows.map((r) => ({ key: r, children: r }))} infinite={{ hasMore: true, onLoadMore }} />);
    await user.tab();
    expect(screen.getByRole("button", { name: "Daha fazla yükle" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it("skeleton ya da kayıt yokken sonsuz kaydırma çizilmez", () => {
    render(<List aria-label="Akış" skeleton dataSource={[]} renderItem={(r: string) => <ListItem>{r}</ListItem>} infinite={{ hasMore: true, onLoadMore: vi.fn() }} />);
    expect(screen.queryByText("Hepsi bu kadar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Daha fazla yükle" })).not.toBeInTheDocument();
    expect(observers).toHaveLength(0);
  });
});
