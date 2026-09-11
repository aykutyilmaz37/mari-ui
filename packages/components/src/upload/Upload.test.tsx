import { render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { ComponentProps } from "react";
import { ToastProvider } from "../toast";
import { Upload } from "./Upload";

function renderUpload(props: ComponentProps<typeof Upload> = {}) {
  return render(
    <ToastProvider>
      <Upload {...props} />
    </ToastProvider>
  );
}

function makeFile(name: string, type = "image/png") {
  return new File(["içerik"], name, { type });
}

describe("Upload", () => {
  it("max > 1 iken gizli input multiple taşır (eskiden 'gözat' ile HER ZAMAN tek dosya seçilebiliyordu)", () => {
    const { container } = renderUpload({ max: 3 });
    expect(container.querySelector('input[type="file"]')).toHaveAttribute("multiple");
  });

  it("max=1 iken multiple taşımaz", () => {
    const { container } = renderUpload({ max: 1 });
    expect(container.querySelector('input[type="file"]')).not.toHaveAttribute("multiple");
  });

  it("gözat ile birden fazla dosya seçilince hepsi listeye eklenir", async () => {
    const user = userEvent.setup();
    const { container } = renderUpload({ max: 5 });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, [makeFile("a.png"), makeFile("b.png")]);

    await waitFor(() => {
      expect(container.textContent).toContain("a.png");
      expect(container.textContent).toContain("b.png");
    });
  });

  it("fileType uzantıdan accept'e dönüştürülür (\"png\" -> \".png\")", () => {
    const { container } = renderUpload({ fileType: "png" });
    expect(container.querySelector('input[type="file"]')).toHaveAttribute("accept", ".png");
  });
});
