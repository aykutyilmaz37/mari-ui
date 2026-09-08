import type { Theme } from "@mari-ui/tokens";
import type { Manifest } from "./manifest";

/**
 * Faz 7'nin tek içerik kaynağı: `manifest.json` (component envanteri + prop
 * sözleşmesi + eksenler, hepsi introspect edilmiş) ve çözümlenmiş tema
 * (kullanıcının GERÇEK renkleri — varsayılan veya `mari-ui.config.json`).
 * Bu string BEŞ ARACIN da (Claude/Codex/Cursor/Gemini/Copilot) dosyasına
 * (bazen aynen, bazen bir frontmatter'la sarmalanmış) gider — içerik burada
 * TEK yerde üretilir, her araç için ayrı ayrı yazılmaz.
 *
 * Anti-pattern'ler ve doğru/yanlış örnekler (aşağıdaki `ANTI_PATTERNS`)
 * bilinçli olarak ELLE yazılı: bunlar koddan türetilemeyen, bu projenin
 * GERÇEK geçmişinden gelen dersler (Faz 3'te fiilen bulunup düzeltilen
 * bug'lar — bkz. plan git log'u). Component envanteri/prop sözleşmesi/
 * eksenler ise TAMAMEN `manifest.json`dan gelir, elle tutulmaz.
 */

const ANTI_PATTERNS = [
  {
    title: "Ham hex/px değeri yazma",
    wrong: 'style={{ color: "#2563eb" }}  veya  className="text-[#2563eb]"',
    right: 'color="primary"  (component zaten doğru tonu ve kontrastı kendisi çözer)',
    why: "Ham bir hex, tema stüdyosunda kullanıcı rengi değiştirdiğinde GÜNCELLENMEZ — token her zaman güncel kalır, hardcoded değer asla.",
  },
  {
    title: "Tailwind arbitrary value ile boyut/renk uydurma",
    wrong: 'className="h-[37px] bg-[#f97316]"',
    right: 'size="md" color="accent"',
    why: "mari-ui'ın kendi boyut/renk skalasını atlar; component'in diğer boyutlarıyla tutarsız görünür.",
  },
  {
    title: "Runtime'da Tailwind class string'i üretme",
    wrong: '`bg-mari-${color}-solid`  (template literal ile class ismi kurma)',
    right: "Literal bir Record<ColorRole, string> lookup tablosu kullan (ya da doğrudan mari-ui component'inin kendi color/variant prop'unu kullan)",
    why: 'Tailwind derleme-zamanı statik tarayıcıdır — template literal ile kurulan class asla üretilmez. Bu, projenin kendi geçmişinde Skeleton/Tag/Loading\'i SESSİZCE bozan gerçek bir bug\'dı (plan Faz 3).',
  },
  {
    title: "`dist/` veya `src/` içine derin import",
    wrong: 'import { Button } from "@mari-ui/components/dist/button/Button"',
    right: 'import { Button } from "@mari-ui/components/button"',
    why: "İç yapı bir sürüm sonrasında değişebilir; sadece paketin `exports` haritasındaki subpath'ler kararlıdır.",
  },
  {
    title: "Terk edilmiş prop isimlerini kullanma",
    wrong: 'type="primary"  veya  statu="processing"  veya  status="error"',
    right: 'color="primary"  veya  color="info"  veya  color="error"',
    why: "Bunlar bir sürüm boyunca hâlâ ÇALIŞIR (deprecated alias) ama yeni kod bunları YAZMAMALI — bkz. aşağıdaki bileşen bazlı terk edilmiş prop listesi.",
  },
] as const;

function formatAxes(axes: Record<string, string[]>): string {
  const rows = Object.entries(axes)
    .map(([name, values]) => `| \`${name}\` | ${values.map((v) => `\`${v}\``).join(", ")} |`)
    .join("\n");
  return `| Eksen | Geçerli değerler |\n|---|---|\n${rows}`;
}

function formatComponentInventory(manifest: Manifest): string {
  return manifest.components
    .map((c) => {
      const clientNote = c.requiresUseClient ? ' — `"use client"` gerektirir (sunucu bileşeninde doğrudan render edilemez)' : " — sunucu bileşeni (RSC) olarak da render edilebilir";
      return `- \`${c.name}\` → \`import { ${c.name} } from "${c.importPath}"\`${clientNote}`;
    })
    .join("\n");
}

function formatDeprecatedProps(manifest: Manifest): string {
  const lines: string[] = [];
  for (const c of manifest.components) {
    for (const p of c.props) {
      if (p.deprecated) lines.push(`- \`${c.name}.${p.name}\`${p.deprecatedReason ? ` — ${p.deprecatedReason}` : ""}`);
    }
  }
  return lines.length > 0 ? lines.join("\n") : "(şu an hiç terk edilmiş prop yok)";
}

function formatThemeTokens(theme: Theme): string {
  const roles: Array<keyof typeof theme.color> = ["primary", "accent", "success", "error", "warning", "info", "neutral"];
  const rows = roles
    .filter((r) => r !== "canvas")
    .map((role) => {
      const c = theme.color[role];
      if (!("solid" in c)) return "";
      return `| \`${String(role)}\` | \`${c.solid}\` | \`${c.solidContrast}\` | \`${c.subtle}\` | \`${c.text}\` |`;
    })
    .filter(Boolean)
    .join("\n");
  return `| Rol | solid (dolgu) | solidContrast (dolgu üstü metin) | subtle (yumuşak dolgu) | text (yüzey üstü metin/ikon) |\n|---|---|---|---|---|\n${rows}`;
}

export interface BuildRulesContentOptions {
  manifest: Manifest;
  theme: Theme;
}

/**
 * Beş aracın da (frontmatter'ları hariç) paylaştığı GÖVDE içerik. Türkçe —
 * bu repo'nun tüm dokümantasyonu (Storybook, plan) Türkçe, aynı dil burada
 * da tutarlı.
 */
export function buildRulesContent({ manifest, theme }: BuildRulesContentOptions): string {
  return `# mari-ui Tasarım Sistemi Kuralları

Bu dosya \`npx mari-ui sync\` ile OTOMATİK üretilir — \`manifest.json\` (component envanteri + prop sözleşmesi) ve projenin çözümlenmiş temasından türetilir. Elle düzenlemeyin; değişiklik için \`mari-ui.config.json\`ı güncelleyip \`npx mari-ui sync\`i tekrar çalıştırın.

## Component envanteri

${formatComponentInventory(manifest)}

## Prop API sözleşmesi

mari-ui component'leri beş paylaşılan eksenden konuşur — component'e özel isim UYDURMAYIN:

${formatAxes(manifest.axes)}

### Terk edilmiş (deprecated) prop'lar — YENİ KODDA KULLANMAYIN

${formatDeprecatedProps(manifest)}

## Token listesi (bu projenin ÇÖZÜMLENMİŞ tema değerleri)

${formatThemeTokens(theme)}

## Anti-pattern'ler

${ANTI_PATTERNS.map((p) => `### ${p.title}\n\n- ❌ \`${p.wrong}\`\n- ✅ \`${p.right}\`\n- Neden: ${p.why}`).join("\n\n")}
`;
}
