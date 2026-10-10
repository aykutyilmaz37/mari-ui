import { describe, expect, it } from "vitest";
import { lightTheme } from "@mari-ui/tokens";
import { indicatorColors, railColor, resolveLayout, resolveStepStatus } from "../Steps/utils";

describe("Steps", () => {
  it("durum: elle verilen kazanır, yoksa currentStep'e göre", () => {
    expect(resolveStepStatus({}, 0, 2, "process")).toBe("finish");
    expect(resolveStepStatus({}, 1, 2, "error")).toBe("error");
    expect(resolveStepStatus({}, 2, 2, "process")).toBe("wait");
    expect(resolveStepStatus({ status: "error" }, 0, 3, "process")).toBe("error");
    expect(resolveStepStatus({ step: 10 }, 0, 10, "process")).toBe("process");
  });
  it("yerleşim: dikey > dar > nokta/alt başlık > yanında", () => {
    expect(resolveLayout(true, true, "compact", false, "horizontal")).toBe("vertical");
    expect(resolveLayout(false, true, "compact", false, "horizontal")).toBe("compact");
    expect(resolveLayout(false, true, "vertical", false, "horizontal")).toBe("vertical");
    expect(resolveLayout(false, false, "vertical", true, "horizontal")).toBe("stacked");
    expect(resolveLayout(false, false, "vertical", false, "horizontal")).toBe("inline");
  });
  it("gösterge renkleri: filled geçerli dolu, hata hep error rolü", () => {
    const t = lightTheme;
    expect(indicatorColors(t, "process", "primary", "filled").background).toBe(t.color.primary.solid);
    expect(indicatorColors(t, "error", "primary", "filled").background).toBe(t.color.error.solid);
    expect(indicatorColors(t, "finish", "accent", "filled").background).toBe(t.color.accent.subtle);
    expect(indicatorColors(t, "wait", "primary", "outlined").border).toBe(t.color.canvas.border);
    expect(railColor(t, "finish", "success")).toBe(t.color.success.solid);
    expect(railColor(t, "process", "success")).toBe(t.color.canvas.border);
  });
});
