import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Input } from "./Input";

describe("Input", () => {
  it("color verilmediyse dinlenme halinde nötr/gri kenarlık taşır, mavi değil (Faz 13 kullanıcı geri bildirimi)", () => {
    render(<Input aria-label="Ad" placeholder="Ad" />);
    const wrapper = screen.getByRole("textbox").parentElement!;
    const classes = wrapper.className.split(" ");
    expect(classes).toContain("border-mari-input");
    expect(classes).not.toContain("border-mari-primary");
    // Odakta rol rengi (açık `-border` tonu 3:1'i geçmiyordu) + yumuşak hale.
    expect(classes).toContain("focus-within:border-mari-primary");
    expect(classes).toContain("focus-within:ring-3");
  });

  it("color=\"error\" AÇIKÇA verildiyse dinlenme halinde de o renk kalıcıdır", () => {
    render(<Input aria-label="E-posta" placeholder="E-posta" color="error" />);
    expect(screen.getByRole("textbox").parentElement!.className.split(" ")).toContain("border-mari-error");
  });

  it("varsayılan olarak aria-invalid taşımaz", () => {
    render(<Input placeholder="Ad" aria-label="Ad" />);
    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-invalid");
  });

  it("color=\"error\" iken otomatik aria-invalid=\"true\" ekler (Faz 13 — doğrulama durumu ekran okuyucuya da bildirilir)", () => {
    render(<Input placeholder="E-posta" aria-label="E-posta" color="error" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("tüketici kendi aria-invalid'ini verirse o kazanır", () => {
    render(<Input placeholder="Ad" aria-label="Ad" color="error" aria-invalid={false} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "false");
  });

  it("name/required/aria-label gibi native attribute'ları geçirir (eskiden Input bunları hiç desteklemiyordu)", () => {
    render(<Input aria-label="Kullanıcı adı" name="username" required />);
    const input = screen.getByRole("textbox", { name: "Kullanıcı adı" });
    expect(input).toHaveAttribute("name", "username");
    expect(input).toBeRequired();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Input aria-label="Arama" placeholder="Ara..." />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("temizle butonu adlandırılmış; temizledikten sonra odak alana döner", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Ad" allowClear defaultValue="Ada" />);
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("kontrollü kullanımda temizle onChange'i boş değerle çağırır ve alan boşalır (eskiden hiçbir şey olmuyordu)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onClear = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("bilgisayar");
      return (
        <Input
          aria-label="Ara"
          allowClear
          value={value}
          onClear={onClear}
          onChange={(e) => {
            onChange(e.target.value);
            setValue(e.target.value);
          }}
        />
      );
    }
    render(<Controlled />);
    await user.click(screen.getByRole("button", { name: "Temizle" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("şifre göster/gizle butonu adlandırılmış ve basılı durumunu bildirir", async () => {
    const user = userEvent.setup();
    const { container } = render(<Input aria-label="Şifre" type="password" />);
    const toggle = screen.getByRole("button", { name: "Şifreyi göster" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Şifreyi gizle" })).toHaveAttribute("aria-pressed", "true");
    expect(container.querySelector("input")).toHaveAttribute("type", "text");
  });

  it("kutunun input dışındaki alanına tıklamak alanı odaklar", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Ara" icon={<svg data-testid="ikon" />} />);
    await user.click(screen.getByTestId("ikon"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("dokunmatikte 44px hedef + iOS zoom'unu önleyen 16px mobil metin", () => {
    render(<Input aria-label="Ad" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("max-sm:text-base");
    expect(input.parentElement!.className).toContain("pointer-coarse:before:-inset-y-1.5");
  });

  it("underlined varyantı shape'ten bağımsız köşesizdir (alt çizgi uçları bükülmesin)", () => {
    render(<Input aria-label="Ad" variant="underlined" shape="pill" />);
    const wrapper = screen.getByRole("textbox").parentElement!;
    expect(wrapper).toHaveClass("rounded-none");
    expect(wrapper).not.toHaveClass("rounded-full");
  });

  it("devre dışı iken pointer-events kapatılmaz, imleç not-allowed", () => {
    render(<Input aria-label="Ad" disabled />);
    const wrapper = screen.getByRole("textbox").parentElement!;
    expect(wrapper).toHaveClass("cursor-not-allowed");
    expect(wrapper).not.toHaveClass("pointer-events-none");
  });

  it("skeleton: input yok, aynı boyutta gizli kutu", () => {
    const { container } = render(<Input aria-label="Ad" size="lg" skeleton />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.firstElementChild).toHaveClass("h-10", "w-full");
  });
});
