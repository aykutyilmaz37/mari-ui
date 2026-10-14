/**
 * Faz 16.2: gerçek senaryolar — görev listesinde satır silme (async,
 * yıkıcı), taslağı yayınlama (yıkıcı değil), yetkisizken devre dışı.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SendIcon, Trash2Icon } from "lucide-react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Popconfirm } from "./Popconfirm";
import { Button } from "../button";
import { StatusBadge } from "../badge";

const meta: Meta<typeof Popconfirm> = {
  title: "Geri Bildirim/Popconfirm",
  component: Popconfirm,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "340px" },
      description: {
        component: componentDoc({
          summary:
            "Bir eylemin hemen yanında, sayfayı karartmadan \"emin misiniz?\" — soru (`title`), sonucu açıklayan kısa metin " +
            "(`description`), Vazgeç / onay. `onConfirm` Promise dönerse onay düğmesi yükleniyor ve panel iş bitene kadar açık " +
            "kalır; hata olursa açık kalır. Popover üstüne kurulu.",
          whenToUse: ["Tek bir öğeyi etkileyen, geri alınması zahmetli küçük eylemler: satırı sil, bağlantıyı iptal et, yayınla."],
          whenNotToUse: [
            "Geri alınamaz, geniş etkili işler (projeyi sil) — Modal (adı yazdırma gibi ek güvenceyle).",
            "Geri alınabilir işler — onay sormadan yapın, Toast'ta \"Geri al\" verin.",
          ],
          a11y:
            "`role=\"alertdialog\"`: soru adı, açıklama `aria-describedby`. Yıkıcı onayda (`error`/`warning`) ilk odak \"Vazgeç\"te " +
            "— Enter'a basan kullanıcı yanlışlıkla onaylamaz; diğerlerinde onay düğmesinde. Escape ve Vazgeç kapatır, odak " +
            "tetikleyiciye döner. Yükleniyorken onay düğmesi `aria-busy`. Onay tetikleyiciyi DOM'dan kaldırıyorsa (satır " +
            "silme) odağı sayfa bir sonraki mantıklı öğeye taşımalı — bkz. \"Görev Silme\".",
        }),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    okText: { control: "text" },
    cancelText: { control: "text" },
    color: { ...colorArgType, description: "Varsayılan: `warning`. `error`/`warning` yıkıcı: ilk odak Vazgeç'te." },
    placement: { control: "select", options: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] },
    disabled: { control: "boolean" },
    onConfirm: { table: { category: "Olaylar" } },
    onCancel: { table: { category: "Olaylar" } },
    children: { control: false },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Popconfirm>;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const STATUS_COLOR = { Tamamlandı: "success", Beklemede: "warning", "Devam ediyor": "info" } as const;

/* ─────────────────────────── 1. Satır silme ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { title: "Bu bağlantı iptal edilsin mi?", description: "Bağlantıyı kullanan herkes erişimini kaybeder.", okText: "İptal et", cancelText: "Vazgeç", color: "warning", placement: "top", disabled: false, skeleton: false },
  render: (args) => (
    <div className="flex min-h-56 items-center justify-center">
      <Popconfirm {...args}>
        <Button variant="outline" color="neutral">
          Bağlantıyı iptal et
        </Button>
      </Popconfirm>
    </div>
  ),
};

export const DeleteRow: Story = {
  name: "Görev Silme (async, yıkıcı)",
  ...storyDoc(
    "Satırdaki çöp kutusu. Soru neyin silineceğini adıyla söyler; açıklama sonucu. `onConfirm` sunucuya gider (1 sn) — o " +
      "sırada \"Sil\" yükleniyor, panel açık; bitince satır kalkar. Tetikleyici satırla birlikte silindiği için odağı " +
      "sayfa taşımalı (burada: sonraki satırın Sil düğmesi) — yoksa klavye kullanıcısı sayfanın başına düşer.",
    `
<Popconfirm
  color="error"
  title={\`"\${task.name}" silinsin mi?\`}
  description="Alt görevleri ve yorumları da silinir."
  okText="Sil"
  onConfirm={() => api.deleteTask(task.id)}
  placement="left"
>
  <Button size="sm" variant="ghost" color="neutral" shape="circle" aria-label={\`Sil: \${task.name}\`} icon={<Trash2Icon />} />
</Popconfirm>`
  ),
  render: () => {
    const [tasks, setTasks] = useState<Array<{ id: number; name: string; status: keyof typeof STATUS_COLOR }>>([
      { id: 1, name: "Ödeme sayfası tasarımı", status: "Devam ediyor" },
      { id: 2, name: "Kargo entegrasyonu", status: "Beklemede" },
      { id: 3, name: "Kampanya e-postası", status: "Tamamlandı" },
    ]);
    const listRef = useRef<HTMLUListElement>(null);
    const focusIndex = useRef<number | null>(null);
    // Tetikleyici (silinen satırın düğmesi) DOM'dan kalktığı için odak geri dönecek yer kalmaz → <body>'ye
    // düşerdi. Silince odak sonraki satırın (sondaysa öncekinin) Sil düğmesine, liste boşalınca listeye.
    useEffect(() => {
      if (focusIndex.current === null) return;
      const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>("button[aria-label^='Sil:']") ?? [];
      (buttons[Math.min(focusIndex.current, buttons.length - 1)] ?? listRef.current)?.focus();
      focusIndex.current = null;
    }, [tasks]);
    const remove = async (id: number) => {
      await wait(1000);
      focusIndex.current = tasks.findIndex((x) => x.id === id);
      setTasks((t) => t.filter((x) => x.id !== id));
    };
    return (
      <ul ref={listRef} tabIndex={-1} aria-label="Görevler" className="max-w-lg divide-y divide-mari-border rounded-xl border border-mari-border bg-mari-surface outline-none">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="min-w-0 flex-1 truncate text-sm text-mari-foreground">{task.name}</span>
            <StatusBadge color={STATUS_COLOR[task.status]}>{task.status}</StatusBadge>
            <Popconfirm
              color="error"
              title={`"${task.name}" silinsin mi?`}
              description="Alt görevleri ve yorumları da silinir."
              okText="Sil"
              placement="left"
              onConfirm={() => remove(task.id)}
            >
              <Button size="sm" variant="ghost" color="neutral" shape="circle" aria-label={`Sil: ${task.name}`} icon={<Trash2Icon size={16} aria-hidden />} />
            </Popconfirm>
          </li>
        ))}
        {tasks.length === 0 && <li className="px-4 py-6 text-center text-sm text-mari-muted">Görev kalmadı.</li>}
      </ul>
    );
  },
};

/* ─────────────────────────── 2. Yayınla ─────────────────────────── */

export const Publish: Story = {
  name: "Yayınla (yıkıcı değil) ve Yetkisiz",
  ...storyDoc(
    "`color=\"primary\"`: yıkıcı değil → ilk odak onayda. Yetki yoksa `disabled`: Popconfirm açılmaz, düğme kendi " +
      "`disabled`ıyla pasif.",
    `
<Popconfirm color="primary" title="Taslak yayınlansın mı?" description="Aboneler e-posta ile bilgilendirilir." okText="Yayınla" onConfirm={publish}>
  <Button icon={<SendIcon />}>Yayınla</Button>
</Popconfirm>`
  ),
  render: () => {
    const [published, setPublished] = useState(false);
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Popconfirm color="primary" title="Taslak yayınlansın mı?" description="1.240 aboneye e-posta ile bildirilir." okText="Yayınla" onConfirm={() => setPublished(true)} placement="bottom-start">
          <Button icon={<SendIcon size={16} aria-hidden />} disabled={published}>
            {published ? "Yayında" : "Yayınla"}
          </Button>
        </Popconfirm>
        <Popconfirm disabled title="Sil?">
          <Button variant="outline" color="error" disabled>
            Sil (yetkiniz yok)
          </Button>
        </Popconfirm>
      </div>
    );
  },
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `
<Popconfirm title="Bu bağlantı iptal edilsin mi?" description="Bağlantıyı kullanan herkes erişimini kaybeder." okText="İptal et" color="warning" skeleton>
  <Button variant="outline" color="warning">Bağlantıyı iptal et</Button>
</Popconfirm>`),
  render: () => <SkeletonDemo>{(skeleton) => (
        <Popconfirm title="Bu bağlantı iptal edilsin mi?" description="Bağlantıyı kullanan herkes erişimini kaybeder." okText="İptal et" color="warning" skeleton={skeleton} onConfirm={() => undefined}>
          <Button variant="outline" color="warning">Bağlantıyı iptal et</Button>
        </Popconfirm>
      )}</SkeletonDemo>,
};
