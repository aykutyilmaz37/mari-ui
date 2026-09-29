import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline } from ".";
import type { TimelineItem } from ".";
import { buildItems, resolveSide } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

const items: TimelineItem[] = [
  { title: "09:12", content: "Sipariş alındı" },
  { title: "10:40", content: "Hazırlanıyor", color: "info" },
  { title: "15:05", content: "Kargoya verildi", color: "success" },
];

describe("Timeline utils", () => {
  it("buildItems: pending sona eklenir, reverse'te başa gelir", () => {
    expect(buildItems(items, undefined, false)).toHaveLength(3);
    const withPending = buildItems(items, true, false);
    expect(withPending.at(-1)).toMatchObject({ loading: true, content: "Devam ediyor…" });
    expect(buildItems(items, "Dağıtımda", true)[0]).toMatchObject({ loading: true, content: "Dağıtımda" });
    expect(buildItems(items, false, false)).toHaveLength(3);
  });

  it("resolveSide: start/end sabit, alternate sırayla, placement önceliklidir", () => {
    expect(resolveSide("start", 1, undefined)).toBe("after");
    expect(resolveSide("end", 0, undefined)).toBe("before");
    expect(resolveSide("alternate", 0, undefined)).toBe("after");
    expect(resolveSide("alternate", 1, undefined)).toBe("before");
    expect(resolveSide("alternate", 1, "start")).toBe("after");
  });
});

describe("Timeline", () => {
  it("sıralı liste: <ol> + her olay bir öğe; noktalar görsel", () => {
    const { container } = render(<Timeline aria-label="Sipariş geçmişi" items={items} />);
    const list = screen.getByRole("list", { name: "Sipariş geçmişi" });
    expect(list.tagName).toBe("OL");
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[2]).toHaveTextContent("15:05Kargoya verildi");
    container.querySelectorAll("svg, li > div > span").forEach((el) => expect(el.closest("[aria-hidden]")).not.toBeNull());
  });

  it("pending: 'Devam ediyor…' öğesi, ona giden ray kesikli; reverse ile en üstte", () => {
    const { container, rerender } = render(<Timeline items={items} pending />);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(4);
    expect(rows[3]).toHaveTextContent("Devam ediyor…");
    expect(container.querySelectorAll(".border-dashed")).toHaveLength(1);
    rerender(<Timeline items={items} pending="Dağıtımda" reverse />);
    expect(screen.getAllByRole("listitem")[0]).toHaveTextContent("Dağıtımda");
    expect(screen.getAllByRole("listitem")[3]).toHaveTextContent("Sipariş alındı");
  });

  it("son öğede ray yok", () => {
    render(<Timeline items={items} />);
    const rows = screen.getAllByRole("listitem");
    expect(rows[0]!.querySelector(".border-l-2")).not.toBeNull();
    expect(rows[2]!.querySelector(".border-l-2")).toBeNull();
  });

  it("opposite başlık: geniş ekranda karşı sütunda, dar ekranda içeriğin üstünde (iki kopya, biri gizli)", () => {
    render(<Timeline titlePlacement="opposite" items={items.slice(0, 1)} />);
    const titles = screen.getAllByText("09:12");
    expect(titles).toHaveLength(2);
    expect(titles[0]).toHaveClass("sm:hidden");
    expect(titles[1]!.parentElement).toHaveClass("hidden", "sm:block");
  });

  it("horizontal: yatay liste, kaydırma kabı", () => {
    const { container } = render(<Timeline orientation="horizontal" items={items} />);
    expect(screen.getByRole("list")).toHaveClass("flex");
    expect(container.firstElementChild).toHaveClass("overflow-x-auto");
  });

  it("skeleton: aria-busy, içerik erişilebilirlik ağacından çıkar", () => {
    render(<Timeline aria-label="Geçmiş" skeleton items={items} />);
    expect(screen.getByRole("list", { name: "Geçmiş" })).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Sipariş alındı").closest("[aria-hidden]")).not.toBeNull();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Timeline aria-label="Sipariş" items={items} pending />
        <Timeline aria-label="Sürümler" mode="alternate" titlePlacement="opposite" items={items} />
        <Timeline aria-label="Adımlar" orientation="horizontal" variant="filled" items={items} />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
