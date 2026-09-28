import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Rate } from "./Rate";

describe("Rate", () => {
  it("role=\"slider\" + aria-value* taşır (Faz 13 — eskiden role=\"none\" ile TAMAMEN anlamsızdı)", () => {
    render(<Rate defaultValue={2} count={5} />);
    const slider = screen.getByRole("slider", { name: "Puan" });
    expect(slider).toHaveAttribute("aria-valuenow", "2");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
    expect(slider).toHaveAttribute("aria-valuemax", "5");
  });

  it("Ok Sağ ile değeri artırır, Ok Sol ile azaltır (eskiden dahili hiçbir tuş desteği yoktu)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rate defaultValue={2} count={5} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    slider.focus();

    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith(3);

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("Home ve End uçlara atlar", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rate defaultValue={2} count={5} onChange={onChange} />);
    screen.getByRole("slider").focus();

    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith(5);

    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("disabled iken klavyeyle değişmez", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Rate defaultValue={2} count={5} onChange={onChange} disabled />);
    const slider = screen.getByRole("slider");
    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Rate defaultValue={3} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("className yalnızca köke uygulanır (eskiden her yıldıza da ekleniyordu)", () => {
    render(<Rate className="mt-4" />);
    const root = screen.getByRole("slider");
    expect(root).toHaveClass("mt-4");
    expect(root.querySelectorAll(".mt-4")).toHaveLength(0);
  });

  it("readOnly: odaklanamaz img, ondalık puanı okur ve yıldızı o oranda doldurur", () => {
    const { container } = render(<Rate readOnly value={4.3} />);
    const img = screen.getByRole("img", { name: "Puan: 4,3 / 5" });
    expect(img).not.toHaveAttribute("tabindex");
    const fills = [...container.querySelectorAll<HTMLElement>("span.overflow-hidden")].map((el) => el.style.width);
    expect(fills.at(-1)).toMatch(/^30(\.\d+)?%$/);
  });

  it("skeleton: yıldız sayısı kadar yer tutucu", () => {
    const { container } = render(<Rate count={5} skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll("[data-skeleton]")).toHaveLength(5);
  });

  it("yarım yıldız KIRPILIR, küçülmez: kırpma kutusu %50, içindeki yıldız tam boyutta", () => {
    const { container } = render(<Rate allowHalf defaultValue={2.5} characterSize="1.5rem" />);
    const clips = [...container.querySelectorAll<HTMLElement>("span.overflow-hidden")];
    const half = clips.at(-1)!;
    expect(half.style.width).toBe("50%");
    expect(half).toHaveClass("block");
    expect((half.firstElementChild as HTMLElement).style.width).toBe("1.5rem");
  });

  it("renk verilmezse yıldız puan token'larıyla (sarı dolgu + kontur) çizilir", () => {
    const { container } = render(<Rate defaultValue={1} count={1} />);
    const filled = container.querySelector("span.overflow-hidden svg")!;
    expect(filled.getAttribute("fill")).toBe("var(--mari-color-rating)");
    expect(filled.getAttribute("stroke")).toBe("var(--mari-color-rating-stroke)");
  });

  it("varsayılan palette boş yıldız dolgusuz ve sarı konturlu", () => {
    const { container } = render(<Rate defaultValue={0} count={1} />);
    const empty = container.querySelector("svg")!;
    expect(empty.getAttribute("fill")).toBe("none");
    expect(empty.getAttribute("stroke")).toBe("var(--mari-color-rating-stroke)");
  });

  it("rol rengi verilince boş yıldızın konturu da o renk", () => {
    const { container } = render(<Rate color="success" defaultValue={0} count={1} />);
    const empty = container.querySelector("svg")!;
    expect(empty.getAttribute("fill")).toBe("none");
    expect(empty.getAttribute("stroke")).toBe("currentColor");
    expect(empty.parentElement).toHaveClass("text-mari-success");
  });
});
