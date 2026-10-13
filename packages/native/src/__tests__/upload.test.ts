import { describe, expect, it } from "vitest";
import { formatBytes, isImageFile, nameFromUri, rejectMessage, splitPicked, validateFile } from "../Upload/uploadUtils";

const MB = 1024 * 1024;

describe("Upload utils", () => {
  it("formatBytes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1,5 KB");
    expect(formatBytes(5 * MB)).toBe("5 MB");
  });

  it("nameFromUri: sorgu atılır, kodlama çözülür", () => {
    expect(nameFromUri("file:///var/mobile/IMG_0042.HEIC")).toBe("IMG_0042.HEIC");
    expect(nameFromUri("https://x.com/a/b/fatura%20ekim.pdf?token=1")).toBe("fatura ekim.pdf");
  });

  it("isImageFile: MIME yoksa uzantıdan", () => {
    expect(isImageFile({ name: "a.pdf", mimeType: "image/png" })).toBe(true);
    expect(isImageFile({ name: "IMG_1.HEIC" })).toBe(true);
    expect(isImageFile({ name: "fatura.pdf" })).toBe(false);
  });

  it("validateFile: accept listesi (joker, MIME, uzantı, jpg/jpeg) ve boyut", () => {
    const photo = { name: "deniz.jpg", size: 2 * MB, mimeType: "image/jpeg" };
    expect(validateFile(photo, "image/*")).toBeNull();
    expect(validateFile(photo, ".jpeg")).toBeNull();
    expect(validateFile(photo, "image/png, .pdf")).toBe("invalid-type");
    expect(validateFile({ name: "IMG.HEIC" }, "image/*")).toBeNull();
    expect(validateFile(photo, undefined, MB)).toBe("size-exceeded");
    expect(validateFile({ name: "x.pdf" }, ".pdf", MB)).toBeNull();
  });

  it("splitPicked: kalan yer kadar kabul, gerisi max-exceeded; geçersizler ayrı", () => {
    const files = [{ name: "a.png" }, { name: "b.txt" }, { name: "c.png" }, { name: "d.png" }];
    const { accepted, rejected } = splitPicked(files, 2, "image/*");
    expect(accepted.map((f) => f.name)).toEqual(["a.png", "c.png"]);
    expect(rejected.map((r) => `${r.file.name}:${r.reason}`)).toEqual(["b.txt:invalid-type", "d.png:max-exceeded"]);
  });

  it("rejectMessage", () => {
    expect(rejectMessage("size-exceeded", "a.png", { max: 3, maxSize: 5 * MB })).toBe("“a.png” çok büyük (en fazla 5 MB).");
    expect(rejectMessage("max-exceeded", "a.png", { max: 3 })).toBe("En fazla 3 dosya eklenebilir.");
  });
});
