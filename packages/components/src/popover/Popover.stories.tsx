/**
 * Faz 16.2: gerçek senaryolar — bağlantı paylaşma (tıkla), kullanıcı kartı
 * (üzerine gel, veri yüklenirken iskelet), tablo sütun filtresi (form).
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckIcon, CopyIcon, FilterIcon, Share2Icon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Popover } from "./Popover";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Input } from "../input";
import { StatusBadge } from "../badge";

const meta: Meta<typeof Popover> = {
  title: "Veri Gösterimi/Popover",
  component: Popover,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      story: { height: "360px" },
      description: {
        component: componentDoc({
          summary:
            "Bir öğeye bağlı, başlık + etkileşimli içerik taşıyan yüzen panel (paylaşım bağlantısı, kısa form, kullanıcı " +
            "kartı). `trigger`: `click` (varsayılan), `hover`, `focus`. Konum, ok ve kenara çarpınca yön değiştirme Dropdown " +
            "ile aynı altyapı.",
          whenToUse: [
            "Sayfadan ayrılmadan küçük bir iş: bağlantıyı kopyala, sütunu filtrele, hızlı ayar.",
            "Bir öğe hakkında zengin bilgi (kullanıcı kartı) — `trigger=\"hover\"`.",
          ],
          whenNotToUse: [
            "Tek satırlık açıklama — Tooltip.",
            "Eylem listesi (Düzenle / Sil) — Dropdown menüsü.",
            "Kullanıcıyı durduran, dikkat isteyen iş — Modal.",
          ],
          a11y:
            "Tetikleyici `aria-expanded` + `aria-haspopup=\"dialog\"` + (açıkken) `aria-controls`; panel modal olmayan `role=\"dialog\"`, " +
            "başlık adıdır (yoksa `aria-label`). Tıklamayla açılınca odak panele geçer (`data-autofocus` → ilk alan); Escape kapatır " +
            "ve odak tetikleyiciye döner; panelin son öğesinden Tab kapatıp doğal sıradaki öğeye geçer; dışarı tıklama kapatır. " +
            "`hover` modunda klavye odağı da açar.",
        }),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    content: { control: false },
    children: { control: false },
    trigger: { control: "inline-radio", options: ["click", "hover", "focus"] },
    placement: { control: "select", options: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] },
    arrow: { control: "boolean" },
    open: { control: false },
    onOpenChange: { table: { category: "Olaylar" } },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

/* ─────────────────────────── 1. Paylaş ─────────────────────────── */

function ShareContent() {
  const [copied, setCopied] = useState(false);
  const url = "https://mari-ui.com/r/eylul-raporu";
  return (
    <div className="flex w-72 max-w-full flex-col gap-2">
      <p className="text-mari-muted">Bağlantıya sahip herkes raporu görüntüleyebilir.</p>
      <div className="flex gap-2">
        <Input aria-label="Paylaşım bağlantısı" value={url} readOnly size="sm" data-autofocus />
        <Button
          size="sm"
          variant="outline"
          color="neutral"
          icon={copied ? <CheckIcon size={14} aria-hidden /> : <CopyIcon size={14} aria-hidden />}
          onClick={() => {
            void navigator.clipboard?.writeText(url);
            setCopied(true);
          }}
        >
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Bağlantı kopyalandı" : ""}
      </span>
    </div>
  );
}

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { title: "Başlık", trigger: "click", placement: "top", arrow: true, skeleton: false },
  render: (args) => (
    <div className="flex min-h-64 items-center justify-center">
      <Popover {...args} content={<p className="w-56 text-mari-muted">Popover içeriği — düğme, form ya da bağlantı olabilir.</p>}>
        <Button>Aç</Button>
      </Popover>
    </div>
  ),
};

export const Share: Story = {
  name: "Bağlantı Paylaş (tıkla)",
  ...storyDoc(
    "Açılınca odak bağlantı alanına geçer (`data-autofocus`) — kullanıcı hemen seçip kopyalayabilir. Escape ya da dışarı " +
      "tıklama kapatır, odak düğmeye döner.",
    `
<Popover title="Raporu paylaş" placement="bottom-start" content={<ShareContent />}>
  <Button icon={<Share2Icon />}>Paylaş</Button>
</Popover>`
  ),
  render: () => (
    <Popover title="Raporu paylaş" placement="bottom-start" content={<ShareContent />}>
      <Button variant="outline" color="neutral" icon={<Share2Icon size={16} aria-hidden />}>
        Paylaş
      </Button>
    </Popover>
  ),
};

/* ─────────────────────────── 2. Kullanıcı kartı ─────────────────────────── */

/** Demo: veri 900ms sonra "gelir". */
function useLoadedAfter(ms: number) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loaded;
}

export const UserHoverCard: Story = {
  name: "Kullanıcı Kartı (üzerine gel, iskelet)",
  ...storyDoc(
    "`trigger=\"hover\"`: fare ile ya da klavyeyle odaklanınca açılır; panele geçerken kapanmaz. Veri gelene kadar " +
      "`skeleton` (içeriğin kendi şeklinde).",
    `
<Popover trigger="hover" placement="bottom-start" skeleton={loading} aria-label="Deniz Kaya profil kartı" content={<ProfileCard user={user} />}>
  <a href="/u/deniz">@deniz</a>
</Popover>`
  ),
  render: () => {
    const loaded = useLoadedAfter(900);
    return (
      <p className="text-sm text-mari-foreground">
        Görevi{" "}
        <Popover
          trigger="hover"
          placement="bottom-start"
          skeleton={!loaded}
          aria-label="Deniz Kaya profil kartı"
          content={
            <div className="flex w-64 gap-3">
              <Avatar alt="Deniz Kaya" size="lg" />
              <div className="min-w-0">
                <p className="font-semibold">Deniz Kaya</p>
                <p className="text-mari-muted">Ürün Tasarımcısı · İstanbul</p>
                <StatusBadge color="success" className="mt-2">
                  Çevrimiçi
                </StatusBadge>
              </div>
            </div>
          }
        >
          <a href="/u/deniz" onClick={(e) => e.preventDefault()} className="font-medium text-mari-primary underline-offset-2 hover:underline">
            @deniz
          </a>
        </Popover>{" "}
        üstlendi.
      </p>
    );
  },
};

/* ─────────────────────────── 3. Sütun filtresi ─────────────────────────── */

const statuses = ["Taslak", "İncelemede", "Yayında", "Arşiv"];

export const ColumnFilter: Story = {
  name: "Tablo Sütun Filtresi (form)",
  ...storyDoc(
    "Popover içinde küçük bir form; \"Uygula\" kapatır (kontrollü `open`). Tetikleyici aktif filtre sayısını da gösterir.",
    `
<Popover open={open} onOpenChange={setOpen} title="Duruma göre filtrele" placement="bottom-start" content={<FilterForm onApply={() => setOpen(false)} />}>
  <Button size="sm" icon={<FilterIcon />}>Durum {active.length ? \`(\${active.length})\` : ""}</Button>
</Popover>`
  ),
  render: () => {
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState<string[]>(["Yayında"]);
    const [draft, setDraft] = useState<string[]>(active);
    const toggle = (s: string) => setDraft((d) => (d.includes(s) ? d.filter((x) => x !== s) : [...d, s]));
    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(active);
          setOpen(next);
        }}
        title="Duruma göre filtrele"
        placement="bottom-start"
        content={
          <div className="flex w-56 flex-col gap-3 pt-1">
            <div className="flex flex-col gap-2">
              {statuses.map((s) => (
                <Checkbox key={s} label={s} checked={draft.includes(s)} onChange={() => toggle(s)} />
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-mari-border pt-3">
              <Button size="sm" variant="ghost" color="neutral" onClick={() => setDraft([])}>
                Temizle
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setActive(draft);
                  setOpen(false);
                }}
              >
                Uygula
              </Button>
            </div>
          </div>
        }
      >
        <Button size="sm" variant="outline" color="neutral" icon={<FilterIcon size={14} aria-hidden />}>
          Durum{active.length ? ` (${active.length})` : ""}
        </Button>
      </Popover>
    );
  },
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `
<Popover title="Deniz Kaya" content={<p>Ürün tasarımcısı · İstanbul</p>} skeleton>
  <Button variant="outline" color="neutral">Profili göster</Button>
</Popover>`),
  render: () => <SkeletonDemo>{(skeleton) => (
        <Popover title="Deniz Kaya" content={<p>Ürün tasarımcısı · İstanbul</p>} skeleton={skeleton}>
          <Button variant="outline" color="neutral">Profili göster</Button>
        </Popover>
      )}</SkeletonDemo>,
};
