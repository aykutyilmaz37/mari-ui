import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BellIcon } from "lucide-react";
import { Badge, StatusBadge } from "./Badge";
import { getA11yViolations } from "../testUtils/a11y";

const bubble = (container: HTMLElement) => container.querySelector("[data-badge]");

describe("Badge", () => {
  it("sayı gösterir; overflowCount üstü N+", () => {
    const { container, rerender } = render(<Badge count={7} />);
    expect(bubble(container)).toHaveTextContent("7");
    rerender(<Badge count={120} />);
    expect(bubble(container)).toHaveTextContent("99+");
    rerender(<Badge count={1200} overflowCount={999} />);
    expect(bubble(container)).toHaveTextContent("999+");
  });

  it("0 varsayılan gizli; showZero ile görünür; dot sayısız nokta", () => {
    const { container, rerender } = render(<Badge count={0} />);
    expect(bubble(container)).toBeNull();
    rerender(<Badge count={0} showZero />);
    expect(bubble(container)).toHaveTextContent("0");
    rerender(<Badge dot />);
    expect(bubble(container)).toBeEmptyDOMElement();
  });

  it("kabarcık görsel (aria-hidden); sayı label ile ekran okuyucuya", () => {
    const { container } = render(
      <Badge count={3} label="3 okunmamış bildirim">
        <button aria-label="Bildirimler">
          <BellIcon aria-hidden />
        </button>
      </Badge>
    );
    expect(bubble(container)).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("3 okunmamış bildirim")).toHaveClass("sr-only");
  });

  it("children varsa köşeye konumlanır, yoksa satır içi", () => {
    const { container, rerender } = render(
      <Badge count={2}>
        <span>Öğe</span>
      </Badge>
    );
    expect(bubble(container)!.className).toContain("absolute");
    rerender(<Badge count={2} />);
    expect(bubble(container)!.className).not.toContain("absolute");
  });

  it("skeleton: kabarcık yer tutucu, label okunmaz", () => {
    const { container } = render(<Badge count={5} label="5 yeni" skeleton />);
    expect(bubble(container)!.className).toContain("text-transparent");
    expect(screen.queryByText("5 yeni")).not.toBeInTheDocument();
  });

  it("StatusBadge: metin her zaman görünür, nokta görsel; processing nabzı hareket azaltmada gizli", () => {
    const { container } = render(
      <StatusBadge color="success" processing>
        Yayında
      </StatusBadge>
    );
    expect(screen.getByText("Yayında")).toBeVisible();
    expect(container.querySelector(".animate-ping")!.className).toContain("motion-reduce:hidden");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <>
        <Badge count={3} label="3 okunmamış bildirim">
          <button aria-label="Bildirimler, 3 okunmamış">
            <BellIcon aria-hidden />
          </button>
        </Badge>
        <Badge count="Yeni" color="primary" />
        <StatusBadge color="warning">Beklemede</StatusBadge>
      </>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
