import { personas, type PersonaName, type Theme } from "@mari-ui/tokens";
import type { Manifest } from "./manifest";
import { SKILL_GUIDE, formatMustRules } from "./skillGuide";

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
] as const;

function formatAxes(axes: Record<string, string[]>): string {
  const rows = Object.entries(axes)
    .map(([name, values]) => {
      // Ayrık değişken — iç içe template literal yerine (Faz 8, SonarJS `no-nested-template-literals`).
      const valueList = values.map((v) => `\`${v}\``).join(", ");
      return `| \`${name}\` | ${valueList} |`;
    })
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

/** Terk edilmiş prop yoksa bölüm hiç yazılmaz (boş başlık AI'ı yanıltmasın). */
function formatDeprecatedProps(manifest: Manifest): string {
  const lines: string[] = [];
  for (const c of manifest.components) {
    for (const p of c.props) {
      if (!p.deprecated) continue;
      // Ayrık değişken — iç içe template literal yerine (Faz 8, SonarJS `no-nested-template-literals`).
      const reasonSuffix = p.deprecatedReason ? ` — ${p.deprecatedReason}` : "";
      lines.push(`- \`${c.name}.${p.name}\`${reasonSuffix}`);
    }
  }
  if (lines.length === 0) return "";
  return `\n### Terk edilmiş (deprecated) prop'lar — YENİ KODDA KULLANMAYIN\n\n${lines.join("\n")}\n`;
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
  /** Faz 21 — `mari-ui.config.json` `persona`; yoksa varsayılan kişilik (Yumuşak iris). */
  persona?: PersonaName;
}

const firstFamily = (stack: string) => stack.split(",")[0]?.trim().replace(/^["']|["']$/g, "") ?? stack;

/** Faz 21 — projenin tasarım kişiliği: AI düzeni ve tonu buna göre seçsin. */
function formatPersona(theme: Theme, persona: PersonaName | undefined): string {
  const head = persona
    ? `**${personas[persona].label}** (\`${persona}\`) — ${personas[persona].description}`
    : "**Varsayılan (Yumuşak iris)** — yumuşak mor marka rengi, Geist arayüz + Manrope başlık; genel amaçlı, sakin ve modern.";
  const f = theme.fontFamily;
  return [
    head,
    "",
    `- Fontlar: gövde \`${firstFamily(f.sans)}\`, başlık \`${firstFamily(f.heading ?? f.sans)}\`, kod \`${firstFamily(f.mono)}\``,
    `- Köşe: \`rounded-md\` = ${theme.radius.md} · gölge: ${theme.effects.shadow} · hareket: ${theme.effects.motion}`,
    "- Bu değerler tema CSS değişkenlerinden gelir; kodda tekrar yazma. Kişiliğin karakterini düzen ve içerik diliyle destekle (bkz. Serbest alanlar).",
  ].join("\n");
}

/**
 * Beş aracın da (frontmatter'ları hariç) paylaştığı GÖVDE içerik. Türkçe —
 * bu repo'nun tüm dokümantasyonu (Storybook, plan) Türkçe, aynı dil burada
 * da tutarlı.
 */
export function buildRulesContent({ manifest, theme, persona }: BuildRulesContentOptions): string {
  return `# mari-ui Tasarım Sistemi Kuralları

Bu dosya \`npx @mari-ui/cli sync\` ile OTOMATİK üretilir — \`manifest.json\` (component envanteri + prop sözleşmesi) ve projenin çözümlenmiş temasından türetilir. Elle düzenlemeyin; değişiklik için \`mari-ui.config.json\`ı güncelleyip \`npx @mari-ui/cli sync\`i tekrar çalıştırın.

## Kesin kurallar

Bunlar her zaman geçerli; sapma yok.

${formatMustRules()}

## Serbest alanlar

Kesin kurallar yalnız component kullanımı, token'lar ve erişilebilirlik içindir. Bunların dışı **serbest** — her projeyi aynı iskelete dökme:

- **Sayfa düzeni ve kompozisyon:** grid, sütun sayısı, asimetri, bölüm sırası, yoğunluk ritmi projeye göre seçilir; "başlık + kart grid'i + tablo" tek kalıp değildir.
- **İfade alanları:** hero, arka plan desenleri/degradeleri, illüstrasyon ve görsel alanları, tipografi ağırlıklı büyük başlıklar, giriş hareketleri kalıplaşmaz — token renkleri (\`bg-mari-*\`, \`from-mari-primary-solid/…\`), font değişkenleri (\`font-heading\`) ve \`duration-*\` sınıflarıyla özgürce kurulur.
- **İçerik dili:** metinler, görsel seçimi ve ton projenin hedef kitlesine göre; kişiliğin karakterini taşır.

## Tasarım kişiliği

${formatPersona(theme, persona)}

## Component envanteri

${formatComponentInventory(manifest)}

## Prop API sözleşmesi

mari-ui component'leri beş paylaşılan eksenden konuşur — component'e özel isim UYDURMAYIN:

${formatAxes(manifest.axes)}
${formatDeprecatedProps(manifest)}
## Token listesi (bu projenin ÇÖZÜMLENMİŞ tema değerleri)

${formatThemeTokens(theme)}

## Anti-pattern'ler

${ANTI_PATTERNS.map((p) => `### ${p.title}\n\n- ❌ \`${p.wrong}\`\n- ✅ \`${p.right}\`\n- Neden: ${p.why}`).join("\n\n")}
`;
}

/**
 * Faz 17 — Claude skill'inin (`SKILL.md`) gövdesi: kısa kural içeriği +
 * ayrıntılı sayfa kurma rehberi. Diğer araçların dosyaları kısa kalır
 * (her istekte okunuyorlar); Claude skill'i yalnız ilgili işte yükler.
 */
export function buildSkillContent(options: BuildRulesContentOptions): string {
  return `${buildRulesContent(options)}\n${SKILL_GUIDE}`;
}
