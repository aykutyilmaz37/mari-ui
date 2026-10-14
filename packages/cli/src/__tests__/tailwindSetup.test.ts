import { describe, expect, it } from "vitest";
import { detectTailwind, tailwindInstructions } from "../tailwindSetup";

describe("detectTailwind", () => {
  it.each([
    [{ devDependencies: { tailwindcss: "^4.1.0" } }, "v4"],
    [{ devDependencies: { "@tailwindcss/vite": "^4.0.0" } }, "v4"],
    [{ dependencies: { tailwindcss: "latest" } }, "v4"],
    [{ devDependencies: { tailwindcss: "~3.4.1" } }, "v3"],
    [{ dependencies: { react: "^19.0.0" } }, "none"],
    [null, "none"],
  ] as const)("%j → %s", (pkg, expected) => {
    expect(detectTailwind(pkg)).toBe(expected);
  });
});

describe("tailwindInstructions", () => {
  it("v4: tailwind.css girişi, styles.css'i ayrıca yüklememe uyarısı", () => {
    const text = tailwindInstructions("v4").join("\n");
    expect(text).toContain('@import "@mari-ui/components/tailwind.css"');
    expect(text).toContain("AYRICA import etmeyin");
  });

  it("v3: desteklenmez + yükseltme aracı; Tailwind yok: derlenmiş styles.css", () => {
    expect(tailwindInstructions("v3").join("\n")).toContain("npx @tailwindcss/upgrade");
    expect(tailwindInstructions("none").join("\n")).toContain('@import "@mari-ui/components/styles.css"');
  });
});
