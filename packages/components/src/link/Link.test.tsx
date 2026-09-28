import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MariLink, MariLinkProvider } from "./Link";
import { Breadcrumb } from "../breadcrumb";
import { BasicMenu } from "../menu";

/** Next `Link` gibi `href` alan sahte router linki. */
function HrefLink({ href, children, ...rest }: { href: string; children?: React.ReactNode }) {
  return (
    <a data-router="next" href={href} {...rest}>
      {children}
    </a>
  );
}

/** React Router `Link` gibi `to` alan sahte router linki. */
function ToLink({ to, children, ...rest }: { to: string; children?: React.ReactNode }) {
  return (
    <a data-router="rr" href={to} {...rest}>
      {children}
    </a>
  );
}

describe("MariLink", () => {
  it("sağlayıcı yoksa düz <a href> render eder", () => {
    render(<MariLink href="/a">A</MariLink>);
    const link = screen.getByRole("link", { name: "A" });
    expect(link).toHaveAttribute("href", "/a");
    expect(link).not.toHaveAttribute("data-router");
  });

  it("component verilince onu href ile render eder (Next Link)", () => {
    render(
      <MariLinkProvider component={HrefLink}>
        <MariLink href="/a" aria-current="page" className="x">
          A
        </MariLink>
      </MariLinkProvider>
    );
    const link = screen.getByRole("link", { name: "A" });
    expect(link).toHaveAttribute("data-router", "next");
    expect(link).toHaveAttribute("href", "/a");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass("x");
  });

  it("hrefProp='to' ile adresi `to` olarak geçirir (React Router Link)", () => {
    render(
      <MariLinkProvider component={ToLink} hrefProp="to">
        <MariLink href="/b">B</MariLink>
      </MariLinkProvider>
    );
    const link = screen.getByRole("link", { name: "B" });
    expect(link).toHaveAttribute("data-router", "rr");
    expect(link).toHaveAttribute("href", "/b");
  });

  it("Breadcrumb ve BasicMenu linkleri sağlayıcıdaki bileşeni kullanır", () => {
    render(
      <MariLinkProvider component={ToLink} hrefProp="to">
        <Breadcrumb items={[{ title: "Ana Sayfa", href: "/" }, { title: "Ürün" }]} />
        <BasicMenu data={[{ key: "about", title: "Hakkımızda", route: "/about" }]} />
      </MariLinkProvider>
    );
    expect(screen.getByRole("link", { name: "Ana Sayfa" })).toHaveAttribute("data-router", "rr");
    expect(screen.getByRole("link", { name: "Hakkımızda" })).toHaveAttribute("data-router", "rr");
  });
});
