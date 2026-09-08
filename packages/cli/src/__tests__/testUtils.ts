import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Her testin kendi izole, gerçek dosya sistemi dizini — testler birbirinin dosyasını göremez/bozamaz. */
export function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "mari-ui-cli-test-"));
}

export function cleanupTempDir(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

/** Gerçek `@mari-ui/components` build'inin ürettiği manifest — testler node_modules çözümlemesi kurmadan buna karşı çalışır. */
export const REAL_MANIFEST_PATH = join(__dirname, "../../../components/dist/manifest.json");
