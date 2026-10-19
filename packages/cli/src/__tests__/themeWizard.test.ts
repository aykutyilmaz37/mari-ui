import { beforeEach, describe, expect, it, vi } from "vitest";

const CANCEL = Symbol("cancel");
const prompts = vi.hoisted(() => ({ select: vi.fn(), text: vi.fn(), cancel: vi.fn() }));

vi.mock("@clack/prompts", () => ({
  select: prompts.select,
  text: prompts.text,
  cancel: prompts.cancel,
  isCancel: (value: unknown) => value === CANCEL,
}));

const { askThemeChoice, WizardCancelled } = await import("../themeWizard");

beforeEach(() => vi.clearAllMocks());

describe("askThemeChoice", () => {
  it("config yoksa 'koru' seçeneği yok, varsayılan seçili gelir", async () => {
    prompts.select.mockResolvedValueOnce("default");
    expect(await askThemeChoice(undefined)).toEqual({ kind: "default" });
    const { options, initialValue } = prompts.select.mock.calls[0]![0];
    expect(initialValue).toBe("default");
    expect(options.some((o: { value: string }) => o.value === "__keep__")).toBe(false);
  });

  it("config varsa ilk seçenek onu korur ve null döner", async () => {
    prompts.select.mockResolvedValueOnce("__keep__");
    expect(await askThemeChoice({ persona: "editorial" })).toBeNull();
    const { options, initialValue } = prompts.select.mock.calls[0]![0];
    expect(initialValue).toBe("__keep__");
    expect(options[0].value).toBe("__keep__");
  });

  it("kişilik seçimi", async () => {
    prompts.select.mockResolvedValueOnce("playful");
    expect(await askThemeChoice(undefined)).toEqual({ kind: "persona", name: "playful" });
  });

  it("özel: renk, köşe ve yoğunluk sorulur; boş vurgu undefined olur", async () => {
    prompts.select.mockResolvedValueOnce("custom").mockResolvedValueOnce("lg").mockResolvedValueOnce("compact");
    prompts.text.mockResolvedValueOnce("#0f766e").mockResolvedValueOnce("");
    expect(await askThemeChoice(undefined)).toEqual({ kind: "custom", primary: "#0f766e", accent: undefined, radius: "lg", spacing: "compact" });
  });

  it("özel: verilen vurgu rengi aynen döner; doğrulamalar hex ister", async () => {
    prompts.select.mockResolvedValueOnce("custom").mockResolvedValueOnce("md").mockResolvedValueOnce("normal");
    prompts.text.mockResolvedValueOnce("#0f766e").mockResolvedValueOnce("#f97316");
    expect(await askThemeChoice(undefined)).toMatchObject({ accent: "#f97316" });

    const [primaryPrompt, accentPrompt] = prompts.text.mock.calls.map((call) => call[0]);
    expect(primaryPrompt.validate("")).toBeTypeOf("string");
    expect(primaryPrompt.validate("kırmızı")).toBeTypeOf("string");
    expect(primaryPrompt.validate("#0f766e")).toBeUndefined();
    expect(accentPrompt.validate("")).toBeUndefined();
    expect(accentPrompt.validate("#zzz")).toBeTypeOf("string");
  });

  it("iptal (Ctrl+C) WizardCancelled fırlatır ve mesaj basar", async () => {
    prompts.select.mockResolvedValueOnce(CANCEL);
    await expect(askThemeChoice(undefined)).rejects.toBeInstanceOf(WizardCancelled);
    expect(prompts.cancel).toHaveBeenCalledOnce();
  });
});
