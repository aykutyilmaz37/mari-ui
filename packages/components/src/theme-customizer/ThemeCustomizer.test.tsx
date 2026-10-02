import React, { useRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { getA11yViolations } from "../testUtils/a11y";

afterEach(() => {
  const html = document.documentElement;
  html.removeAttribute("data-theme");
  html.removeAttribute("data-density");
  html.removeAttribute("style");
});

describe("ThemeCustomizer", () => {
  it("üç bölüm, adlandırılmış gruplar; varsayılanlar seçili", () => {
    render(<ThemeCustomizer />);
    expect(screen.getByRole("radiogroup", { name: "Görünüm" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Vurgu rengi" })).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Yoğunluk" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Sistem" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Varsayılan" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Normal" })).toBeChecked();
  });

  it("seçim onChange ile tam ayarı verir ve <html>'e uygulanır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeCustomizer onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "Koyu" }));
    expect(onChange).toHaveBeenLastCalledWith({ mode: "dark", spacing: "normal" });
    await user.click(screen.getByRole("radio", { name: "Sarı" }));
    await user.click(screen.getByRole("radio", { name: "Sıkı" }));
    expect(onChange).toHaveBeenLastCalledWith({ mode: "dark", primary: "#eab308", spacing: "compact" });
    const html = document.documentElement;
    expect(html).toHaveAttribute("data-theme", "dark");
    expect(html).toHaveAttribute("data-density", "compact");
    expect(html.style.getPropertyValue("--mari-color-primary-solid")).not.toBe("");
  });

  it("'Varsayılan' vurgu rengini kaldırır", async () => {
    const user = userEvent.setup();
    render(<ThemeCustomizer defaultValue={{ mode: "light", primary: "#16a34a" }} />);
    expect(screen.getByRole("radio", { name: "Yeşil" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Varsayılan" }));
    expect(document.documentElement.style.getPropertyValue("--mari-color-primary-solid")).toBe("");
  });

  it("renk örnekleri ok tuşlarıyla gezilir (tek Tab durağı)", async () => {
    const user = userEvent.setup();
    render(<ThemeCustomizer sections={["color"]} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "Varsayılan" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Mavi" })).toBeChecked();
  });

  it("apply={false}: DOM'a dokunmaz", async () => {
    const user = userEvent.setup();
    render(<ThemeCustomizer apply={false} />);
    await user.click(screen.getByRole("radio", { name: "Koyu" }));
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("target: yalnız verilen elemana uygulanır", async () => {
    const user = userEvent.setup();
    function Preview() {
      const ref = useRef<HTMLDivElement>(null);
      return (
        <>
          <div ref={ref} data-testid="preview" />
          <ThemeCustomizer target={ref} sections={["mode"]} />
        </>
      );
    }
    render(<Preview />);
    await user.click(screen.getByRole("radio", { name: "Koyu" }));
    expect(screen.getByTestId("preview")).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement).not.toHaveAttribute("data-theme");
  });

  it("allowCustom: listede olmayan renk özel seçicide gösterilir, örneklerin hiçbiri seçili değil", () => {
    render(<ThemeCustomizer allowCustom sections={["color"]} defaultValue={{ primary: "#7c3aed" }} />);
    expect(screen.getByRole("button", { name: /Özel renk/ })).toBeInTheDocument();
    for (const radio of screen.getAllByRole("radio")) expect(radio).not.toBeChecked();
  });

  it("disabled: seçim yapılamaz", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<ThemeCustomizer disabled onChange={onChange} />);
    await user.click(screen.getByRole("radio", { name: "Koyu" }));
    await user.click(screen.getByRole("radio", { name: "Mavi" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("skeleton: her bölümde yer tutucu, seçilebilir radyo yok", () => {
    const { container } = render(<ThemeCustomizer skeleton allowCustom />);
    expect(screen.queryAllByRole("radio")).toHaveLength(0);
    expect(container.querySelectorAll("[data-skeleton]").length).toBeGreaterThan(8);
  });

  it("a11y ihlali yok", async () => {
    const { container } = render(<ThemeCustomizer allowCustom />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
