/**
 * Storybook CSF3'te `render` obje property'si gerçek bir React function
 * component GİBİ çağrılır — `eslint-plugin-react-hooks` bunu tanımıyor,
 * bilinçli olarak devre dışı.
 *
 * Faz 13.6: örnekler gerçek ürün senaryoları (ayarlar, ürün detayı, görev
 * takibi, kod paneli, ekip ayarları). "Show code" her story'de `storyDoc`'un
 * 2. argümanıyla verilen kopyalanabilir kodu gösterir. Story seviyesinde
 * `parameters` YAZMAYIN — `...storyDoc(...)`'unkini ezer (layout meta'da).
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BellIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CodeIcon,
  CreditCardIcon,
  FileCode2Icon,
  FileTextIcon,
  KeyRoundIcon,
  PaletteIcon,
  PlugIcon,
  PlusIcon,
  ShieldIcon,
  StarIcon,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Tabs } from "./Tabs";
import { TabsList } from "./_components/TabsList";
import { TabsTrigger } from "./_components/TabsTrigger";
import { TabsContent } from "./_components/TabsContent";
import { Button } from "../button";
import { Input } from "../input";
import { Switch } from "../switch";
import { Tag } from "../tag";
import { Avatar } from "../avatar";

const meta: Meta<typeof Tabs> = {
  title: "Navigasyon/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Aynı alanda birbirini dışlayan görünümler arasında geçiş. Compound API: " +
            "`<Tabs><TabsList><TabsTrigger/></TabsList><TabsContent/></Tabs>`. Üç görünüm (`line` / `card` / " +
            "`pills`), üç boyut, dikey yön, ikon ve sayı rozeti. Sığmayan sekmeler kaydırılabilir bir şeride " +
            "dönüşür; aktif sekme her zaman görünür alana kaydırılır.",
          whenToUse: [
            "Aynı bağlama ait, eşit önemde birkaç içerik bölümü (ayarlar, ürün detayı, profil).",
            "Bir listeyi birkaç duruma göre filtrelemek (Tümü / Açık / Kapalı) — `pills` + `count`.",
          ],
          whenNotToUse: [
            "Sıralı adımlar için — Steps kullanın.",
            "Sayfalar arası gezinme için — sekmeler aynı sayfanın bölümleridir; ayrı URL'ler için Menu/Breadcrumb.",
          ],
          a11y:
            "WAI-ARIA Tabs deseni: `role=\"tablist\"`/`tab`/`tabpanel`, `aria-selected`, `aria-controls`/`aria-labelledby` " +
            "(`useId` ile — aynı sayfada iki Tabs çakışmaz). Roving tabindex: Tab tuşu yalnız aktif sekmeye gelir; " +
            "←/→ (dikeyde ↑/↓), Home/End ile gezilir, devre dışı sekmeler atlanır. `activationMode=\"manual\"` ile ok " +
            "tuşu sadece odağı taşır, Enter/Space etkinleştirir. Paneller odaklanabilir (`tabIndex=0`). " +
            "`TabsList`'e `aria-label` verin.",
        }),
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["line", "card", "pills"], description: "Varsayılan: `line`.", table: { category: "Görünüm" } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], description: "Varsayılan: `md`.", table: { category: "Görünüm" } },
    color: { ...colorArgType, description: "Aktif sekme göstergesi/metni. Varsayılan: `primary`." },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"], table: { category: "Görünüm" } },
    fill: { control: "boolean", description: "Sekmeler tüm genişliğe eşit dağılır.", table: { category: "Görünüm" } },
    align: { control: "inline-radio", options: ["start", "center"], table: { category: "Görünüm" } },
    keepMounted: { control: "boolean", description: "Pasif paneller DOM'da (gizli) kalır — form state'i korunur." },
    activationMode: { control: "inline-radio", options: ["automatic", "manual"], description: "Ok tuşuyla odaklanan sekme hemen mi etkinleşsin." },
    defaultActiveTab: { control: "text", description: "Uncontrolled başlangıç sekmesi. Verilmezse ilk etkin sekme." },
    activeTab: { control: false, description: "Controlled aktif sekme." },
    onChange: { table: { category: "Olaylar" } },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

/* ─────────────────────────── yardımcılar ─────────────────────────── */

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-mari-foreground">{label}</span>
      {children}
      {hint && <span className="text-xs text-mari-muted">{hint}</span>}
    </label>
  );
}

/** Avatar'ın `src`'si string ise görsel URL'i sayılır — baş harfler için düğüm verilir. */
function Initials({ text }: { text: string }) {
  return (
    <span aria-hidden className="flex size-full items-center justify-center bg-mari-primary-subtle text-xs font-semibold text-mari-primary-subtle-contrast">
      {text}
    </span>
  );
}

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-mari-foreground">{title}</p>
        <p className="text-sm text-mari-muted">{description}</p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

/* ─────────────────────────── 1. Hesap ayarları ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { variant: "line", size: "md", color: "primary", orientation: "horizontal", fill: false, align: "start", defaultActiveTab: "week" },
  render: (args) => (
    <Tabs {...args}>
      {simpleTabs}
      <TabsContent value="day">Bugünün raporu</TabsContent>
      <TabsContent value="week">Bu haftanın raporu</TabsContent>
      <TabsContent value="month">Bu ayın raporu</TabsContent>
    </Tabs>
  ),
};

export const AccountSettings: Story = {
  name: "Hesap Ayarları",
  ...storyDoc(
    "İkonlu çizgili sekmeler, sekme çubuğunun sağında `extra` (kaydet düğmesi) ve `keepMounted` — sekmeler " +
      "arasında gezinince yazdıklarınız kaybolmaz. Dar ekranda sekmeler kaydırılabilir şeride dönüşür (kenarlar " +
      "solar), aktif sekme görünür alana kaydırılır.",
    `
<Tabs defaultActiveTab="profile" keepMounted>
  <TabsList aria-label="Hesap ayarları" extra={<Button size="sm">Kaydet</Button>}>
    <TabsTrigger value="profile" icon={<UserIcon />}>Profil</TabsTrigger>
    <TabsTrigger value="notifications" icon={<BellIcon />}>Bildirimler</TabsTrigger>
    <TabsTrigger value="security" icon={<ShieldIcon />}>Güvenlik</TabsTrigger>
    <TabsTrigger value="billing" icon={<CreditCardIcon />}>Faturalama</TabsTrigger>
    <TabsTrigger value="integrations" icon={<PlugIcon />}>Entegrasyonlar</TabsTrigger>
  </TabsList>
  <TabsContent value="profile">…</TabsContent>
  <TabsContent value="notifications">…</TabsContent>
  …
</Tabs>`
  ),
  render: () => {
    const [prefs, setPrefs] = useState({ comments: true, mentions: true, weekly: false, product: false });
    const toggle = (key: keyof typeof prefs) => (value: boolean) => setPrefs((p) => ({ ...p, [key]: value }));

    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-mari-border bg-mari-surface p-5 sm:p-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-mari-foreground">Hesap ayarları</h3>
          <p className="text-sm text-mari-muted">Profilinizi, bildirimlerinizi ve güvenlik tercihlerinizi yönetin.</p>
        </div>
        <Tabs defaultActiveTab="profile" keepMounted>
          {/* Mobilde "Kaydet" sekme şeridinden çıkıp formun altına iner — şerit sekmelere kalsın. */}
          <TabsList
            aria-label="Hesap ayarları"
            extra={
              <Button size="sm" className="hidden sm:inline-flex">
                Kaydet
              </Button>
            }
          >
            <TabsTrigger value="profile" icon={<UserIcon />}>
              Profil
            </TabsTrigger>
            <TabsTrigger value="notifications" icon={<BellIcon />}>
              Bildirimler
            </TabsTrigger>
            <TabsTrigger value="security" icon={<ShieldIcon />}>
              Güvenlik
            </TabsTrigger>
            <TabsTrigger value="billing" icon={<CreditCardIcon />}>
              Faturalama
            </TabsTrigger>
            <TabsTrigger value="integrations" icon={<PlugIcon />}>
              Entegrasyonlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="pt-6">
            <div className="mb-6 flex items-center gap-4">
              <Avatar size="lg" alt="Deniz Kaya" src={<Initials text="DK" />} />
              <div>
                <p className="text-sm font-medium text-mari-foreground">Profil fotoğrafı</p>
                <p className="text-xs text-mari-muted">PNG veya JPG, en fazla 2 MB.</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ad">
                <Input defaultValue="Deniz" />
              </Field>
              <Field label="Soyad">
                <Input defaultValue="Kaya" />
              </Field>
              <Field label="E-posta" hint="Değiştirirseniz doğrulama e-postası gönderilir.">
                <Input type="email" defaultValue="deniz@kuzey.com.tr" />
              </Field>
              <Field label="Unvan">
                <Input defaultValue="Ürün Yöneticisi" />
              </Field>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="pt-6">
            <div className="divide-y divide-mari-border">
              <SettingRow title="Yorumlar" description="Görevlerinize yorum yapıldığında e-posta al.">
                <Switch checked={prefs.comments} onChange={toggle("comments")} aria-label="Yorum bildirimleri" />
              </SettingRow>
              <SettingRow title="Bahsedilmeler" description="Biri sizi @ ile andığında anında bildir.">
                <Switch checked={prefs.mentions} onChange={toggle("mentions")} aria-label="Bahsedilme bildirimleri" />
              </SettingRow>
              <SettingRow title="Haftalık özet" description="Her pazartesi ekibin haftalık ilerlemesi.">
                <Switch checked={prefs.weekly} onChange={toggle("weekly")} aria-label="Haftalık özet" />
              </SettingRow>
              <SettingRow title="Ürün duyuruları" description="Yeni özellikler ve güncellemeler.">
                <Switch checked={prefs.product} onChange={toggle("product")} aria-label="Ürün duyuruları" />
              </SettingRow>
            </div>
          </TabsContent>

          <TabsContent value="security" className="pt-6">
            <div className="grid max-w-md gap-4">
              <Field label="Mevcut şifre">
                <Input type="password" />
              </Field>
              <Field label="Yeni şifre" hint="En az 12 karakter; harf, rakam ve sembol içermeli.">
                <Input type="password" />
              </Field>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-mari-border p-4">
              <div className="flex items-center gap-3">
                <KeyRoundIcon size={20} className="shrink-0 text-mari-muted" aria-hidden />
                <div>
                  <p className="text-sm font-medium text-mari-foreground">İki adımlı doğrulama</p>
                  <p className="text-sm text-mari-muted">Kimlik doğrulayıcı uygulama ile.</p>
                </div>
              </div>
              <Tag color="success">Açık</Tag>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-mari-surface-alt p-4">
              <div>
                <p className="text-sm font-medium text-mari-foreground">Ekip planı · aylık</p>
                <p className="text-sm text-mari-muted">8 kullanıcı · sonraki fatura 1 Ekim · 1.192,00 ₺</p>
              </div>
              <Button size="sm" variant="outline" color="neutral">
                Planı değiştir
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="pt-6">
            <p className="text-sm text-mari-muted">Henüz bağlı bir entegrasyon yok.</p>
          </TabsContent>
        </Tabs>
        <Button block className="mt-6 sm:hidden">
          Kaydet
        </Button>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Ürün detayı ─────────────────────────── */

const specs: [string, string][] = [
  ["Sürücü", "40 mm dinamik"],
  ["Aktif gürültü engelleme", "Hibrit, 4 mikrofon"],
  ["Pil ömrü", "32 saat (ANC açık)"],
  ["Hızlı şarj", "10 dk → 5 saat"],
  ["Bağlantı", "Bluetooth 5.3, çoklu cihaz"],
  ["Ağırlık", "254 g"],
];

const reviews = [
  { name: "Selin A.", rating: 5, date: "12 Eyl", text: "Gürültü engelleme metroda bile çok başarılı, uzun süre takınca kulağı yormuyor." },
  { name: "Mert Y.", rating: 4, date: "3 Eyl", text: "Ses çok iyi, uygulamadaki ekolayzer işe yarıyor. Kılıf biraz daha küçük olabilirdi." },
  { name: "Ece T.", rating: 5, date: "28 Ağu", text: "İki cihaza aynı anda bağlanması iş için harika." },
];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`5 üzerinden ${value}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon key={i} size={14} aria-hidden className={i <= value ? "fill-mari-warning text-mari-warning" : "text-mari-border"} />
      ))}
    </span>
  );
}

export const ProductDetail: Story = {
  name: "Ürün Detayı",
  ...storyDoc(
    "E-ticaret ürün sayfası: `count` rozetiyle yorum sayısı, `size=\"lg\"` ile sayfa ölçeğinde sekmeler. " +
      "Her panel farklı içerik türü taşıyor (metin, özellik tablosu, yorum listesi).",
    `
<Tabs defaultActiveTab="description" size="lg">
  <TabsList aria-label="Ürün bilgileri">
    <TabsTrigger value="description">Açıklama</TabsTrigger>
    <TabsTrigger value="specs">Teknik özellikler</TabsTrigger>
    <TabsTrigger value="reviews" count={128}>Yorumlar</TabsTrigger>
    <TabsTrigger value="shipping">Kargo ve iade</TabsTrigger>
  </TabsList>
  …
</Tabs>`
  ),
  render: () => (
    <div className="mx-auto max-w-3xl">
      <Tabs defaultActiveTab="reviews" size="lg">
        <TabsList aria-label="Ürün bilgileri">
          <TabsTrigger value="description">Açıklama</TabsTrigger>
          <TabsTrigger value="specs">Teknik özellikler</TabsTrigger>
          <TabsTrigger value="reviews" count={128}>
            Yorumlar
          </TabsTrigger>
          <TabsTrigger value="shipping">Kargo ve iade</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="pt-6">
          <div className="max-w-prose space-y-3 text-sm leading-relaxed text-mari-foreground">
            <p>
              Kablosuz Kulaklık Pro, hibrit aktif gürültü engelleme ile trafikte, uçakta ve açık ofiste dikkatinizi
              dağıtan sesleri %95'e kadar azaltır.
            </p>
            <p className="text-mari-muted">Yumuşak bellek köpüğü yastıklar ve 254 g ağırlık, gün boyu konfor için tasarlandı.</p>
          </div>
        </TabsContent>

        <TabsContent value="specs" className="pt-6">
          <dl className="divide-y divide-mari-border overflow-hidden rounded-xl border border-mari-border">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] gap-4 px-4 py-3 text-sm odd:bg-mari-surface-alt">
                <dt className="text-mari-muted">{k}</dt>
                <dd className="text-mari-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>

        <TabsContent value="reviews" className="pt-6">
          <div className="mb-6 flex items-center gap-4">
            <span className="text-4xl font-semibold tabular-nums text-mari-foreground">4,7</span>
            <div>
              <Stars value={5} />
              <p className="text-sm text-mari-muted">128 değerlendirme · %94'ü tavsiye ediyor</p>
            </div>
          </div>
          <ul className="divide-y divide-mari-border">
            {reviews.map((r) => (
              <li key={r.name} className="py-4 first:pt-0">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-mari-foreground">{r.name}</span>
                  <span className="text-xs text-mari-muted">{r.date}</span>
                </div>
                <Stars value={r.rating} />
                <p className="mt-1.5 text-sm text-mari-foreground">{r.text}</p>
              </li>
            ))}
          </ul>
        </TabsContent>

        <TabsContent value="shipping" className="pt-6">
          <ul className="space-y-2 text-sm text-mari-foreground">
            <li>Saat 15:00'e kadar verilen siparişler aynı gün kargoda.</li>
            <li className="text-mari-muted">14 gün içinde ücretsiz iade — kargo kodu e-postanıza gönderilir.</li>
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  ),
};

/* ─────────────────────────── 3. Görev takibi (pills) ─────────────────────────── */

type IssueStatus = "open" | "progress" | "done";
const issues: { id: string; title: string; status: IssueStatus; assignee: string }[] = [
  { id: "MRI-212", title: "Tabs: taşan sekmeler mobilde kayıyor", status: "done", assignee: "DK" },
  { id: "MRI-218", title: "Steps kompakt mod dokunma alanı", status: "done", assignee: "AY" },
  { id: "MRI-224", title: "Table sanal kaydırma", status: "progress", assignee: "EC" },
  { id: "MRI-225", title: "DatePicker klavye gezinmesi", status: "progress", assignee: "DK" },
  { id: "MRI-229", title: "Toast yığınlama animasyonu", status: "open", assignee: "MY" },
  { id: "MRI-231", title: "Select çoklu seçim etiketleri", status: "open", assignee: "AY" },
  { id: "MRI-233", title: "Dark mode kontrast denetimi", status: "open", assignee: "EC" },
];

const statusMeta: Record<IssueStatus, { label: string; Icon: typeof CircleDotIcon; className: string }> = {
  open: { label: "Açık", Icon: CircleDashedIcon, className: "text-mari-muted" },
  progress: { label: "Devam ediyor", Icon: CircleDotIcon, className: "text-mari-warning" },
  done: { label: "Tamamlandı", Icon: CircleCheckIcon, className: "text-mari-success" },
};

export const IssueFilter: Story = {
  name: "Görev Takibi (Pills)",
  ...storyDoc(
    "`variant=\"pills\"` — kayan zeminli segmented kontrol; `count` ile her durumdaki görev sayısı. Controlled " +
      "kullanım: seçili sekme listeyi filtreliyor. `extra` ile sağda \"Yeni görev\".",
    `
const [filter, setFilter] = useState("all");

<Tabs variant="pills" activeTab={filter} onChange={setFilter}>
  <TabsList aria-label="Durum filtresi" extra={<Button size="sm" icon={<PlusIcon />}>Yeni görev</Button>}>
    <TabsTrigger value="all" count={7}>Tümü</TabsTrigger>
    <TabsTrigger value="open" count={3}>Açık</TabsTrigger>
    <TabsTrigger value="progress" count={2}>Devam ediyor</TabsTrigger>
    <TabsTrigger value="done" count={2}>Tamamlandı</TabsTrigger>
  </TabsList>
  <TabsContent value={filter}><IssueList filter={filter} /></TabsContent>
</Tabs>`
  ),
  render: () => {
    const [filter, setFilter] = useState("all");
    const countOf = (s: IssueStatus) => issues.filter((i) => i.status === s).length;
    const visible = filter === "all" ? issues : issues.filter((i) => i.status === filter);

    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-mari-border bg-mari-surface p-5 sm:p-6">
        <Tabs variant="pills" activeTab={filter} onChange={setFilter}>
          <TabsList
            aria-label="Durum filtresi"
            extra={
              <Button size="sm" icon={<PlusIcon size={16} aria-hidden />}>
                <span className="hidden sm:inline">Yeni görev</span>
                <span className="sr-only sm:hidden">Yeni görev</span>
              </Button>
            }
          >
            <TabsTrigger value="all" count={issues.length}>
              Tümü
            </TabsTrigger>
            <TabsTrigger value="open" count={countOf("open")}>
              Açık
            </TabsTrigger>
            <TabsTrigger value="progress" count={countOf("progress")}>
              Devam ediyor
            </TabsTrigger>
            <TabsTrigger value="done" count={countOf("done")}>
              Tamamlandı
            </TabsTrigger>
          </TabsList>
          <TabsContent value={filter}>
            <ul className="divide-y divide-mari-border">
              {visible.map((issue) => {
                const { Icon, className, label } = statusMeta[issue.status];
                return (
                  <li key={issue.id} className="flex items-center gap-3 py-3">
                    <Icon size={18} className={`shrink-0 ${className}`} aria-label={label} />
                    <span className="shrink-0 font-mono text-xs text-mari-muted">{issue.id}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-mari-foreground">{issue.title}</span>
                    <Avatar size="sm" alt={issue.assignee} src={<Initials text={issue.assignee} />} />
                  </li>
                );
              })}
            </ul>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

/* ─────────────────────────── 4. Kod paneli (card) ─────────────────────────── */

const files = {
  "Button.tsx": `export function Button({ children, ...props }) {\n  return <button className="btn" {...props}>{children}</button>;\n}`,
  "button.css": `.btn {\n  height: 2rem;\n  padding-inline: 0.75rem;\n  border-radius: var(--radius-md);\n}`,
  "README.md": `# Button\n\nBirincil aksiyonlar için.`,
} as const;

export const CodePanel: Story = {
  name: "Kod Paneli (Card)",
  ...storyDoc(
    "`variant=\"card\"` — editör dosya sekmeleri gibi: aktif kart panelle birleşir, pasifler geride kalır. " +
      "`size=\"sm\"` ile yoğun bir araç arayüzü.",
    `
<Tabs variant="card" size="sm" defaultActiveTab="Button.tsx">
  <TabsList aria-label="Dosyalar">
    <TabsTrigger value="Button.tsx" icon={<FileCode2Icon />}>Button.tsx</TabsTrigger>
    <TabsTrigger value="button.css" icon={<PaletteIcon />}>button.css</TabsTrigger>
    <TabsTrigger value="README.md" icon={<FileTextIcon />}>README.md</TabsTrigger>
  </TabsList>
  <TabsContent value="Button.tsx" className="pt-0">…</TabsContent>
</Tabs>`
  ),
  render: () => {
    const icons = { "Button.tsx": <FileCode2Icon />, "button.css": <PaletteIcon />, "README.md": <FileTextIcon /> };
    return (
      <div className="mx-auto max-w-2xl">
        <Tabs variant="card" size="sm" defaultActiveTab="Button.tsx">
          <TabsList aria-label="Dosyalar">
            {(Object.keys(files) as (keyof typeof files)[]).map((name) => (
              <TabsTrigger key={name} value={name} icon={icons[name]}>
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
          {(Object.keys(files) as (keyof typeof files)[]).map((name) => (
            <TabsContent key={name} value={name} className="pt-0">
              <pre className="overflow-x-auto rounded-b-xl rounded-tr-xl border border-t-0 border-mari-border bg-mari-surface p-4 font-mono text-xs leading-relaxed text-mari-foreground">
                {files[name]}
              </pre>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  },
};

/* ─────────────────────────── 5. Dikey ─────────────────────────── */

export const VerticalSettings: Story = {
  name: "Dikey (Ekip Ayarları)",
  ...storyDoc(
    "`orientation=\"vertical\"` — sekmeler solda, içerik sağda; ↑/↓ ile gezilir. Kapsayıcı `responsive` " +
      "(varsayılan 640px) altına inince yataya döner — mobilde sol sütun içeriği ezmez.",
    `
<Tabs orientation="vertical" defaultActiveTab="members">
  <TabsList aria-label="Ekip ayarları">
    <TabsTrigger value="general" icon={<CodeIcon />}>Genel</TabsTrigger>
    <TabsTrigger value="members" icon={<UsersIcon />} count={8}>Üyeler</TabsTrigger>
    <TabsTrigger value="security" icon={<ShieldIcon />}>Güvenlik</TabsTrigger>
    <TabsTrigger value="billing" icon={<CreditCardIcon />} disabled>Faturalama</TabsTrigger>
  </TabsList>
  <TabsContent value="members">…</TabsContent>
</Tabs>`
  ),
  render: () => {
    const members = [
      { initials: "DK", name: "Deniz Kaya", email: "deniz@kuzey.com.tr", role: "Yönetici" },
      { initials: "AY", name: "Aykut Yılmaz", email: "aykut@kuzey.com.tr", role: "Geliştirici" },
      { initials: "EC", name: "Elif Can", email: "elif@kuzey.com.tr", role: "Tasarımcı" },
    ];
    return (
      <div className="mx-auto max-w-3xl rounded-xl border border-mari-border bg-mari-surface p-5 sm:p-6">
        <Tabs orientation="vertical" defaultActiveTab="members">
          <TabsList aria-label="Ekip ayarları">
            <TabsTrigger value="general" icon={<CodeIcon />}>
              Genel
            </TabsTrigger>
            <TabsTrigger value="members" icon={<UsersIcon />} count={8}>
              Üyeler
            </TabsTrigger>
            <TabsTrigger value="security" icon={<ShieldIcon />}>
              Güvenlik
            </TabsTrigger>
            <TabsTrigger value="billing" icon={<CreditCardIcon />} disabled>
              Faturalama
            </TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <Field label="Ekip adı">
              <Input defaultValue="Kuzey Yazılım" />
            </Field>
          </TabsContent>
          <TabsContent value="members">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-mari-foreground">8 üye</p>
              <Button size="sm" variant="outline" color="neutral">
                Davet et
              </Button>
            </div>
            <ul className="divide-y divide-mari-border">
              {members.map((m) => (
                <li key={m.email} className="flex items-center gap-3 py-3">
                  <Avatar alt={m.name} src={<Initials text={m.initials} />} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-mari-foreground">{m.name}</p>
                    <p className="truncate text-xs text-mari-muted">{m.email}</p>
                  </div>
                  <Tag>{m.role}</Tag>
                </li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="security">
            <p className="text-sm text-mari-muted">Tüm üyeler için iki adımlı doğrulama zorunlu.</p>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};

/* ─────────────────────────── 6. Taşan sekmeler ─────────────────────────── */

const categories = ["Tümü", "Elektronik", "Moda", "Ev & Yaşam", "Kozmetik", "Spor & Outdoor", "Kitap", "Oyuncak", "Süpermarket", "Otomotiv", "Bahçe", "Pet Shop"];

export const Overflow: Story = {
  name: "Taşan Sekmeler",
  ...storyDoc(
    "Sığmayan sekmeler kaydırılabilir bir şeride dönüşür: kaydırılabilen kenar solar, kaydırma çubuğu gizlidir, " +
      "aktif sekme (klavyeyle de) her zaman görünür alana kaydırılır. Kutu 360px genişliğinde.",
    `
<Tabs defaultActiveTab="Tümü" size="sm">
  <TabsList aria-label="Kategoriler">
    {categories.map((c) => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
  </TabsList>
</Tabs>`
  ),
  render: () => (
    <div className="flex flex-col gap-8">
      {(["line", "pills"] as const).map((variant) => (
        <div key={variant} className="max-w-[360px] rounded-xl border border-dashed border-mari-border p-4">
          <p className="mb-3 font-mono text-xs text-mari-muted">variant="{variant}"</p>
          <Tabs defaultActiveTab="Tümü" size="sm" variant={variant}>
            <TabsList aria-label="Kategoriler">
              {categories.map((c) => (
                <TabsTrigger key={c} value={c}>
                  {c}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

export const FillAndCenter: Story = {
  name: "Tam Genişlik ve Ortalı",
  ...storyDoc("`fill` — sekmeler genişliğe eşit dağılır (mobil segmented kontrol). `align=\"center\"` — ortalı.", `
<Tabs variant="pills" fill defaultActiveTab="week">…</Tabs>
<Tabs align="center" defaultActiveTab="week">…</Tabs>`),
  render: () => (
    <div className="flex max-w-md flex-col gap-8">
      <Tabs variant="pills" fill defaultActiveTab="week">
        {simpleTabs}
      </Tabs>
      <Tabs fill defaultActiveTab="week">
        {simpleTabs}
      </Tabs>
      <Tabs align="center" defaultActiveTab="week">
        {simpleTabs}
      </Tabs>
    </div>
  ),
};

/* ─────────────────────────── Görünüm seçenekleri ─────────────────────────── */

const simpleTabs = (
  <TabsList aria-label="Rapor dönemi">
    <TabsTrigger value="day">Gün</TabsTrigger>
    <TabsTrigger value="week">Hafta</TabsTrigger>
    <TabsTrigger value="month">Ay</TabsTrigger>
    <TabsTrigger value="year" disabled>
      Yıl
    </TabsTrigger>
  </TabsList>
);

export const Variants: Story = {
  name: "Görünüm: line / card / pills",
  ...storyDoc("Üç görünüm; son sekme `disabled`.", `
<Tabs variant="line" defaultActiveTab="week">…</Tabs>
<Tabs variant="card" defaultActiveTab="week">…</Tabs>
<Tabs variant="pills" defaultActiveTab="week">…</Tabs>`),
  render: () => (
    <div className="flex flex-col gap-8">
      {(["line", "card", "pills"] as const).map((variant) => (
        <Tabs key={variant} variant={variant} defaultActiveTab="week">
          {simpleTabs}
        </Tabs>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`sm` / `md` / `lg`.", `<Tabs size="sm" defaultActiveTab="week">…</Tabs>`),
  render: () => (
    <div className="flex flex-col gap-8">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-end gap-10">
          <Tabs size={size} defaultActiveTab="week">
            {simpleTabs}
          </Tabs>
          <Tabs size={size} variant="pills" defaultActiveTab="week">
            {simpleTabs}
          </Tabs>
        </div>
      ))}
    </div>
  ),
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color` — aktif sekme göstergesi ve metni.", `<Tabs color="success" defaultActiveTab="week">…</Tabs>`),
  render: () => (
    <div className="flex flex-col gap-6">
      {(["primary", "accent", "success", "warning", "error", "neutral"] as const).map((color) => (
        <Tabs key={color} color={color} defaultActiveTab="week" size="sm">
          {simpleTabs}
        </Tabs>
      ))}
    </div>
  ),
};

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="flex flex-col gap-6">
      <label className="flex items-center gap-2 text-sm text-mari-foreground">
        <input type="checkbox" checked={loading} onChange={(e) => setLoading(e.target.checked)} />
        Yükleniyor
      </label>
      {(["line", "card", "pills"] as const).map((variant) => (
        <Tabs key={variant} variant={variant} defaultActiveTab="orders" skeleton={loading}>
          <TabsList aria-label="Hesap">
            <TabsTrigger value="orders" count={3}>
              Siparişlerim
            </TabsTrigger>
            <TabsTrigger value="addresses">Adreslerim</TabsTrigger>
            <TabsTrigger value="payment">Ödeme Yöntemleri</TabsTrigger>
          </TabsList>
          <TabsContent value="orders">
            <p className="text-sm text-mari-muted">3 aktif siparişiniz var. En yakın teslimat yarın 14:00–18:00 arasında.</p>
          </TabsContent>
          <TabsContent value="addresses">Kayıtlı adresler</TabsContent>
          <TabsContent value="payment">Kayıtlı kartlar</TabsContent>
        </Tabs>
      ))}
    </div>
  );
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — sekme etiketleri (ve sayı rozetleri) kendi kutularında, aktif panelin içeriği satır çubuklarıyla yer " +
      "tutucu; sekme kutuları (kenarlık, kart zemini) aynı kalır, gösterge gizli, sekmeler seçilemez. Gerçek içerik " +
      "görünmez olarak yerinde kaldığından yüklenince zıplama olmaz.",
    `
<Tabs variant="card" defaultActiveTab="orders" skeleton={!account}>
  <TabsList aria-label="Hesap">
    <TabsTrigger value="orders" count={account?.orderCount}>Siparişlerim</TabsTrigger>
    <TabsTrigger value="addresses">Adreslerim</TabsTrigger>
  </TabsList>
  <TabsContent value="orders">…</TabsContent>
  <TabsContent value="addresses">…</TabsContent>
</Tabs>`
  ),
  render: () => <SkeletonDemo />,
};
