import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Paragraph, Text, Title } from "./Typography";
import { getA11yViolations } from "../testUtils/a11y";

describe("Typography", () => {
  it("Title seviyesine göre gerçek başlık etiketi render eder", () => {
    render(<Title level={3}>Siparişler</Title>);
    expect(screen.getByRole("heading", { level: 3, name: "Siparişler" })).toBeInTheDocument();
  });

  it("h1 mobilde bir adım küçük başlar, sm'den itibaren büyür", () => {
    render(<Title>Başlık</Title>);
    expect(screen.getByRole("heading")).toHaveClass("text-2xl", "sm:text-3xl", "text-balance");
  });

  it("ellipsis: true tek satır kısaltır, Text'te satır içi blok olur", () => {
    render(<Text ellipsis>Uzun metin</Text>);
    expect(screen.getByText("Uzun metin")).toHaveClass("truncate", "inline-block", "max-w-full");
  });

  it("ellipsis: { rows } satır sınırı uygular", () => {
    render(<Paragraph ellipsis={{ rows: 3 }}>Uzun paragraf</Paragraph>);
    expect(screen.getByText("Uzun paragraf")).toHaveClass("line-clamp-3");
  });

  it("Title skeleton: başlık etiketi yok, gizli, başlığın satır yüksekliğinde", () => {
    const { container } = render(<Title level={2} skeleton>Başlık</Title>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("text-xl", "leading-tight");
  });

  it("Paragraph skeleton: skeletonRows kadar satır, sonuncusu kısa", () => {
    const { container } = render(<Paragraph skeleton skeletonRows={4} />);
    const lines = container.querySelectorAll("[data-skeleton] > span");
    expect(lines).toHaveLength(4);
    expect(lines[3]!.firstElementChild).toHaveClass("w-3/5");
  });

  it("Text skeleton: metin şeffaf yerinde kalır", () => {
    render(<Text skeleton>Yükleniyor</Text>);
    expect(screen.getByText("Yükleniyor")).toHaveClass("text-transparent");
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = render(
      <div>
        <Title level={2}>Başlık</Title>
        <Paragraph>Paragraf <Text weight="semibold">vurgulu</Text></Paragraph>
      </div>
    );
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
