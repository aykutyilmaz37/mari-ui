import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Tabs } from "./Tabs";
import { TabsList } from "./_components/TabsList";
import { TabsTrigger } from "./_components/TabsTrigger";
import { TabsContent } from "./_components/TabsContent";
import { getA11yViolations } from "../testUtils/a11y";

function setup() {
  return render(
    <Tabs defaultActiveTab="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Sekme 1</TabsTrigger>
        <TabsTrigger value="tab2">Sekme 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Sekme 1 içeriği</TabsContent>
      <TabsContent value="tab2">Sekme 2 içeriği</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("bir sekmeye tıklayınca ilgili panel gösterilir, diğeri kaldırılır", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText("Sekme 1 içeriği")).toBeInTheDocument();
    expect(screen.queryByText("Sekme 2 içeriği")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Sekme 2" }));
    expect(screen.getByText("Sekme 2 içeriği")).toBeInTheDocument();
    expect(screen.queryByText("Sekme 1 içeriği")).not.toBeInTheDocument();
  });

  it("ARIA sekme semantiği taşır (Faz 13.5 kullanıcı bulgusu — eskiden role=\"tab\"/\"tabpanel\" hiç yoktu)", () => {
    setup();
    expect(screen.getByRole("tablist")).toBeInTheDocument();
    const tab1 = screen.getByRole("tab", { name: "Sekme 1" });
    expect(tab1).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Sekme 2" })).toHaveAttribute("aria-selected", "false");

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", tab1.id);
  });

  it("erişilebilirlik ihlali içermez (axe-core)", async () => {
    const { container } = setup();
    expect(await getA11yViolations(container)).toEqual([]);
  });
});
