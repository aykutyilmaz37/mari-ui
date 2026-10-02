/**
 * Faz 16.3: gerçek senaryolar — kargo takibi (ikonlar + bekleyen adım),
 * hesap etkinliği (en yeni üstte), sürüm geçmişi (solda tarih), ürün yol
 * haritası (alternate), proje aşamaları (yatay), iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CircleCheckIcon, KeyRoundIcon, LogInIcon, PackageIcon, ShieldAlertIcon, TruckIcon, WarehouseIcon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Timeline } from ".";
import type { TimelineItem } from ".";
import { Tag } from "../tag";

const meta: Meta<typeof Timeline> = {
  title: "Veri Gösterimi/Timeline",
  component: Timeline,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Olayları zaman sırasıyla bir ray üzerinde gösterir: her olayda kısa bir başlık (çoğunlukla zaman) ve içerik, " +
            "renkli ya da ikonlu bir nokta. `mode` içeriğin tarafını (start/end/alternate), `titlePlacement=\"opposite\"` " +
            "zamanı noktanın karşısına alır; `pending` süren son adımı, `reverse` en yeniyi üstte gösterir; " +
            "`orientation=\"horizontal\"` kısa süreçler için yatay.",
          whenToUse: [
            "Bir kaydın geçmişi: sipariş/kargo takibi, hesap etkinliği, değişiklik günlüğü, sürüm notları.",
            "Zamana bağlı bir plan: yol haritası, proje aşamaları.",
          ],
          whenNotToUse: [
            "Kullanıcının adım adım ilerlediği bir akış (sihirbaz, ödeme adımları) — Steps.",
            "Zamanı ikincil olan sıradan kayıt listesi — List.",
          ],
          a11y:
            "Sıra anlamlı olduğu için `<ol>`; görünür başlık yoksa `aria-label` verin (\"Sipariş geçmişi\"). Noktalar ve " +
            "ikonlar görseldir (`aria-hidden`) — renk tek başına anlam taşımaz, durumu (\"İptal edildi\") metinde yazın. " +
            "Tarihleri `<time dateTime>` ile verin. `alternate`/`opposite` düzenler dar ekranda (<640px) tek sütuna " +
            "düşer; DOM sırası her genişlikte aynıdır. Yatay yön taşarsa kaydırma alanı klavyeyle odaklanabilir.",
        }),
      },
    },
  },
  argTypes: {
    items: { control: false },
    mode: { control: "inline-radio", options: ["start", "end", "alternate"], table: { defaultValue: { summary: "start" } } },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"], table: { defaultValue: { summary: "vertical" } } },
    variant: { control: "inline-radio", options: ["outlined", "filled"], table: { defaultValue: { summary: "outlined" } } },
    titlePlacement: { control: "inline-radio", options: ["inline", "opposite"], table: { defaultValue: { summary: "inline" } } },
    reverse: { control: "boolean" },
    pending: { control: "text" },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Timeline>;

const shipment: TimelineItem[] = [
  { title: <time dateTime="2026-09-26T09:12">26 Eyl, 09:12</time>, content: "Siparişiniz alındı", icon: <CircleCheckIcon />, color: "success" },
  { title: <time dateTime="2026-09-26T14:40">26 Eyl, 14:40</time>, content: "Paketlendi — İstanbul deposu", icon: <PackageIcon /> },
  { title: <time dateTime="2026-09-27T08:05">27 Eyl, 08:05</time>, content: "Kargoya verildi (takip no: 7340 1182 55)", icon: <WarehouseIcon /> },
  { title: <time dateTime="2026-09-28T11:30">28 Eyl, 11:30</time>, content: "Transfer merkezinde — Ankara", icon: <TruckIcon /> },
];

/* ─────────────────────────── Playground ─────────────────────────── */

export const Playground: Story = {
  args: { items: shipment, mode: "start", orientation: "vertical", variant: "outlined", titlePlacement: "inline", reverse: false, pending: "Dağıtıma çıkacak" },
  render: (args) => (
    <div className="max-w-2xl">
      <Timeline aria-label="Kargo takibi" {...args} />
    </div>
  ),
};

/* ─────────────────────────── 1. Kargo takibi ─────────────────────────── */

export const ShipmentTracking: Story = {
  name: "Kargo Takibi (ikon + pending)",
  ...storyDoc(
    "Her adımın kendi ikonu (nokta yerine, en fazla 20px); `pending` henüz gerçekleşmemiş son adımı dönen gösterge ve " +
      "kesikli rayla ekler. Zamanlar `<time dateTime>` ile.",
    `
<Timeline
  aria-label="Kargo takibi"
  pending="Dağıtıma çıkacak"
  items={[
    { title: <time dateTime="2026-09-26T09:12">26 Eyl, 09:12</time>, content: "Siparişiniz alındı", icon: <CircleCheckIcon />, color: "success" },
    { title: <time dateTime="2026-09-26T14:40">26 Eyl, 14:40</time>, content: "Paketlendi — İstanbul deposu", icon: <PackageIcon /> },
    { title: …, content: "Kargoya verildi (takip no: 7340 1182 55)", icon: <WarehouseIcon /> },
    { title: …, content: "Transfer merkezinde — Ankara", icon: <TruckIcon /> },
  ]}
/>`
  ),
  render: () => (
    <div className="max-w-md">
      <Timeline aria-label="Kargo takibi" pending="Dağıtıma çıkacak" items={shipment} />
    </div>
  ),
};

/* ─────────────────────────── 2. Hesap etkinliği ─────────────────────────── */

const activity: TimelineItem[] = [
  { title: "22 Eyl, 18:02", content: "Şifre değiştirildi", color: "info" },
  { title: "24 Eyl, 09:15", content: "Yeni cihazdan giriş — MacBook Pro, İstanbul", color: "neutral" },
  {
    title: "27 Eyl, 02:41",
    content: (
      <>
        Başarısız giriş denemesi (5 kez) — Frankfurt, DE <Tag color="error">Engellendi</Tag>
      </>
    ),
    color: "error",
  },
  { title: "28 Eyl, 10:20", content: "İki adımlı doğrulama açıldı", color: "success" },
];

export const AccountActivity: Story = {
  name: "Hesap Etkinliği (reverse, filled)",
  ...storyDoc(
    "`reverse`: en yeni olay en üstte (veriniz eskiden yeniye sıralıysa). `variant=\"filled\"` dolu noktalar. Renk bir " +
      "ipucudur; durum metinde de yazar (\"Engellendi\").",
    `<Timeline aria-label="Hesap etkinliği" reverse variant="filled" items={activity} />`
  ),
  render: () => (
    <div className="max-w-lg">
      <Timeline aria-label="Hesap etkinliği" reverse variant="filled" items={activity} />
    </div>
  ),
};

/* ─────────────────────────── 3. Sürüm geçmişi ─────────────────────────── */

const releases: TimelineItem[] = [
  { title: <time dateTime="2026-09-29">29 Eyl 2026</time>, content: <Release version="2.4.0" text="List, Accordion ve Timeline eklendi." tag="Yeni" /> },
  { title: <time dateTime="2026-09-18">18 Eyl 2026</time>, content: <Release version="2.3.1" text="Select'te dokunmatik kaydırma düzeltmesi." tag="Düzeltme" /> },
  { title: <time dateTime="2026-09-02">2 Eyl 2026</time>, content: <Release version="2.3.0" text="Yoğunluk (radius) önayarları; tüm component'lerde skeleton." tag="Yeni" /> },
];

function Release({ version, text, tag }: { version: string; text: string; tag: "Yeni" | "Düzeltme" }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">v{version}</span>
        <Tag color={tag === "Yeni" ? "primary" : "neutral"}>{tag}</Tag>
      </div>
      <p className="text-mari-muted">{text}</p>
    </div>
  );
}

export const Changelog: Story = {
  name: "Sürüm Geçmişi (tarih karşıda)",
  ...storyDoc(
    "`titlePlacement=\"opposite\"`: tarih noktanın solunda, sürüm notu sağında. Dar ekranda tarih notun üstüne geçer.",
    `<Timeline aria-label="Sürüm geçmişi" titlePlacement="opposite" items={releases} />`
  ),
  render: () => (
    <div className="max-w-2xl">
      <Timeline aria-label="Sürüm geçmişi" titlePlacement="opposite" items={releases} />
    </div>
  ),
};

/* ─────────────────────────── 4. Yol haritası ─────────────────────────── */

const roadmap: TimelineItem[] = [
  { title: "2026 Ç3", content: "Faz 16 — yeni component'ler (Select, Popover, Timeline…)", color: "success" },
  { title: "2026 Ç4", content: "Tarih/saat seçiciler ve Tema Yapıcı", color: "primary" },
  { title: "2027 Ç1", content: "Tüketici projeler için AI kuralları, Figma eşlemesi", color: "neutral" },
  { title: "2027 Ç2", content: "React Native: form ve veri gösterimi dalgası", color: "neutral" },
];

export const Roadmap: Story = {
  name: "Yol Haritası (alternate)",
  ...storyDoc(
    "`mode=\"alternate\"`: içerik sırayla ray'in iki yanına; başlık (çeyrek) içeriğin üstünde. Dar ekranda tek sütun.",
    `<Timeline aria-label="Yol haritası" mode="alternate" items={roadmap} />`
  ),
  render: () => (
    <div className="max-w-3xl">
      <Timeline aria-label="Yol haritası" mode="alternate" items={roadmap} />
    </div>
  ),
};

/* ─────────────────────────── 5. Yatay ─────────────────────────── */

export const Horizontal: Story = {
  name: "Proje Aşamaları (yatay)",
  ...storyDoc(
    "`orientation=\"horizontal\"`: kısa süreçler için olaylar yan yana; her olay en az 144px, sığmazsa yatay kaydırılır " +
      "(kaydırma alanı klavyeyle odaklanır).",
    `<Timeline aria-label="Proje aşamaları" orientation="horizontal" pending="Yayın" items={phases} />`
  ),
  render: () => (
    <div className="max-w-4xl">
      <Timeline
        aria-label="Proje aşamaları"
        orientation="horizontal"
        pending="Yayın — 14 Eki"
        items={[
          { title: "2 Eyl", content: "Keşif ve gereksinimler", color: "success", icon: <CircleCheckIcon /> },
          { title: "9 Eyl", content: "Tasarım ve prototip", color: "success", icon: <CircleCheckIcon /> },
          { title: "23 Eyl", content: "Geliştirme", color: "primary" },
          { title: "7 Eki", content: "Test ve düzeltmeler", color: "neutral" },
        ]}
      />
    </div>
  ),
};

/* ─────────────────────────── 6. end ─────────────────────────── */

export const EndMode: Story = {
  name: "Sağa Hizalı (end)",
  ...storyDoc(
    "`mode=\"end\"`: nokta sağda, içerik sola hizalı — sağ kenardaki bir panelde ya da RTL'ye yakın düzenlerde.",
    `<Timeline aria-label="Güvenlik olayları" mode="end" items={…} />`
  ),
  render: () => (
    <div className="max-w-sm">
      <Timeline
        aria-label="Güvenlik olayları"
        mode="end"
        items={[
          { title: "Bugün, 09:41", content: "Oturum açıldı", icon: <LogInIcon /> },
          { title: "Dün, 22:10", content: "API anahtarı oluşturuldu", icon: <KeyRoundIcon />, color: "info" },
          { title: "25 Eyl", content: "Şüpheli giriş engellendi", icon: <ShieldAlertIcon />, color: "error" },
        ]}
      />
    </div>
  ),
};

/* ─────────────────────────── 7. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton`: noktalar ve her olayın metni kendi şeklinde yer tutucuya döner; ray görünür kalır, yüklenince " +
      "yükseklik değişmez.",
    `<Timeline skeleton={loading} aria-label="Kargo takibi" items={shipment} />`
  ),
  render: () => (
    <SkeletonDemo className="w-full max-w-md">
      {(skeleton) => <Timeline skeleton={skeleton} aria-label="Kargo takibi" pending="Dağıtıma çıkacak" items={shipment} />}
    </SkeletonDemo>
  ),
};
