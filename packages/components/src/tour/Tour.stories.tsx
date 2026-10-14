/**
 * Faz 16.6: gerçek senaryolar — yeni kullanıcı turu (proje paneli: ortada
 * karşılama + 3 hedefli adım), karartmasız "yeni özellik" ipucu.
 * Story seviyesinde `parameters` YAZMAYIN.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BellIcon, FilterIcon, PlusIcon, SparklesIcon } from "lucide-react";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Button } from "../button";
import { Input } from "../input";
import { Tour } from "./Tour";

const meta: Meta<typeof Tour> = {
  title: "Navigasyon/Tour",
  component: Tour,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "32rem" },
      description: {
        component: componentDoc({
          summary:
            "Arayüzü adım adım tanıtan rehber. Her adım bir öğeyi vurgular (sayfa kararır, hedefin çevresi açık kalır) ve yanında " +
            "başlık, açıklama ve isteğe bağlı görsel taşıyan bir panel açar; hedefsiz adım ekranın ortasında (karşılama). Adım " +
            "noktaları, Geri/Sonraki/Bitir, ←/→ kısayolu. Hedef görünür alanda değilse oraya kaydırılır.",
          whenToUse: ["İlk girişte ana özellikleri tanıtmak.", "Yeni bir özelliği yerinde göstermek (tek adım, karartmasız)."],
          whenNotToUse: [
            "Kalıcı bilgi — tur bir kez görülür; ihtiyaç anında bulunacak yardım için Tooltip ya da yardım sayfası.",
            "Uzun açıklamalar — adımları kısa tutun (en fazla 4-5 adım).",
          ],
          a11y:
            "Panel `role=\"dialog\"`; karartmalıyken modal: odak \"Sonraki\"de açılır ve panelde döner, Escape kapatır, kapanınca " +
            "odak turu başlatan öğeye döner. Adım değişince \"Adım 2 / 4: başlık\" ve açıklama `aria-live` ile okunur; odak düğmede " +
            "kalır. Karartma ekran okuyucudan gizli. Hareket azaltma tercihinde kaydırma ve geçişler anlık.",
        }),
      },
    },
  },
  argTypes: {
    steps: { control: false },
    onOpenChange: { table: { category: "Olaylar" } },
    onChange: { table: { category: "Olaylar" } },
    onClose: { table: { category: "Olaylar" } },
    onFinish: { table: { category: "Olaylar" } },
    mask: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    arrow: { control: "boolean", table: { defaultValue: { summary: "true" } } },
  },
};

export default meta;
type Story = StoryObj<typeof Tour>;

export const Playground: Story = {
  ...storyDoc(
    "İki adımlı örnek tur; kontrollerden karartma (`mask`), ok (`arrow`) ve diğerleri.",
    (args) => `
const [open, setOpen] = useState(false);
const targetRef = useRef<HTMLButtonElement>(null);

<Button onClick={() => setOpen(true)}>Turu başlat</Button>
<Button ref={targetRef} variant="outline" color="neutral">Hedef düğme</Button>
<Tour
  ${jsxProps(args, { skip: ["open", "steps"] })}
  open={open}
  onOpenChange={setOpen}
  steps={[
    { title: "Hoş geldiniz", description: "Ortada açılan karşılama adımı." },
    { title: "Hedef", description: "Bu adım bir öğeyi vurgular.", target: () => targetRef.current },
  ]}
/>`
  ),
  args: { mask: true, arrow: true },
  render: (args) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);
    return (
      <div className="flex gap-3">
        <Button onClick={() => setOpen(true)}>Turu başlat</Button>
        <Button ref={ref} variant="outline" color="neutral">
          Hedef düğme
        </Button>
        <Tour
          {...args}
          open={open}
          onOpenChange={setOpen}
          steps={[{ title: "Hoş geldiniz", description: "Ortada açılan karşılama adımı." }, { title: "Hedef", description: "Bu adım bir öğeyi vurgular.", target: () => ref.current }]}
        />
      </div>
    );
  },
};

/* ─────────────────────────── 1. Yeni kullanıcı turu ─────────────────────────── */

export const Onboarding: Story = {
  name: "Yeni Kullanıcı Turu",
  ...storyDoc(
    "İlk adım hedefsiz (ortada karşılama, görsel), sonrakiler arayüz öğelerini vurgular. Hedefler `ref` ile verilir; adım " +
      "metinleri kısa. Son adımda \"Bitir\" → `onFinish` (ör. \"tur görüldü\" bilgisini kaydedin).",
    `const [open, setOpen] = useState(false);
const newRef = useRef<HTMLButtonElement>(null);
const searchRef = useRef<HTMLDivElement>(null);
const bellRef = useRef<HTMLButtonElement>(null);

<Button ref={newRef} size="sm" icon={<PlusIcon size={16} />}>Yeni proje</Button>
<div ref={searchRef}>
  <Input size="sm" aria-label="Projelerde ara" placeholder="Ara" />
</div>
<Button ref={bellRef} size="sm" variant="ghost" color="neutral" aria-label="Bildirimler" icon={<BellIcon size={16} />} />
<Button onClick={() => setOpen(true)}>Turu başlat</Button>

<Tour
  open={open}
  onOpenChange={setOpen}
  onFinish={() => localStorage.setItem("tour-seen", "1")}
  steps={[
    {
      title: "mari-ui'ya hoş geldiniz",
      description: "Bir dakikada temel adımları gösterelim.",
      cover: <div aria-hidden className="grid h-28 place-items-center bg-mari-primary-subtle text-mari-primary"><SparklesIcon size={40} /></div>,
      nextButtonText: "Başlayalım",
    },
    { title: "Proje oluşturun", description: "Her iş bir projede toplanır: görevler, dosyalar ve ekip.", target: () => newRef.current },
    { title: "Arayın ve filtreleyin", description: "Ada, sahibine ya da duruma göre projeleri daraltın.", target: () => searchRef.current, placement: "bottom-start" },
    { title: "Bildirimler", description: "Size atanan görevler ve yorumlar burada.", target: () => bellRef.current, placement: "bottom-end" },
  ]}
/>`
  ),
  render: () => {
    const [open, setOpen] = useState(false);
    const [seen, setSeen] = useState(false);
    const newRef = useRef<HTMLButtonElement>(null);
    const searchRef = useRef<HTMLDivElement>(null);
    const bellRef = useRef<HTMLButtonElement>(null);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-mari-border bg-mari-surface p-3">
          <span className="mr-2 font-semibold">Projeler</span>
          <Button ref={newRef} size="sm" icon={<PlusIcon size={16} />}>
            Yeni proje
          </Button>
          <div ref={searchRef} className="flex min-w-0 flex-1 items-center gap-2">
            <Input size="sm" aria-label="Projelerde ara" placeholder="Ara" className="max-w-56" />
            <Button size="sm" variant="outline" color="neutral" icon={<FilterIcon size={16} />}>
              Filtre
            </Button>
          </div>
          <Button ref={bellRef} size="sm" variant="ghost" color="neutral" aria-label="Bildirimler" icon={<BellIcon size={16} />} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {["Mobil uygulama", "Web sitesi yenileme", "Kampanya Q4"].map((p) => (
            <div key={p} className="rounded-lg border border-mari-border bg-mari-surface p-4 text-sm">
              <p className="font-medium">{p}</p>
              <p className="text-mari-muted">3 görev açık</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setOpen(true)}>Turu başlat</Button>
          {seen && <span className="text-sm text-mari-muted">Tur tamamlandı.</span>}
        </div>
        <Tour
          open={open}
          onOpenChange={setOpen}
          onFinish={() => setSeen(true)}
          steps={[
            {
              title: "mari-ui'ya hoş geldiniz",
              description: "Bir dakikada temel adımları gösterelim.",
              cover: (
                <div aria-hidden className="grid h-28 place-items-center bg-mari-primary-subtle text-mari-primary">
                  <SparklesIcon size={40} />
                </div>
              ),
              nextButtonText: "Başlayalım",
            },
            { title: "Proje oluşturun", description: "Her iş bir projede toplanır: görevler, dosyalar ve ekip.", target: () => newRef.current },
            { title: "Arayın ve filtreleyin", description: "Ada, sahibine ya da duruma göre projeleri daraltın.", target: () => searchRef.current, placement: "bottom-start" },
            { title: "Bildirimler", description: "Size atanan görevler ve yorumlar burada.", target: () => bellRef.current, placement: "bottom-end" },
          ]}
        />
      </div>
    );
  },
};

/* ─────────────────────────── 2. Yeni özellik ipucu ─────────────────────────── */

export const FeatureHint: Story = {
  name: "Yeni Özellik İpucu (Karartmasız)",
  ...storyDoc(
    "Tek adım, `mask={false}`: sayfa kullanılabilir kalır, tur modal değildir. Hafif bir \"yeni\" duyurusu için.",
    `const filterRef = useRef<HTMLButtonElement>(null);

<Button ref={filterRef} variant="outline" color="neutral" icon={<FilterIcon size={16} />}>Akıllı filtre</Button>
<Tour
  mask={false}
  defaultOpen
  steps={[{ title: "Yeni: Akıllı filtreler", description: "Sık kullandığınız filtreleri kaydedin, tek tıkla uygulayın.", target: () => filterRef.current, nextButtonText: "Anladım" }]}
/>`
  ),
  render: () => {
    const ref = useRef<HTMLButtonElement>(null);
    const [open, setOpen] = useState(true);
    return (
      <div className="flex flex-col items-start gap-24">
        <Button ref={ref} variant="outline" color="neutral" icon={<FilterIcon size={16} />}>
          Akıllı filtre
        </Button>
        {!open && (
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            İpucunu yeniden göster
          </Button>
        )}
        <Tour
          mask={false}
          open={open}
          onOpenChange={setOpen}
          steps={[{ title: "Yeni: Akıllı filtreler", description: "Sık kullandığınız filtreleri kaydedin, tek tıkla uygulayın.", target: () => ref.current, nextButtonText: "Anladım" }]}
        />
      </div>
    );
  },
};

/* ─────────────────────────── İskelet ─────────────────────────── */

function SkeletonOverlayDemo({ skeleton }: Readonly<{ skeleton: boolean }>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Turu başlat</Button>
      <Tour open={open} onOpenChange={setOpen} skeleton={skeleton} steps={[{ title: "Raporlar", description: "Aylık özetler burada." }, { title: "Paylaşım", description: "Raporu ekibinizle paylaşın." }]} />
    </>
  );
}

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Tour open steps={steps} skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <SkeletonOverlayDemo skeleton={skeleton} />}</SkeletonDemo>,
};
