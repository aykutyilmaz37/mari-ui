import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  runInit: vi.fn(),
  syncAgentRules: vi.fn(),
  runThemeCommand: vi.fn(),
  readConfigIfExists: vi.fn(),
  writeConfig: vi.fn(),
  askThemeChoice: vi.fn(),
  askPlatformChoice: vi.fn(async () => "web"),
}));

vi.mock("../init", () => ({ runInit: mocks.runInit }));
vi.mock("../sync", () => ({ ALL_AGENTS: ["claude", "codex", "cursor", "gemini", "copilot"], syncAgentRules: mocks.syncAgentRules }));
vi.mock("../theme", () => ({ runThemeCommand: mocks.runThemeCommand }));
vi.mock("../configFile", () => ({ readConfigIfExists: mocks.readConfigIfExists, writeConfig: mocks.writeConfig }));
vi.mock("../themeWizard", async () => {
  class WizardCancelled extends Error {}
  return { askThemeChoice: mocks.askThemeChoice, askPlatformChoice: mocks.askPlatformChoice, WizardCancelled };
});

let log: ReturnType<typeof vi.spyOn>;
let error: ReturnType<typeof vi.spyOn>;
let warn: ReturnType<typeof vi.spyOn>;
const originalArgv = process.argv;
const originalTTY = [process.stdin.isTTY, process.stdout.isTTY];

/** `cli.ts` import edildiğinde `main()` çalışır; argv ayarlanıp modül taze yüklenir. */
async function runCli(...args: string[]) {
  process.argv = ["node", "mari-ui", ...args];
  vi.resetModules();
  await import("../cli");
  await new Promise((resolve) => setTimeout(resolve, 0));
  return { out: log.mock.calls.flat().join("\n"), err: error.mock.calls.flat().join("\n"), warned: warn.mock.calls.flat().join("\n") };
}

function setTTY(value: boolean) {
  Object.defineProperty(process.stdin, "isTTY", { value, configurable: true });
  Object.defineProperty(process.stdout, "isTTY", { value, configurable: true });
}

const initResult = {
  platform: "web",
  foreignDependencies: [] as string[],
  addedDependencies: ["@mari-ui/components"],
  configCreated: true,
  configUpdated: false,
  configPath: "/p/mari-ui.config.json",
  ruleFiles: { changed: ["CLAUDE.md"] },
  tailwind: "none",
};

const themeResult = { cssPath: "/p/mari-ui-theme.css", themeTsPath: "/p/mari-ui-theme.ts", stale: false, fontsUrl: undefined as string | undefined };

beforeEach(() => {
  vi.clearAllMocks();
  process.exitCode = undefined;
  log = vi.spyOn(console, "log").mockImplementation(() => {});
  error = vi.spyOn(console, "error").mockImplementation(() => {});
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  // Gerçek çıkış yerine kaydet; kod sonrasında devam eder ama testler yalnız çağrıyı doğrular.
  vi.spyOn(process, "exit").mockImplementation((() => undefined) as never);
  setTTY(false);
  mocks.runInit.mockReturnValue(initResult);
  mocks.runThemeCommand.mockReturnValue(themeResult);
});

afterEach(() => {
  process.argv = originalArgv;
  process.exitCode = undefined;
  Object.defineProperty(process.stdin, "isTTY", { value: originalTTY[0], configurable: true });
  Object.defineProperty(process.stdout, "isTTY", { value: originalTTY[1], configurable: true });
  vi.restoreAllMocks();
});

describe("cli", () => {
  it("yardım: komutsuz çalışınca yardım basar, hata kodu yok", async () => {
    const { out } = await runCli();
    expect(out).toContain("Komutlar:");
    expect(process.exitCode).toBeUndefined();
  });

  it("bilinmeyen komut: yardım + çıkış kodu 1", async () => {
    const { out } = await runCli("nope");
    expect(out).toContain("Komutlar:");
    expect(process.exitCode).toBe(1);
  });

  it.each([["init"], ["sync"], ["theme"]])("%s --help / -h: yardım basar, komut çalışmaz", async (command) => {
    for (const flag of ["--help", "-h"]) {
      const { out } = await runCli(command, flag);
      expect(out).toContain("Komutlar:");
    }
    expect(mocks.runInit).not.toHaveBeenCalled();
    expect(mocks.syncAgentRules).not.toHaveBeenCalled();
    expect(mocks.runThemeCommand).not.toHaveBeenCalled();
    expect(mocks.writeConfig).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
  });

  it("--help komut yerine verilirse yardım basar", async () => {
    const { out } = await runCli("--help");
    expect(out).toContain("Komutlar:");
    expect(process.exitCode).toBeUndefined();
  });

  it.each([["init"], ["sync"], ["theme"]])("%s bilinmeyen bayrak: hata + çıkış 1, hiçbir şey yazılmaz", async (command) => {
    const { err } = await runCli(command, "--bilinmeyen");
    expect(err).toContain("--bilinmeyen");
    expect(mocks.runInit).not.toHaveBeenCalled();
    expect(mocks.syncAgentRules).not.toHaveBeenCalled();
    expect(mocks.runThemeCommand).not.toHaveBeenCalled();
    expect(mocks.writeConfig).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it("init: bayraklar ayrıştırılıp runInit'e geçer, sonuç basılır", async () => {
    const { out } = await runCli("init", "--dir", "/p", "--agents", "claude, bogus", "--manifest", "m.json", "--persona", "editorial");
    expect(mocks.runInit).toHaveBeenCalledWith({ targetDir: "/p", agents: ["claude"], manifestPath: "m.json", theme: { kind: "persona", name: "editorial" } });
    expect(out).toContain("package.json'a eklendi");
    expect(out).toContain("oluşturuldu");
    expect(out).toContain("CLAUDE.md");
  });

  it("init: kural dosyası yazılamadıysa uyarı; config güncellendi/dokunulmadı mesajları", async () => {
    mocks.runInit.mockReturnValueOnce({ ...initResult, addedDependencies: [], configCreated: false, configUpdated: true, ruleFiles: undefined });
    let { out } = await runCli("init", "--yes");
    expect(out).toContain("kişilik güncellendi");
    expect(out).toContain("henüz kurulu değil");

    log.mockClear();
    mocks.runInit.mockReturnValueOnce({ ...initResult, configCreated: false, ruleFiles: { changed: [] } });
    ({ out } = await runCli("init", "-y"));
    expect(out).toContain("dokunulmadı");
    expect(out).toContain("hepsi zaten güncel");
  });

  it("init: TTY'de config yoksa tema sorulur", async () => {
    setTTY(true);
    mocks.readConfigIfExists.mockReturnValue(undefined);
    mocks.askThemeChoice.mockResolvedValueOnce({ kind: "default" });
    await runCli("init");
    expect(mocks.askThemeChoice).toHaveBeenCalledWith(undefined);
    expect(mocks.runInit).toHaveBeenCalledWith(expect.objectContaining({ theme: { kind: "default" } }));
  });

  it("init: geçersiz kişilik çıkış kodu 1 ve hiçbir şey yapmaz", async () => {
    const { warned } = await runCli("init", "--persona", "yok");
    expect(warned).toContain("Bilinmeyen tema");
    expect(process.exitCode).toBe(1);
    expect(mocks.runInit).not.toHaveBeenCalled();
  });

  it("init: geçersiz renk açıklayıcı hata ile çıkar", async () => {
    await runCli("init", "--primary", "kırmızı");
    expect(process.exit).toHaveBeenCalledWith(1);
    expect(error.mock.calls.flat().join("\n")).toContain("✗");
  });

  it("sync: değişiklik var / yok", async () => {
    mocks.syncAgentRules.mockReturnValueOnce({ changed: ["AGENTS.md"] });
    let { out } = await runCli("sync");
    expect(out).toContain("Güncellendi: AGENTS.md");

    log.mockClear();
    mocks.syncAgentRules.mockReturnValueOnce({ changed: [] });
    ({ out } = await runCli("sync"));
    expect(out).toContain("Zaten güncel");
  });

  it("sync --check: güncel ise başarı, bayatsa çıkış 1", async () => {
    mocks.syncAgentRules.mockReturnValueOnce({ changed: [] });
    const { out } = await runCli("sync", "--check");
    expect(out).toContain("güncel");

    mocks.syncAgentRules.mockReturnValueOnce({ changed: ["CLAUDE.md"] });
    await runCli("sync", "--check");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("theme: bayrakla seçim config'e yazılır, çıktılar ve font linki basılır", async () => {
    mocks.readConfigIfExists.mockReturnValue({ scale: { fluid: true } });
    mocks.runThemeCommand.mockReturnValueOnce({ ...themeResult, fontsUrl: "https://fonts.example/css" });
    const { out } = await runCli("theme", "--primary", "#0f766e", "--accent", "#f97316", "--out", "o");
    expect(mocks.writeConfig).toHaveBeenCalledWith(process.cwd(), expect.objectContaining({ color: { primary: "#0f766e", accent: "#f97316" }, scale: { fluid: true } }));
    expect(mocks.runThemeCommand).toHaveBeenCalledWith(expect.objectContaining({ outDir: "o", check: false }));
    expect(out).toContain("mari-ui.config.json güncellendi");
    expect(out).toContain("https://fonts.example/css");
  });

  it("theme: seçim yok ve config yoksa varsayılan tema notu", async () => {
    mocks.readConfigIfExists.mockReturnValue(undefined);
    const { out } = await runCli("theme", "--yes");
    expect(mocks.writeConfig).not.toHaveBeenCalled();
    expect(out).toContain("varsayılan tema");
  });

  it("theme: TTY'de sihirbaz 'koru' derse config'e dokunulmaz", async () => {
    setTTY(true);
    mocks.readConfigIfExists.mockReturnValue({ persona: "minimal" });
    mocks.askThemeChoice.mockResolvedValueOnce(null);
    await runCli("theme");
    expect(mocks.askThemeChoice).toHaveBeenCalledWith({ persona: "minimal" });
    expect(mocks.writeConfig).not.toHaveBeenCalled();
  });

  it("theme --config: sorulmaz, verilen dosya kullanılır", async () => {
    await runCli("theme", "--config", "c.json");
    expect(mocks.readConfigIfExists).not.toHaveBeenCalled();
    expect(mocks.runThemeCommand).toHaveBeenCalledWith(expect.objectContaining({ configPath: "c.json" }));
  });

  it("theme --check: güncel ise başarı, bayatsa çıkış 1", async () => {
    const { out } = await runCli("theme", "--check");
    expect(out).toContain("Tema çıktıları güncel");

    mocks.runThemeCommand.mockReturnValueOnce({ ...themeResult, stale: true });
    await runCli("theme", "--check");
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it("theme: geçersiz kişilik komutu durdurur", async () => {
    await runCli("theme", "--persona");
    expect(process.exitCode).toBe(1);
    expect(mocks.runThemeCommand).not.toHaveBeenCalled();
  });

  it("sihirbaz iptal edilirse çıkış kodu 130", async () => {
    setTTY(true);
    mocks.readConfigIfExists.mockReturnValue(undefined);
    process.argv = ["node", "mari-ui", "theme"];
    vi.resetModules();
    // Yeniden yüklenen modül kendi WizardCancelled sınıfını üretir; iptali o sınıftan fırlat.
    const fresh = await import("../themeWizard");
    mocks.askThemeChoice.mockRejectedValueOnce(new fresh.WizardCancelled());
    await import("../cli");
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(process.exitCode).toBe(130);
  });
});
