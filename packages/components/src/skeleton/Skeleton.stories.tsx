/**
 * Faz 13.6: iskeletler gerçek içerikle BİREBİR aynı yerleşimde — "Yüklendi"
 * anahtarıyla geçişte hiçbir şey kaymamalı (CLS yok). Story seviyesinde
 * `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HeadphonesIcon, KeyboardIcon, WatchIcon, CameraIcon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Skeleton, SkeletonBlock } from "./Skeleton";
import { SkeletonButton } from "./SkeletonButton";
import { SkeletonInput } from "./SkeletonInput";
import { Switch } from "../switch";
import { Button } from "../button";
import { Tag } from "../tag";

const meta: Meta<typeof Skeleton> = {
  title: "Geri Bildirim/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "İçerik İLK KEZ yüklenirken sayfanın şeklini önceden gösteren yer tutucu. Hazır düzen (`avatar` + `title` + " +
            "`paragraph`), serbest parçalar (`SkeletonBlock`, `SkeletonButton`, `SkeletonInput`). `active` parıltı " +
            "animasyonu verir. İskeleti gerçek bileşenin ölçüleriyle kurun — yüklenince hiçbir şey kaymamalı.",
          whenToUse: ["Liste, kart ızgarası, profil gibi yapısı bilinen içerik ilk kez yüklenirken."],
          whenNotToUse: [
            "Var olan içerik GÜNCELLENİRKEN — `Loading` sarmalama modu (içerik kaybolmaz).",
            "300 ms'den kısa sürecek yüklemelerde — yanıp sönme yaratır; hiç göstermeyin.",
          ],
          a11y:
            "İskelet varsayılan olarak ekran okuyucudan gizli (`aria-hidden`) — 12 kart iskeleti 12 kez \"yükleniyor\" " +
            "okutmasın. Yüklenen bölgeye `aria-busy=\"true\"` verin ya da tek bir iskelete `label` vererek `role=\"status\"` " +
            "yapın. Parıltı `prefers-reduced-motion`'da durur.",
        }),
      },
    },
  },
  argTypes: {
    active: { control: "boolean", description: "Parıltı animasyonu. Varsayılan: `false`." },
    avatar: { control: "boolean" },
    title: { control: "boolean" },
    paragraph: { control: "object", description: "`{ rows, width }` ya da boolean." },
    round: { control: "boolean", description: "Satırlar tam yuvarlak." },
    loading: { control: "boolean", description: "`false` iken çocukları render eder." },
    label: { control: "text", description: "Verilirse `role=\"status\"` ile duyurulur." },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

function LoadedToggle({ loaded, onChange }: { loaded: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mb-5">
      <Switch checked={loaded} onChange={onChange} label="Yüklendi" size="sm" />
    </div>
  );
}

/* ─────────────────────────── 1. Ürün ızgarası ─────────────────────────── */

const products = [
  { name: "Kablosuz Kulaklık Pro", price: "2.499 ₺", Icon: HeadphonesIcon },
  { name: "Akıllı Saat S3 44 mm", price: "3.799 ₺", Icon: WatchIcon },
  { name: "Mekanik Klavye TKL", price: "1.899 ₺", Icon: KeyboardIcon },
  { name: "Aynasız Fotoğraf Makinesi", price: "32.499 ₺", Icon: CameraIcon },
];

export const ProductGrid: Story = {
  name: "Ürün Izgarası",
  ...storyDoc(
    "`SkeletonBlock` ile kartın gerçek ölçüleri: 4:3 kapak, iki satır isim, fiyat. \"Yüklendi\"yi aç/kapat — " +
      "ızgara yüksekliği değişmiyor. Bölge `aria-busy` taşıyor, iskeletler gizli.",
    `
<div aria-busy={loading} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
  {loading
    ? Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="rounded-lg border p-0">
          <SkeletonBlock active height="auto" className="aspect-[4/3]" radius="none" />
          <div className="space-y-2 p-3">
            <SkeletonBlock active height={14} />
            <SkeletonBlock active height={14} width="60%" />
            <SkeletonBlock active height={20} width="40%" className="mt-3" />
          </div>
        </div>
      ))
    : products.map((p) => <ProductCard key={p.id} {...p} />)}
</div>`
  ),
  render: () => {
    const [loaded, setLoaded] = useState(false);
    return (
      <div className="max-w-5xl">
        <LoadedToggle loaded={loaded} onChange={setLoaded} />
        <div aria-busy={!loaded} className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {products.map(({ name, price, Icon }) => (
            <div key={name} className="overflow-hidden rounded-lg border border-mari-border bg-mari-surface">
              {loaded ? (
                <>
                  <div className="flex aspect-[4/3] items-center justify-center bg-mari-surface-alt text-mari-primary">
                    <Icon size={48} strokeWidth={1.25} aria-hidden />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 h-10 text-sm leading-5 text-mari-foreground">{name}</p>
                    <p className="mt-3 h-5 text-base font-semibold leading-5 text-mari-foreground">{price}</p>
                  </div>
                </>
              ) : (
                <>
                  <SkeletonBlock active height="auto" radius="none" className="aspect-[4/3]" />
                  <div className="p-3">
                    <div className="flex h-10 flex-col justify-center gap-2">
                      <SkeletonBlock active height={12} />
                      <SkeletonBlock active height={12} width="60%" />
                    </div>
                    <SkeletonBlock active height={20} width="40%" className="mt-3" />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Tablo satırları ─────────────────────────── */

const rows = [
  { initials: "DK", name: "Deniz Kaya", email: "deniz@kuzey.com.tr", role: "Yönetici" },
  { initials: "AY", name: "Aykut Yılmaz", email: "aykut@kuzey.com.tr", role: "Geliştirici" },
  { initials: "EC", name: "Elif Can", email: "elif@kuzey.com.tr", role: "Tasarımcı" },
  { initials: "MY", name: "Mert Yıldız", email: "mert@kuzey.com.tr", role: "Destek" },
];

export const TableRows: Story = {
  name: "Liste / Tablo Satırları",
  ...storyDoc(
    "Satır iskeleti gerçek satırın yüksekliğinde (avatar 36px + iki satır metin). Hazır düzen: " +
      "`<Skeleton avatar={{ shape: \"circle\", size: 36 }} title={{ width: 160 }} paragraph={{ rows: 1, width: 220 }} />`.",
    `
<Skeleton active avatar={{ shape: "circle", size: 36 }} title={{ width: 160 }} paragraph={{ rows: 1, width: 220 }} />`
  ),
  render: () => {
    const [loaded, setLoaded] = useState(false);
    return (
      <div className="max-w-2xl">
        <LoadedToggle loaded={loaded} onChange={setLoaded} />
        <ul aria-busy={!loaded} className="divide-y divide-mari-border rounded-xl border border-mari-border bg-mari-surface">
          {rows.map((r) => (
            <li key={r.email} className="flex h-16 items-center gap-3 px-4">
              {loaded ? (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mari-primary-subtle text-xs font-semibold text-mari-primary-subtle-contrast">{r.initials}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-4 text-mari-foreground">{r.name}</p>
                    <p className="mt-1.5 text-xs leading-3 text-mari-muted">{r.email}</p>
                  </div>
                  <Tag>{r.role}</Tag>
                </>
              ) : (
                <>
                  <Skeleton active avatar={{ shape: "circle", size: 36 }} title={{ width: 140 }} paragraph={{ rows: 1, width: 200 }} className="flex-1 [&_.mt-4]:mt-2" />
                  <SkeletonBlock active width={72} height={20} radius="sm" />
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Form ─────────────────────────── */

export const FormSkeleton: Story = {
  name: "Form",
  ...storyDoc(
    "`SkeletonInput` ve `SkeletonButton` gerçek Input/Button yükseklikleriyle aynı (md: 32px) — eskiden input " +
      "iskeleti 40px'ti, yüklenince form 8px zıplıyordu.",
    `
<SkeletonBlock width={80} height={14} />
<SkeletonInput active />
<SkeletonButton active />`
  ),
  render: () => {
    const [loaded, setLoaded] = useState(false);
    return (
      <div className="max-w-sm">
        <LoadedToggle loaded={loaded} onChange={setLoaded} />
        <div aria-busy={!loaded} className="space-y-4 rounded-xl border border-mari-border bg-mari-surface p-5">
          {["Ad soyad", "E-posta"].map((label) => (
            <div key={label} className="flex flex-col gap-1.5">
              {loaded ? (
                <>
                  <span className="h-5 text-sm font-medium leading-5 text-mari-foreground">{label}</span>
                  <input className="h-8 rounded-md border border-mari-input bg-mari-surface px-3 text-sm" defaultValue="—" aria-label={label} />
                </>
              ) : (
                <>
                  <div className="flex h-5 items-center">
                    <SkeletonBlock active width={80} height={12} />
                  </div>
                  <SkeletonInput active />
                </>
              )}
            </div>
          ))}
          <div className="flex justify-end pt-1">{loaded ? <Button>Kaydet</Button> : <SkeletonButton active />}</div>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── Temel ─────────────────────────── */

export const Basic: Story = {
  name: "Hazır Düzen",
  ...storyDoc("`avatar` + `title` + `paragraph`; `active` parıltı, `round` yuvarlak satırlar.", `<Skeleton active avatar paragraph={{ rows: 3 }} />`),
  render: () => (
    <div className="grid max-w-3xl gap-8 sm:grid-cols-2">
      <Skeleton />
      <Skeleton active avatar />
      <Skeleton active avatar={{ shape: "square" }} round paragraph={{ rows: 2 }} />
      <Skeleton active title={false} paragraph={{ rows: 4, width: ["100%", "90%", "95%", "50%"] }} />
    </div>
  ),
};

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { active: true, avatar: true, title: true, round: false, paragraph: { rows: 3 } },
  render: (args) => (
    <div className="max-w-md">
      <Skeleton {...args} />
    </div>
  ),
};
