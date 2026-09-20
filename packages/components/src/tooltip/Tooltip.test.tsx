import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tooltip } from "./Tooltip";
import { getA11yViolations } from "../testUtils/a11y";

describe("Tooltip", () => {
  it("odak alınca görünür olur ve trigger'a aria-describedby bağlar (Faz 13.4 — eskiden sadece fareyle açılıyordu)", async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} />);

    const trigger = screen.getByRole("button", { name: "Tetikleyici" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.tab();
    expect(trigger).toHaveFocus();

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("Yardım metni");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);
  });

  it("Escape tuşu görünen tooltip'i kapatır", async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} />);

    await user.tab();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("odaktan çıkınca (blur) kapanır", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} />
        <button type="button">Diğer</button>
      </>
    );

    await user.tab();
    expect(screen.getByRole("tooltip")).toBeInTheDocument();

    await user.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("disabled iken hiç render edilmez", async () => {
    const user = userEvent.setup();
    render(<Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} disabled />);

    await user.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} alwaysVisible />);
    expect(await getA11yViolations(container)).toEqual([]);
  });

  it("trigger sarmalayıcısı self-start taşır (Faz 13.4 — eskiden bir flex konteynerin doğrudan çocuğu olunca stretch ile konteyner genişliğine geriliyordu, bu da balonu ekranın öbür ucuna fırlatıyordu)", () => {
    const { container } = render(<Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} alwaysVisible />);
    const wrapper = container.querySelector("span.inline-block");
    expect(wrapper?.className).toContain("self-start");
  });

  it("varsayılan olarak kompakt boyutlar kullanır (Faz 13.4 kullanıcı bulgusu — ant.design'ın gerçek Tooltip'iyle getComputedStyle kıyası: padding 6px 8px, radius 6px)", () => {
    render(<Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} alwaysVisible />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain("px-2");
    expect(tooltip.className).toContain("py-1.5");
    expect(tooltip.className).toContain("rounded-md");
    expect(tooltip.className).not.toContain("p-2 ");
  });

  it("balon document.body'e portal edilir, kırpılabilir bir ata konteynerin içine değil (Faz 13.4 kullanıcı bulgusu — tablo gibi overflow:auto olan bir kapsayıcının son satırındaki tooltip görmek için scroll gerektiriyordu)", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <div style={{ overflow: "auto", height: 20 }}>
        <Tooltip content="Yardım metni" trigger={<button type="button">Tetikleyici</button>} />
      </div>
    );

    await user.tab();
    const tooltip = screen.getByRole("tooltip");
    expect(container.contains(tooltip)).toBe(false);
    expect(tooltip.parentElement).toBe(document.body);
    expect(tooltip.className).toContain("fixed");
  });
});
