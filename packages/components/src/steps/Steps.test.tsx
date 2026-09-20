import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Steps } from "./Steps";
import { getA11yViolations } from "../testUtils/a11y";

const data = [
  { title: "Bilet", step: 1 },
  { title: "Zaman", step: 2 },
  { title: "Onay", step: 3 },
];

describe("Steps", () => {
  it("onChange verildiğinde adımlar klavyeyle tetiklenebilir (Faz 13.5 kullanıcı bulgusu — eskiden role=none bir div, klavyeyle asla erişilemiyordu)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Steps data={data} currentStep={1} onChange={onChange} />);

    const step2 = screen.getByRole("button", { name: /Zaman/ });
    await user.tab();
    await user.tab();
    expect(step2).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("geçerli adım aria-current=\"step\" taşır", () => {
    render(<Steps data={data} currentStep={2} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: /Zaman/ })).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("button", { name: /Bilet/ })).not.toHaveAttribute("aria-current");
  });

  it("onChange verilmediğinde adımlar interaktif değildir ve dahili Geri/İleri butonları render edilmez (Faz 13.5 kullanıcı bulgusu — eskiden cursor-pointer her zaman vardı ama tıklama hiçbir şey yapmıyordu)", () => {
    render(<Steps data={data} currentStep={2} />);
    expect(screen.queryByRole("button", { name: /Zaman/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Geri" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "İleri" })).not.toBeInTheDocument();
  });

  it("son adımdayken \"İleri\" düğmesi \"Tamamla\"ya döner; onComplete verilmezse devre dışı kalır", () => {
    render(<Steps data={data} currentStep={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Tamamla" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "İleri" })).not.toBeInTheDocument();
  });

  it("onComplete verilirse son adımdaki \"Tamamla\" tıklanabilir olur ve çağrılır", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Steps data={data} currentStep={3} onChange={() => {}} onComplete={onComplete} />);
    const completeButton = screen.getByRole("button", { name: "Tamamla" });
    expect(completeButton).toBeEnabled();
    await user.click(completeButton);
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(<Steps data={data} currentStep={2} onChange={() => {}} />);
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
