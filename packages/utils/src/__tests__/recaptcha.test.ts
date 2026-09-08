import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { executeRecaptcha, loadRecaptcha } from "../captcha/recaptcha";
import { __resetScriptLoaderCache } from "../scriptLoader";

describe("loadRecaptcha", () => {
  beforeEach(() => {
    __resetScriptLoaderCache();
    document.head.innerHTML = "";
  });

  it("siteKey'i render parametresine ekleyerek reCAPTCHA script'ini yükler", () => {
    void loadRecaptcha("test-site-key");
    const script = document.querySelector<HTMLScriptElement>('script[id="mari-ui-recaptcha-v3"]');
    expect(script?.src).toBe("https://www.google.com/recaptcha/api.js?render=test-site-key");
  });
});

describe("executeRecaptcha", () => {
  afterEach(() => {
    delete window.grecaptcha;
  });

  it("grecaptcha yüklü değilse açık bir hatayla reddeder", async () => {
    await expect(executeRecaptcha("key", "login")).rejects.toThrow("grecaptcha yüklü değil");
  });

  it("grecaptcha.ready() HAZIR olunca doğru siteKey/action ile execute çağrılır, token döner", async () => {
    const execute = vi.fn().mockResolvedValue("test-token");
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute,
    };

    const token = await executeRecaptcha("test-site-key", "login");
    expect(token).toBe("test-token");
    expect(execute).toHaveBeenCalledWith("test-site-key", { action: "login" });
  });

  it("execute reddederse executeRecaptcha de reddeder", async () => {
    window.grecaptcha = {
      ready: (cb) => cb(),
      execute: vi.fn().mockRejectedValue(new Error("ağ hatası")),
    };
    await expect(executeRecaptcha("key", "login")).rejects.toThrow("ağ hatası");
  });
});
