import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { executeHCaptcha, loadHCaptcha } from "../captcha/hcaptcha";
import { __resetScriptLoaderCache } from "../scriptLoader";

describe("loadHCaptcha", () => {
  beforeEach(() => {
    __resetScriptLoaderCache();
    document.head.innerHTML = "";
  });

  it("explicit render modunda hCaptcha script'ini yükler", () => {
    void loadHCaptcha();
    const script = document.querySelector<HTMLScriptElement>('script[id="mari-ui-hcaptcha"]');
    expect(script?.src).toBe("https://js.hcaptcha.com/1/api.js?render=explicit");
  });
});

describe("executeHCaptcha", () => {
  afterEach(() => {
    delete window.hcaptcha;
  });

  it("hcaptcha yüklü değilse açık bir hatayla reddeder", async () => {
    await expect(executeHCaptcha("widget-1")).rejects.toThrow("hcaptcha yüklü değil");
  });

  it("widgetId ile execute çağrılır, response alanı token olarak döner", async () => {
    const execute = vi.fn().mockResolvedValue({ response: "test-token" });
    window.hcaptcha = { execute };

    const token = await executeHCaptcha("widget-1");
    expect(token).toBe("test-token");
    expect(execute).toHaveBeenCalledWith("widget-1", { async: true });
  });
});
