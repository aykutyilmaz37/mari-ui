import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Accordion } from ".";
import type { AccordionItem } from ".";
import { toggleKey } from "./utils";
import { getA11yViolations } from "../testUtils/a11y";

afterEach(() => vi.useRealTimers());

const items: AccordionItem[] = [
  { key: "kargo", label: "Kargo ne zaman gelir?", children: <p>1-3 iş günü içinde.</p> },
  { key: "iade", label: "İade nasıl yapılır?", children: <p>14 gün içinde ücretsiz.</p> },
  { key: "fatura", label: "Kurumsal fatura", children: <p>Hesabım › Fatura bilgileri.</p>, disabled: true },
  { key: "odeme", label: "Ödeme seçenekleri", children: <p>Kart, havale, kapıda ödeme.</p> },
];

describe("Accordion", () => {
  it("toggleKey: çoklu modda ekler, tekli modda diğerlerini kapatır", () => {
    expect(toggleKey(["a"], "b", false)).toEqual(["a", "b"]);
    expect(toggleKey(["a"], "b", true)).toEqual(["b"]);
    expect(toggleKey(["a", "b"], "a", false)).toEqual(["b"]);
  });

  it("APG yapısı: başlık > düğme, aria-expanded/aria-controls, region", () => {
    render(<Accordion items={items} defaultActiveKey="kargo" />);
    const trigger = screen.getByRole("button", { name: "Kargo ne zaman gelir?" });
    expect(trigger.closest("h3")).not.toBeNull();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(trigger.getAttribute("aria-controls")!);
    expect(panel).toHaveAttribute("role", "region");
    expect(screen.getByRole("region", { name: "Kargo ne zaman gelir?" })).toHaveTextContent("1-3 iş günü");
  });

  it("tıklayınca açılır/kapanır; kapalı içerik inert; ilk açılışa kadar mount edilmez", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} onChange={onChange} />);
    expect(screen.queryByText("14 gün içinde ücretsiz.")).not.toBeInTheDocument();
    const trigger = screen.getByRole("button", { name: "İade nasıl yapılır?" });
    await user.click(trigger);
    expect(onChange).toHaveBeenLastCalledWith(["iade"]);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    // Kapandıktan sonra da DOM'da ama inert.
    expect(screen.getByText("14 gün içinde ücretsiz.").closest("[inert]")).not.toBeNull();
  });

  it("single: yalnız bir bölüm açık", async () => {
    const user = userEvent.setup();
    render(<Accordion single items={items} defaultActiveKey="kargo" />);
    await user.click(screen.getByRole("button", { name: "İade nasıl yapılır?" }));
    expect(screen.getByRole("button", { name: "Kargo ne zaman gelir?" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "İade nasıl yapılır?" })).toHaveAttribute("aria-expanded", "true");
  });

  it("controlled: activeKey dışarıdan yönetilir", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Accordion items={items} activeKey={["odeme"]} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Kargo ne zaman gelir?" }));
    expect(onChange).toHaveBeenCalledWith(["odeme", "kargo"]);
    expect(screen.getByRole("button", { name: "Kargo ne zaman gelir?" })).toHaveAttribute("aria-expanded", "false");
  });

  it("klavye: ↓/↑ döngülü, Home/End; devre dışı başlık atlanır; Enter açar", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);
    const [kargo, iade, fatura, odeme] = ["Kargo ne zaman gelir?", "İade nasıl yapılır?", "Kurumsal fatura", "Ödeme seçenekleri"].map((name) =>
      screen.getByRole("button", { name })
    );
    expect(fatura).toBeDisabled();
    kargo!.focus();
    await user.keyboard("{ArrowDown}");
    expect(iade).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(odeme).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(kargo).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(odeme).toHaveFocus();
    await user.keyboard("{Home}");
    expect(kargo).toHaveFocus();
    await user.keyboard("{End}");
    expect(odeme).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(odeme).toHaveAttribute("aria-expanded", "true");
  });

  it("extra düğmenin dışında; tıklaması bölümü açmaz", async () => {
    const user = userEvent.setup();
    const onExtra = vi.fn();
    render(<Accordion items={[{ ...items[0]!, extra: <button onClick={onExtra}>Düzenle</button> }]} />);
    const extra = screen.getByRole("button", { name: "Düzenle" });
    expect(screen.getByRole("button", { name: "Kargo ne zaman gelir?" })).not.toContainElement(extra);
    await user.click(extra);
    expect(onExtra).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Kargo ne zaman gelir?" })).toHaveAttribute("aria-expanded", "false");
  });

  it("destroyOnHidden: kapanış animasyonundan sonra içerik kaldırılır", () => {
    vi.useFakeTimers();
    const { rerender } = render(<Accordion items={items} activeKey="kargo" destroyOnHidden />);
    expect(screen.getByText("1-3 iş günü içinde.")).toBeInTheDocument();
    rerender(<Accordion items={items} activeKey={[]} destroyOnHidden />);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByText("1-3 iş günü içinde.")).not.toBeInTheDocument();
  });

  it("headingLevel ve >6 bölümde region yok", () => {
    const many = Array.from({ length: 7 }, (_, i) => ({ key: String(i), label: `Soru ${i}`, children: `Cevap ${i}` }));
    render(<Accordion items={many} headingLevel={2} defaultActiveKey="0" />);
    expect(screen.getByRole("button", { name: "Soru 0" }).closest("h2")).not.toBeNull();
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("skeleton: aria-busy, başlıklar devre dışı ve erişilebilirlik ağacı dışında", () => {
    const { container } = render(<Accordion items={items} skeleton defaultActiveKey="kargo" />);
    expect(container.firstElementChild).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    container.querySelectorAll("button").forEach((b) => expect(b).toBeDisabled());
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Accordion items={items} defaultActiveKey={["kargo"]} />
        <Accordion variant="separated" iconPlacement="end" items={items.slice(0, 2)} defaultActiveKey="iade" />
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
