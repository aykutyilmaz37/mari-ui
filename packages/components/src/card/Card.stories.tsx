/**
 * Faz 13.6 kullanıcı isteği: "Card çok genel, kullanıma göre değişiyor —
 * yine de örneklendirip düzeltelim." Örnekler en yaygın kart ailelerini
 * gösterir: ürün (link kart), KPI, makale, profil, fiyatlandırma, ayarlar
 * paneli (iç içe), aksiyon çubuklu proje kartı. Kapaklarda harici görsel
 * yerine token renkli degrade — Storybook çevrimdışı da çalışsın.
 *
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc(...)`'unkini ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  ArrowDownRightIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CameraIcon,
  HeadphonesIcon,
  KeyboardIcon,
  LaptopIcon,
  MessageSquareIcon,
  MonitorSmartphoneIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Share2Icon,
  SmartphoneIcon,
  StarIcon,
  UserPlusIcon,
  WatchIcon,
} from "lucide-react";
import { baseSizeArgType, classNameArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Card, CardMeta } from "./Card";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Switch } from "../switch";
import { Tag } from "../tag";

const meta: Meta<typeof Card> = {
  title: "Veri Gösterimi/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "İlgili içeriği tek bir yüzeyde toplayan genel amaçlı kapsayıcı. Bölgeler: `cover` (kenardan kenara " +
            "kapak), başlık (`title` + `extra`), gövde, `footer` ve `actions` (eşit bölünmüş aksiyon çubuğu). " +
            "`CardMeta` avatar + başlık + açıklama düzenini hazır verir. Kart bir iskelettir — içeriği kullanım " +
            "belirler; aşağıdaki örnekler en yaygın kart ailelerini gösterir.",
          whenToUse: [
            "Bir varlığın özeti bir ızgarada/listede tekrarlanıyorsa (ürün, makale, proje, kişi).",
            "Bir sayfayı bağımsız bölümlere ayırmak için (dashboard KPI'ları, ayar grupları).",
          ],
          whenNotToUse: [
            "Tek bir düz metin bloğu için — kenarlıklı kutu gereksiz görsel ağırlık ekler.",
            "Yoğun tablo verisi için — Table kullanın; kart ızgarası karşılaştırmayı zorlaştırır.",
          ],
          a11y:
            "Bütün kart bir sayfaya gidiyorsa `href` verin — gerçek bir `<a>` olur (orta tık, yeni sekme, klavye " +
            "çalışır). `onClick` `role=\"button\"` bir kart üretir. İçinde başka düğme/link bulunan bir kartı " +
            "bütünüyle tıklanabilir yapmayın (iç içe etkileşimli öğe geçersizdir) — bunun yerine başlığı link yapın. " +
            "`hoverable`'ın yükselme hareketi `prefers-reduced-motion`'da kapanır.",
        }),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Başlık — uzunsa tek satırda kesilir." },
    extra: { control: false, description: "Başlığın sağında (link, menü, Switch)." },
    cover: { control: false, description: "Kenardan kenara kapak (görsel)." },
    footer: { control: false, description: "Üst çizgiyle ayrılan alt bilgi." },
    actions: { control: false, description: "Eşit bölünmüş alt aksiyon çubuğu — düğme/link dizisi." },
    bordered: { control: "boolean", description: "Kenarlık. Varsayılan: `true`.", table: { category: "Görünüm" } },
    hoverable: { control: "boolean", description: "Üzerine gelince gölge + hafif yükselme. `href`'te varsayılan açık.", table: { category: "Görünüm" } },
    inset: { control: "boolean", description: "Gömülü kart — tonlu zemin.", table: { category: "Görünüm" } },
    skeleton: { control: "boolean", description: "Veri gelene kadar gövde yerine iskelet (eski adı `loading`)." },
    size: { ...baseSizeArgType, description: "Dolgu: 12 / 24 / 32px. Varsayılan: `md`." },
    href: { control: "text", description: "Kartın tamamı bir link olur." },
    onClick: { description: "Kartın tamamı `role=\"button\"` olur.", table: { category: "Olaylar" } },
    className: classNameArgType,
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

/* ─────────────────────────── yardımcılar ─────────────────────────── */

function Initials({ text, className = "" }: { text: string; className?: string }) {
  return (
    <span aria-hidden className={`flex size-full items-center justify-center bg-mari-primary-subtle font-semibold text-mari-primary-subtle-contrast ${className}`}>
      {text}
    </span>
  );
}

/** Harici görsel yerine token renkli degrade kapak. */
function ArtCover({ Icon, tone = "primary", ratio = "aspect-[4/3]" }: { Icon: typeof LaptopIcon; tone?: "primary" | "accent" | "success" | "warning" | "info"; ratio?: string }) {
  const tones = {
    primary: "from-mari-primary-subtle to-mari-surface-alt text-mari-primary",
    accent: "from-mari-accent-subtle to-mari-surface-alt text-mari-accent",
    success: "from-mari-success-subtle to-mari-surface-alt text-mari-success",
    warning: "from-mari-warning-subtle to-mari-surface-alt text-mari-warning",
    info: "from-mari-info-subtle to-mari-surface-alt text-mari-info",
  };
  return (
    <div className={`flex ${ratio} items-center justify-center bg-gradient-to-br ${tones[tone]}`}>
      <Icon size={56} strokeWidth={1.25} aria-hidden />
    </div>
  );
}

const tl = (n: number) => n.toLocaleString("tr-TR") + " ₺";

/* ─────────────────────────── 1. Ürün kartları ─────────────────────────── */

const products = [
  { name: "Kablosuz Kulaklık Pro", price: 2499, old: 3199, rating: 4.7, reviews: 128, Icon: HeadphonesIcon, tone: "primary" as const },
  { name: "Akıllı Saat S3 44 mm", price: 3799, rating: 4.5, reviews: 86, Icon: WatchIcon, tone: "accent" as const },
  { name: "Mekanik Klavye TKL — Kahverengi switch", price: 1899, old: 2299, rating: 4.8, reviews: 342, Icon: KeyboardIcon, tone: "success" as const },
  { name: "Aynasız Fotoğraf Makinesi", price: 32499, rating: 4.9, reviews: 57, Icon: CameraIcon, tone: "info" as const },
];

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    title: "Kart başlığı",
    children: "Kart içeriği. Kart bir iskelettir; içeriği kullanım belirler.",
    footer: "Son güncelleme: bugün",
    className: "max-w-sm",
    size: "md",
    bordered: true,
    hoverable: false,
    skeleton: false,
    inset: false,
  },
};

export const ProductGrid: Story = {
  name: "Ürün Kartları",
  ...storyDoc(
    "E-ticaret ızgarası: `href` ile kartın tamamı ürün sayfasına giden bir link (hoverable varsayılan), " +
      "`cover` kenardan kenara. Gövde `flex-1` olduğu için farklı uzunluktaki isimlerde fiyatlar aynı hizada kalır.",
    `
<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  {products.map((p) => (
    <Card key={p.id} href={\`/urun/\${p.id}\`} size="sm" cover={<img src={p.image} alt="" />}>
      <p className="line-clamp-2 text-sm">{p.name}</p>
      <p className="mt-2 font-semibold">{p.price}</p>
    </Card>
  ))}
</div>`
  ),
  render: () => (
    <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {products.map((p) => {
        const discount = p.old ? Math.round((1 - p.price / p.old) * 100) : 0;
        return (
          <Card key={p.name} href="#urun" size="sm" cover={<ArtCover Icon={p.Icon} tone={p.tone} />}>
            <div className="flex h-full flex-col">
              <p className="line-clamp-2 text-sm text-mari-foreground">{p.name}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-mari-muted">
                <StarIcon size={12} className="fill-mari-warning text-mari-warning" aria-hidden />
                <span className="font-medium text-mari-foreground">{p.rating.toLocaleString("tr-TR")}</span>({p.reviews})
              </p>
              <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-3">
                <span className="text-base font-semibold tabular-nums text-mari-foreground">{tl(p.price)}</span>
                {p.old && <span className="text-xs tabular-nums text-mari-muted line-through">{tl(p.old)}</span>}
                {discount > 0 && (
                  <Tag color="error" variant="soft">
                    %{discount}
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  ),
};

/* ─────────────────────────── 2. KPI kartları ─────────────────────────── */

const kpis = [
  { label: "Gelir", value: "₺482.310", delta: 12.4, points: [8, 12, 10, 14, 13, 17, 16, 21] },
  { label: "Sipariş", value: "3.847", delta: 8.1, points: [10, 11, 9, 13, 14, 13, 16, 18] },
  { label: "Dönüşüm oranı", value: "%3,2", delta: -0.4, points: [16, 15, 16, 14, 13, 14, 12, 12] },
  { label: "Ort. sepet", value: "₺1.254", delta: 3.9, points: [11, 12, 12, 13, 12, 14, 14, 15] },
];

function Sparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p - min) / (max - min || 1)) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-8 w-full" aria-hidden>
      <polyline points={d} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" className={positive ? "stroke-mari-success" : "stroke-mari-error"} />
    </svg>
  );
}

export const KpiCards: Story = {
  name: "KPI Kartları (Dashboard)",
  ...storyDoc(
    "Dashboard özet kartları: büyük değer, dönem karşılaştırması ve eğilim çizgisi. `skeleton` ile veri gelene " +
      "kadar iskelet — düğmeyle deneyin.",
    `
<Card size="sm" skeleton={isLoading}>
  <p className="text-sm text-mari-muted">Gelir</p>
  <p className="text-2xl font-semibold">₺482.310</p>
  <Tag color="success">+12,4%</Tag>
</Card>`
  ),
  render: () => {
    const [loading, setLoading] = useState(false);
    return (
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-mari-foreground">Son 30 gün</p>
          <Button
            size="sm"
            variant="outline"
            color="neutral"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            Yenile
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => {
            const positive = k.delta >= 0;
            const DeltaIcon = positive ? ArrowUpRightIcon : ArrowDownRightIcon;
            return (
              <Card key={k.label} size="sm" skeleton={loading} classNames={{ body: "p-5" }}>
                <p className="text-sm text-mari-muted">{k.label}</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold tabular-nums tracking-tight text-mari-foreground">{k.value}</p>
                  <span className={`mb-1 inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-mari-success" : "text-mari-error"}`}>
                    <DeltaIcon size={14} aria-hidden />
                    {positive ? "+" : ""}
                    {k.delta.toLocaleString("tr-TR")}%<span className="sr-only"> önceki döneme göre</span>
                  </span>
                </div>
                <div className="mt-3">
                  <Sparkline points={k.points} positive={positive} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Makale kartları ─────────────────────────── */

const articles = [
  { tag: "Tasarım", title: "Token tabanlı tema: renkleri çalışma zamanında değiştirmek", excerpt: "CSS değişkenleriyle tek bir kaynaktan açık/koyu ve marka temalarını yönetmenin pratik yolu.", author: "Elif Can", initials: "EC", date: "24 Eyl", read: "6 dk", Icon: MonitorSmartphoneIcon, tone: "accent" as const },
  { tag: "Erişilebilirlik", title: "Sekmelerde roving tabindex neden önemli?", excerpt: "Klavye kullanıcıları için Tab tuşunu tek durağa indirip ok tuşlarıyla gezinmeyi kurmak.", author: "Aykut Yılmaz", initials: "AY", date: "19 Eyl", read: "4 dk", Icon: KeyboardIcon, tone: "primary" as const },
  { tag: "Mobil", title: "Dar ekranda adım göstergesi: dikey mi, kompakt mı?", excerpt: "Sihirbazlarda ekranın yarısını adım listesine harcamamak için kompakt düzen.", author: "Deniz Kaya", initials: "DK", date: "12 Eyl", read: "5 dk", Icon: SmartphoneIcon, tone: "success" as const },
];

export const ArticleCards: Story = {
  name: "Makale Kartları",
  ...storyDoc(
    "Blog/haber ızgarası: kapak, kategori etiketi, 2 satırda kesilen başlık, `footer`'da `CardMeta` ile yazar. " +
      "Başlık link — kartın tamamı değil, çünkü ileride yazar/etiket de ayrı link olabilir.",
    `
<Card
  cover={<img src={post.cover} alt="" />}
  footer={<CardMeta avatar={<Avatar src={post.author.avatar} />} title={post.author.name} description="24 Eyl · 6 dk" />}
>
  <Tag>{post.category}</Tag>
  <h3><a href={post.url}>{post.title}</a></h3>
  <p>{post.excerpt}</p>
</Card>`
  ),
  render: () => (
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((a) => (
        <Card
          key={a.title}
          hoverable
          cover={<ArtCover Icon={a.Icon} tone={a.tone} ratio="aspect-[16/9]" />}
          classNames={{ body: "p-5", footer: "px-5 py-4" }}
          footer={
            <CardMeta
              avatar={<Avatar size="sm" alt={a.author} src={<Initials text={a.initials} className="text-xs" />} />}
              title={<span className="text-sm">{a.author}</span>}
              description={`${a.date} · ${a.read} okuma`}
              className="items-center [&_.mt-1]:mt-0"
            />
          }
        >
          <Tag color="neutral">{a.tag}</Tag>
          <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-mari-foreground">
            <a href="#makale" className="hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-mari-ring">
              {a.title}
            </a>
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-mari-muted">{a.excerpt}</p>
        </Card>
      ))}
    </div>
  ),
};

/* ─────────────────────────── 4. Profil kartı ─────────────────────────── */

export const ProfileCard: Story = {
  name: "Profil Kartı",
  ...storyDoc(
    "Kapak bandı + üstüne taşan avatar, kısa istatistikler ve `actions` ile eşit bölünmüş aksiyon çubuğu " +
      "(ant.design `actions`).",
    `
<Card
  cover={<div className="h-20 bg-gradient-to-r …" />}
  actions={[
    <Button variant="ghost" icon={<MessageSquareIcon />}>Mesaj</Button>,
    <Button variant="ghost" icon={<UserPlusIcon />}>Takip et</Button>,
  ]}
>
  …
</Card>`
  ),
  render: () => {
    const [following, setFollowing] = useState(false);
    return (
      <div className="mx-auto max-w-sm">
        <Card
          cover={<div className="h-24 bg-gradient-to-r from-mari-primary-solid/85 via-mari-info-solid/70 to-mari-accent-solid/60" />}
          classNames={{ body: "px-6 pb-6 pt-0" }}
          actions={[
            <Button key="msg" variant="ghost" color="neutral" icon={<MessageSquareIcon size={16} aria-hidden />}>
              Mesaj
            </Button>,
            <Button
              key="follow"
              variant="ghost"
              color={following ? "neutral" : "primary"}
              icon={following ? <CheckIcon size={16} aria-hidden /> : <UserPlusIcon size={16} aria-hidden />}
              onClick={() => setFollowing((f) => !f)}
              aria-pressed={following}
            >
              {following ? "Takip ediliyor" : "Takip et"}
            </Button>,
          ]}
        >
          <div className="-mt-10 mb-3 w-fit rounded-full ring-4 ring-mari-surface">
            <Avatar size={72} alt="Elif Can" src={<Initials text="EC" className="text-xl" />} />
          </div>
          <h3 className="text-lg font-semibold text-mari-foreground">Elif Can</h3>
          <p className="text-sm text-mari-muted">Ürün Tasarımcısı · İstanbul</p>
          <p className="mt-3 text-sm text-mari-foreground">Tasarım sistemleri ve erişilebilir arayüzler üzerine çalışıyorum.</p>
          <dl className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-mari-surface-alt p-3 text-center">
            {[
              ["Proje", "24"],
              ["Takipçi", "1,2B"],
              ["Takip", "318"],
            ].map(([k, v]) => (
              <div key={k}>
                <dd className="text-base font-semibold tabular-nums text-mari-foreground">{v}</dd>
                <dt className="text-xs text-mari-muted">{k}</dt>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    );
  },
};

/* ─────────────────────────── 5. Fiyatlandırma ─────────────────────────── */

const plans = [
  { name: "Başlangıç", price: "Ücretsiz", note: "5 kullanıcıya kadar", features: ["3 proje", "Temel bileşenler", "Topluluk desteği"], cta: "Başla" },
  { name: "Ekip", price: "149 ₺", note: "kullanıcı başı / ay", features: ["Sınırsız proje", "Tema stüdyosu", "Figma senkronu", "E-posta desteği"], cta: "14 gün dene", featured: true },
  { name: "Kurumsal", price: "Teklif al", note: "yıllık sözleşme", features: ["SSO / SAML", "Denetim kayıtları", "Özel SLA", "Atanmış destek"], cta: "Satışla görüş" },
];

export const Pricing: Story = {
  name: "Fiyatlandırma",
  ...storyDoc(
    "Plan kartları: öne çıkan plan `className` ile vurgulanır (kenarlık + gölge + etiket). `footer`'da tam " +
      "genişlik CTA; gövde `flex-1` olduğundan düğmeler aynı hizada.",
    `
<Card
  title="Ekip"
  extra={<Tag color="primary">Önerilen</Tag>}
  className="border-mari-primary shadow-mari-lg"
  footer={<Button block>14 gün dene</Button>}
>
  …
</Card>`
  ),
  render: () => (
    <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3 md:items-stretch">
      {plans.map((p) => (
        <Card
          key={p.name}
          title={p.name}
          extra={p.featured ? <Tag color="primary">Önerilen</Tag> : undefined}
          // Mobilde tek kolon: önerilen plan en üstte.
          className={p.featured ? "order-first border-mari-primary shadow-mari-lg md:order-none md:-my-3" : undefined}
          footer={
            <Button block variant={p.featured ? "solid" : "outline"} color={p.featured ? "primary" : "neutral"}>
              {p.cta}
            </Button>
          }
        >
          <p className="text-3xl font-semibold tracking-tight text-mari-foreground">{p.price}</p>
          <p className="text-sm text-mari-muted">{p.note}</p>
          <ul className="mt-6 space-y-2.5">
            {p.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-mari-foreground">
                <CheckIcon size={16} className="shrink-0 text-mari-success" aria-hidden />
                {f}
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  ),
};

/* ─────────────────────────── 6. Ayarlar paneli (iç içe) ─────────────────────────── */

export const SettingsPanel: Story = {
  name: "Ayarlar Paneli (İç İçe)",
  ...storyDoc(
    "Başlıkta `extra` olarak Switch, gövdede `inset` kartlar — bir bölümün içindeki alt öğeler (bağlı cihazlar). " +
      "Gömülü kart tonlu zeminle ayrışır, gölge taşımaz.",
    `
<Card title="Oturumlar" extra={<Switch checked={alerts} onChange={setAlerts} label="Yeni giriş uyarısı" />}>
  <Card inset size="sm">MacBook Pro · İstanbul · şu an aktif</Card>
  <Card inset size="sm">iPhone 15 · 2 saat önce</Card>
</Card>`
  ),
  render: () => {
    const [alerts, setAlerts] = useState(true);
    const sessions = [
      { Icon: LaptopIcon, device: "MacBook Pro · Chrome", place: "İstanbul, TR", when: "Şu an aktif", current: true },
      { Icon: SmartphoneIcon, device: "iPhone 15 · Safari", place: "İstanbul, TR", when: "2 saat önce" },
      { Icon: MonitorSmartphoneIcon, device: "Windows · Edge", place: "Ankara, TR", when: "3 gün önce" },
    ];
    return (
      <div className="mx-auto max-w-2xl">
        <Card title="Oturumlar" extra={<Switch checked={alerts} onChange={setAlerts} label="Giriş uyarısı" size="sm" />}>
          <p className="mb-4 text-sm text-mari-muted">Hesabınızın açık olduğu cihazlar. Tanımadığınız bir oturumu kapatın.</p>
          <div className="space-y-3">
            {sessions.map(({ Icon, device, place, when, current }) => (
              <Card key={device} inset size="sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-mari-surface text-mari-muted">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    {/* Kesmek yerine sar: mobilde "Şu an aktif" gibi asıl bilgi kaybolmasın. */}
                    <p className="text-sm font-medium text-mari-foreground">{device}</p>
                    <p className="text-xs text-mari-muted">
                      {place} · {when}
                    </p>
                  </div>
                  {current ? (
                    <Tag color="success">Bu cihaz</Tag>
                  ) : (
                    <Button size="sm" variant="ghost" color="error">
                      Kapat
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    );
  },
};

/* ─────────────────────────── 7. Proje kartları (actions) ─────────────────────────── */

const projects = [
  { name: "Mobil uygulama v3", team: ["DK", "AY", "EC"], progress: 72, due: "12 Eki", status: "Yolunda", color: "success" as const },
  { name: "Tasarım sistemi göçü", team: ["AY", "MY"], progress: 45, due: "30 Eki", status: "Risk", color: "warning" as const },
  { name: "Ödeme altyapısı", team: ["EC", "DK", "MY", "AY"], progress: 18, due: "20 Kas", status: "Başlangıç", color: "info" as const },
];

export const ProjectCards: Story = {
  name: "Proje Kartları (Aksiyonlu)",
  ...storyDoc(
    "`actions` — ikon düğmeleri eşit bölünmüş alt çubuk. Başlıkta durum etiketi (`extra`), gövdede ilerleme " +
      "ve ekip avatarları.",
    `
<Card
  title="Mobil uygulama v3"
  extra={<Tag color="success">Yolunda</Tag>}
  actions={[
    <Button variant="ghost" aria-label="Düzenle" icon={<PencilIcon />} />,
    <Button variant="ghost" aria-label="Paylaş" icon={<Share2Icon />} />,
    <Button variant="ghost" aria-label="Diğer" icon={<MoreHorizontalIcon />} />,
  ]}
>
  …
</Card>`
  ),
  render: () => (
    <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <Card
          key={p.name}
          title={p.name}
          extra={<Tag color={p.color}>{p.status}</Tag>}
          actions={[
            <Button key="e" variant="ghost" color="neutral" size="sm" aria-label={`${p.name} düzenle`} icon={<PencilIcon size={16} aria-hidden />} />,
            <Button key="s" variant="ghost" color="neutral" size="sm" aria-label={`${p.name} paylaş`} icon={<Share2Icon size={16} aria-hidden />} />,
            <Button key="m" variant="ghost" color="neutral" size="sm" aria-label={`${p.name} diğer işlemler`} icon={<MoreHorizontalIcon size={16} aria-hidden />} />,
          ]}
        >
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="text-mari-muted">İlerleme</span>
            <span className="font-medium tabular-nums text-mari-foreground">%{p.progress}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-mari-surface-alt" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.name} ilerleme`}>
            <div className="h-full rounded-full bg-mari-primary-solid" style={{ width: `${p.progress}%` }} />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {p.team.map((t) => (
                <span key={t} className="inline-flex rounded-full ring-2 ring-mari-surface">
                  <Avatar size={28} alt={t} src={<Initials text={t} className="text-[11px]" />} />
                </span>
              ))}
            </div>
            <span className="text-xs text-mari-muted">Teslim: {p.due}</span>
          </div>
        </Card>
      ))}
    </div>
  ),
};

/* ─────────────────────────── Temel seçenekler ─────────────────────────── */

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("`sm` (12px) / `md` (24px, varsayılan) / `lg` (32px) dolgu; başlık yüksekliği de ölçeklenir.", `
<Card size="sm" title="Küçük">…</Card>
<Card title="Orta">…</Card>
<Card size="lg" title="Büyük">…</Card>`),
  render: () => (
    <div className="grid max-w-5xl gap-4 md:grid-cols-3 md:items-start">
      {(["sm", "md", "lg"] as const).map((size) => (
        <Card key={size} size={size} title={{ sm: "Küçük", md: "Orta", lg: "Büyük" }[size]} extra={<a href="#raporlar" className="text-mari-primary hover:underline">Tümü</a>}>
          <p className="text-sm text-mari-muted">Kart gövdesi — dolgu boyutla birlikte büyür.</p>
        </Card>
      ))}
    </div>
  ),
};

export const Surfaces: Story = {
  name: "Yüzeyler",
  ...storyDoc("Varsayılan (kenarlıklı), `bordered={false}`, `inset` (gömülü) ve `hoverable`.", `
<Card title="Varsayılan">…</Card>
<Card title="Kenarlıksız" bordered={false}>…</Card>
<Card title="Gömülü" inset>…</Card>
<Card title="Hoverable" hoverable>…</Card>`),
  render: () => (
    <div className="grid max-w-5xl gap-4 rounded-xl bg-mari-surface-alt p-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card title="Varsayılan" size="sm">
        <p className="text-sm text-mari-muted">Kenarlık + yüzey.</p>
      </Card>
      <Card title="Kenarlıksız" size="sm" bordered={false}>
        <p className="text-sm text-mari-muted">Tonlu zemin üstünde.</p>
      </Card>
      <Card title="Gömülü" size="sm" inset className="bg-mari-surface">
        <p className="text-sm text-mari-muted">İç içe kullanım için.</p>
      </Card>
      <Card title="Hoverable" size="sm" hoverable>
        <p className="text-sm text-mari-muted">Üzerine gelin.</p>
      </Card>
    </div>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` kartın TÜM bölgelerini iskelete çevirir: kapak, başlık, `extra`, gövde, `footer` ve `actions`. " +
      "Gerçek içerik görünmez olarak yerinde kalır, böylece iskelet ↔ yüklü geçişinde kart zıplamaz; link/tıklanabilir " +
      "kart iskeletteyken etkileşimsizdir. Yüklenen bölgeye `aria-busy` vermek tüketicinin işidir.",
    `
<Card
  skeleton={isLoading}
  cover={<img src={cover} alt="" />}
  title="Mobil uygulama v3"
  extra={<Tag color="success">Yolunda</Tag>}
  footer="Son güncelleme: 2 saat önce"
  actions={[…]}
>
  …
</Card>`
  ),
  render: () => {
    const [skeleton, setSkeleton] = useState(true);
    return (
      <div className="mx-auto max-w-sm space-y-4" aria-busy={skeleton}>
        <Switch checked={skeleton} onChange={setSkeleton} label="İskelet" size="sm" />
        <Card
          skeleton={skeleton}
          cover={<ArtCover Icon={LaptopIcon} ratio="aspect-[16/9]" />}
          title="Mobil uygulama v3"
          extra={<Tag color="success">Yolunda</Tag>}
          footer={<span className="text-sm text-mari-muted">Son güncelleme: 2 saat önce</span>}
          actions={[
            <Button key="e" variant="ghost" color="neutral" size="sm" aria-label="Düzenle" icon={<PencilIcon size={16} aria-hidden />} />,
            <Button key="s" variant="ghost" color="neutral" size="sm" aria-label="Paylaş" icon={<Share2Icon size={16} aria-hidden />} />,
          ]}
        >
          <p className="text-sm text-mari-foreground">iOS ve Android için yeniden yazılan uygulamanın üçüncü sürümü.</p>
          <p className="mt-2 text-sm text-mari-muted">Teslim: 12 Eki</p>
        </Card>
      </div>
    );
  },
};
