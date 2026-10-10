import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../Input";
import { Textarea } from "../Textarea";
import { getA11yViolations } from "../../testUtils/a11y";
import type { MentionsConfig } from "./types";

const nextFrame = () => act(() => new Promise<void>((r) => requestAnimationFrame(() => r())));

const people: MentionsConfig = {
  options: [
    { value: "ayse", label: "Ayşe Demir", description: "Tasarım" },
    { value: "mehmet", label: "Mehmet Kaya", description: "Mühendislik" },
    { value: "zeynep", label: "Zeynep Arslan", disabled: true },
  ],
};

describe("mentions (Input/Textarea)", () => {
  it("Input: @ yazınca combobox açılır, süzer; ↓ + Enter seçer, onPressEnter tetiklenmez", async () => {
    const user = userEvent.setup();
    const onPressEnter = vi.fn();
    const onSelect = vi.fn();
    render(<Input aria-label="Yorum" mentions={{ ...people, onSelect }} onPressEnter={onPressEnter} />);
    const input = screen.getByRole("combobox", { name: "Yorum" });
    expect(input).toHaveAttribute("aria-expanded", "false");
    await user.type(input, "Selam @");
    await nextFrame();
    expect(input).toHaveAttribute("aria-expanded", "true");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await user.type(input, "meh");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: /Mehmet/ }).id);
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("Selam @mehmet ");
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ value: "mehmet" }), "@");
    expect(onPressEnter).not.toHaveBeenCalled();
    expect(screen.queryByRole("listbox")).toBeNull();
    // Liste kapalıyken Enter normal davranır.
    await user.keyboard("{Enter}");
    expect(onPressEnter).toHaveBeenCalledTimes(1);
  });

  it("devre dışı öneri atlanır; Escape listeyi kapatır ama Escape olayı yukarı kabarmaz", async () => {
    const user = userEvent.setup();
    const outerEscape = vi.fn();
    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div onKeyDown={(e) => e.key === "Escape" && outerEscape()}>
        <Input aria-label="Yorum" mentions={people} />
      </div>
    );
    const input = screen.getByRole("combobox");
    await user.type(input, "@");
    await user.keyboard("{ArrowDown}{ArrowDown}");
    // ayse → mehmet → (zeynep devre dışı) → ayse
    expect(input.getAttribute("aria-activedescendant")).toBe(screen.getByRole("option", { name: /Ayşe/ }).id);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(outerEscape).not.toHaveBeenCalled();
    // Aynı tetikte yeniden açılmaz; yeni bir @ açar.
    await user.type(input, "a");
    expect(screen.queryByRole("listbox")).toBeNull();
    await user.type(input, " @");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("Textarea: kontrollü değer, fareyle seçim; sonuç yoksa mesaj; birden çok tetik", async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [text, setText] = useState("");
      return (
        <Textarea
          aria-label="Not"
          value={text}
          onChange={(e) => setText(e.target.value)}
          mentions={{ prefix: ["@", "#"], options: (p) => (p === "#" ? [{ value: "acil" }, { value: "fatura" }] : people.options as never) }}
        />
      );
    }
    render(<Controlled />);
    const area = screen.getByRole("textbox", { name: "Not" });
    expect(area).toHaveAttribute("aria-autocomplete", "list");
    await user.type(area, "#fat");
    await user.click(screen.getByRole("option", { name: "fatura" }));
    expect(area).toHaveValue("#fatura ");
    await user.type(area, "@xyz");
    expect(screen.getByRole("status")).toHaveTextContent("Sonuç bulunamadı");
  });

  it("onSearch + filterOption=false (sunucu araması); loading göstergesi", async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(<Input aria-label="Ara" mentions={{ options: [{ value: "x" }], filterOption: false, onSearch, loading: true }} />);
    await user.type(screen.getByRole("combobox"), "@ab");
    expect(onSearch).toHaveBeenLastCalledWith("ab", "@");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("Yükleniyor");
  });

  it("e-posta yazarken açılmaz; mentions yoksa ARIA eklenmez", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Input aria-label="E-posta" mentions={people} />
        <Input aria-label="Düz" />
      </>
    );
    await user.type(screen.getByRole("combobox", { name: "E-posta" }), "ayse@mari-ui");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Düz" })).not.toHaveAttribute("aria-autocomplete");
  });

  it("axe: açık liste ihlalsiz", async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Yorum" mentions={people} />);
    await user.type(screen.getByRole("textbox"), "@");
    fireEvent.keyUp(screen.getByRole("textbox"), { key: "End" });
    expect(await getA11yViolations(document.body)).toEqual([]);
  });
});
