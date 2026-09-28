/**
 * Faz 7'nin (`@mari-ui/cli`, AI ajan kuralları) temeli: `dist/manifest.json`
 * üretir. ELLE YAZILMAZ — TypeScript Compiler API (ts-morph) ile her
 * component'in KENDİ `src/**\/index.ts`sinden GERÇEKTEN export ettiği
 * component'leri ve bunların prop sözleşmesini introspect eder. Plan'ın
 * kendi ilkesi burada tam olarak uygulanıyor: "kurallar elle yazılmaz, ...
 * manifest.json + çözümlenmiş temadan üretilir" — elle yazılan bir manifest,
 * ilk sürümde eskiyip tam da düzeltmeye çalıştığımız kopukluğu (terk edilmiş
 * prop'ların hâlâ "güncel" sanılması) yeniden üretirdi.
 *
 * Neden `src/index.ts`ten (derlenmiş `dist/*.d.ts`ten DEĞİL): kaynak dosyalar
 * component başına BİRDEN FAZLA export taşıyabiliyor (örn. `input/index.ts`
 * → Input+Textarea+OtpInput+SearchInput, `skeleton/index.ts` → 3 component)
 * — bu yüzden "component" birimi KLASÖR değil, index.ts'in her bir DEĞER
 * export'u. `dist/*.d.ts` de aynı bilgiyi taşır ama JSDoc yorumları
 * (`@deprecated` metni) rollup-plugin-dts'in bundling adımında kaybolabilir;
 * kaynaktan okumak bunu garanti altına alır.
 *
 * "Kendi" prop'ları nasıl ayıklanıyor: bir component'in tam prop tipi
 * (`ForwardRefExoticComponent<...>` veya fonksiyon parametre tipi) React'in
 * kendi `AriaAttributes`/`RefAttributes` gibi devasa miras aldığı
 * özellikleri de içerir — bunlar bir AI ajanının zaten bildiği HTML/ARIA
 * standardı, mari-ui'a özgü değil. Her property'nin DEKLARASYON dosyası
 * `packages/components/src/**` veya `packages/core/src/**` İÇİNDE değilse
 * (yani React'in kendi `.d.ts`sinden miras alınmışsa) manifest'e girmez.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Node, Project, type Type } from "ts-morph";
import { discoverEntries } from "./discoverEntries";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, "..");
const SRC_DIR = join(PACKAGE_ROOT, "src");
const OUT_FILE = join(PACKAGE_ROOT, "dist/manifest.json");

export interface PropInfo {
  name: string;
  type: string;
  optional: boolean;
  deprecated: boolean;
  deprecatedReason?: string;
}

export interface ComponentInfo {
  /** Gerçek export adı — `Button`, `Textarea`, `SkeletonButton`, ... */
  name: string;
  /** Tüketicinin yazacağı gerçek import — `import { X } from "..."`. */
  importPath: string;
  /** `"use client"` direktifi taşıyan bir dosyadan mı geliyor. */
  requiresUseClient: boolean;
  props: PropInfo[];
}

/**
 * `import("/Users/.../packages/core/dist/index").ColorRole` gibi mutlak
 * dosya yolu içeren tip metinlerini `ColorRole`e indirger. Bu OLMADAN
 * manifest, ÜRETEN MAKİNEYE özgü mutlak yollar taşırdı (taşınabilir/
 * reproducible olmazdı — iki geliştiricinin makinesinde farklı çıkardı).
 */
export function cleanTypeText(raw: string): string {
  return raw.replace(/import\([^)]*\)\./g, "");
}

export function isOwnDeclaration(sourceFilePath: string): boolean {
  return sourceFilePath.includes("/packages/components/src/") || sourceFilePath.includes("/packages/core/src/");
}

export function hasUseClientDirective(filePath: string, project: Project): boolean {
  const sourceFile = project.getSourceFile(filePath) ?? project.addSourceFileAtPathIfExists(filePath);
  if (!sourceFile) return false;
  const first = sourceFile.getStatements()[0];
  return Boolean(first && Node.isExpressionStatement(first) && first.getText().replace(/['";]/g, "") === "use client");
}

export function extractProps(paramType: Type, atNode: Node): PropInfo[] {
  const props: PropInfo[] = [];
  for (const symbol of paramType.getProperties()) {
    const decl = symbol.getDeclarations()[0];
    if (!decl) continue;
    if (!isOwnDeclaration(decl.getSourceFile().getFilePath())) continue;

    const type = symbol.getTypeAtLocation(decl);
    const deprecatedTag = symbol.getJsDocTags().find((tag) => tag.getName() === "deprecated");

    props.push({
      name: symbol.getName(),
      type: cleanTypeText(type.getText(atNode)),
      optional: symbol.isOptional(),
      deprecated: Boolean(deprecatedTag),
      ...(deprecatedTag && {
        deprecatedReason: deprecatedTag
          .getText()
          .map((part) => part.text)
          .join("")
          .replace(/\s+/g, " ")
          .trim(),
      }),
    });
  }
  return props;
}

export function resolveComponents(project: Project, folderName: string, indexPath: string): ComponentInfo[] {
  const indexFile = project.addSourceFileAtPath(indexPath);
  const components: ComponentInfo[] = [];

  for (const [exportName, declarations] of indexFile.getExportedDeclarations()) {
    const decl = declarations[0];
    if (!decl) continue;
    // `export type { X }` — bir prop/yardımcı tipi, component değil.
    if (Node.isInterfaceDeclaration(decl) || Node.isTypeAliasDeclaration(decl)) continue;

    const type = decl.getType();
    const callSignatures = type.getCallSignatures();
    // Çağrı imzası yoksa bu bir component değildir (örn. bir sabit/yardımcı fonksiyon dışa aktarılmış olabilir).
    if (callSignatures.length === 0) continue;
    const [firstParam] = callSignatures[0]!.getParameters();
    if (!firstParam) continue; // parametresiz fonksiyon (component değil)

    // Component adı geleneksel olarak büyük harfle başlar (React kuralı) — bu, gerçek yardımcı fonksiyon export'larını (varsa) elemek için ek bir güvenlik.
    if (!/^[A-Z]/.test(exportName)) continue;

    components.push({
      name: exportName,
      importPath: `@mari-ui/components/${folderName}`,
      requiresUseClient: hasUseClientDirective(decl.getSourceFile().getFilePath(), project),
      props: extractProps(firstParam.getTypeAtLocation(decl), decl),
    });
  }

  return components;
}

/**
 * `@mari-ui/core`'un paylaşılan beş ekseninin (`ColorRole`/`Size`/
 * `ExtendedSize`/`Variant`/`Radius`/`Placement`) GEÇERLİ DEĞERLERİNİ
 * `core/src/types/common.ts`ten introspect eder. Bu OLMADAN Faz 7'nin AI
 * kural dosyaları bu listeyi ELLE (ikinci bir kopya olarak) tutardı — tam da
 * "kurallar elle yazılmaz, koddan türetilir" ilkesinin ihlali olurdu.
 * Sadece STRING LITERAL union'ları alınır (`SlotClassNames<T>` gibi generic
 * yardımcı tipler union olmadığı için otomatik elenir).
 */
export function extractAxes(project: Project): Record<string, string[]> {
  const commonTypesPath = resolve(PACKAGE_ROOT, "../core/src/types/common.ts");
  const file = project.addSourceFileAtPathIfExists(commonTypesPath) ?? project.addSourceFileAtPath(commonTypesPath);
  const axes: Record<string, string[]> = {};
  for (const decl of file.getTypeAliases()) {
    if (!decl.isExported()) continue;
    const type = decl.getType();
    if (!type.isUnion()) continue;
    const literals = type.getUnionTypes().filter((t) => t.isStringLiteral());
    if (literals.length !== type.getUnionTypes().length) continue; // saf string-literal union değilse (örn. karışık) atla
    axes[decl.getName()] = literals.map((t) => t.getLiteralValueOrThrow() as string);
  }
  return axes;
}

async function main() {
  const project = new Project({ tsConfigFilePath: join(PACKAGE_ROOT, "tsconfig.json") });
  const entries = discoverEntries(SRC_DIR);

  const components: ComponentInfo[] = [];
  for (const [folderName, indexPath] of Object.entries(entries)) {
    components.push(...resolveComponents(project, folderName, indexPath));
  }
  // Belirlenimci çıktı (dosya sistemi okuma sırası platforma göre değişebilir) — diff'lerin sadece GERÇEK içerik değişince kirlenmesi için.
  components.sort((a, b) => a.name.localeCompare(b.name));

  const manifest = {
    $schema: "https://mari-ui.dev/schema/manifest.schema.json",
    version: 1,
    generatedFrom: "packages/components/src/**/index.ts + packages/core/src/types/common.ts (ts-morph introspection, bkz. scripts/build-manifest.ts)",
    axes: extractAxes(project),
    components,
  };

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  console.log(`[@mari-ui/components] dist/manifest.json üretildi (${components.length} component export'u).`);
}

// Sadece `tsx scripts/build-manifest.ts` ile DOĞRUDAN çalıştırılınca üret —
// bu dosya artık test edilebilir export'lar da taşıyor (`extractProps`,
// `resolveComponents`, ...); bu koruma olmadan `build-manifest.test.ts`nin
// sadece o fonksiyonları import etmesi bile her test çalışmasında
// `dist/manifest.json`ı sessizce yeniden yazardı (fiilen böyle oldu, testte
// fark edildi).
const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
