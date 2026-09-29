import { useState } from "react";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getA11yViolations } from "../testUtils/a11y";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("color=\"error\" iken otomatik aria-invalid=\"true\" ekler", () => {
    render(<Textarea aria-label="Açıklama" color="error" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  it("name/required/aria-label geçirir", () => {
    render(<Textarea aria-label="Açıklama" name="description" required />);
    const textarea = screen.getByRole("textbox", { name: "Açıklama" });
    expect(textarea).toHaveAttribute("name", "description");
    expect(textarea).toBeRequired();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Textarea aria-label="Mesaj" placeholder="Mesajınız..." />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("rows prop'u ve autoSize yokken elle dikey büyütme", () => {
    render(<Textarea aria-label="Not" rows={5} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toHaveClass("resize-y");
  });

  it("autoSize maxRows'u aşınca yüksekliği kıstırır ve kaydırma açar (eskiden hiç uygulanmıyordu)", () => {
    const scroll = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(400);
    render(<Textarea aria-label="Not" autoSize={{ minRows: 2, maxRows: 4 }} defaultValue={"a\nb\nc\nd\ne\nf"} />);
    const textarea = screen.getByRole("textbox");
    // jsdom: line-height "normal" → 20px varsayılan, textarea dolgusu 2+2px; 4 satır = 84px.
    expect(textarea.style.height).toBe("84px");
    expect(textarea.style.overflowY).toBe("auto");
    expect(textarea).toHaveClass("resize-none");
    scroll.mockRestore();
  });

  it("autoSize minRows'un altına inmez", () => {
    const scroll = vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(10);
    render(<Textarea aria-label="Not" autoSize={{ minRows: 3 }} />);
    expect(screen.getByRole("textbox").style.height).toBe("64px");
    scroll.mockRestore();
  });

  it("maxLength'e ulaşınca sayaç hata renginde", () => {
    render(<Textarea aria-label="Not" maxLength={3} showCount defaultValue="abc" />);
    expect(screen.getByText("3 / 3")).toHaveClass("text-mari-error");
  });

  it("skeleton: gerçek satır sayısı kadar yükseklik, gizli", () => {
    const { container } = render(<Textarea aria-label="Not" rows={4} skeleton />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("textarea")).toHaveAttribute("rows", "4");
  });
});

describe("Textarea temizle", () => {
  it("kontrollü kullanımda temizle onChange'i boş değerle çağırır ve alan boşalır", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("Kargo notu");
      return (
        <Textarea
          aria-label="Not"
          allowClear
          value={value}
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
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});
