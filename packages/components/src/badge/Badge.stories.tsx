/**
 * Faz 16.2: gerçek senaryolar — üst çubukta bildirim/sepet sayacı, avatarda
 * çevrimiçi noktası, sipariş tablosunda durum rozeti, menüde "Yeni".
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BellIcon, InboxIcon, MessageSquareIcon, SettingsIcon, ShoppingCartIcon } from "lucide-react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Badge, StatusBadge } from "./Badge";
import { Avatar } from "../avatar";
import { Button } from "../button";

const meta: Meta<typeof Badge> = {
  title: "Veri Gösterimi/Badge",
  component: Badge,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir öğenin köşesinde sayı ya da nokta (okunmamış bildirim, sepetteki ürün) — `children` yoksa satır içinde tek " +
            "başına (\"Yeni\"). `overflowCount` üstü \"99+\", `0` varsayılan olarak gizli. `StatusBadge`: renkli nokta + metin " +
            "(tabloda sipariş/kullanıcı durumu); `processing` süren işlem için nabız atar.",
          whenToUse: [
            "Bir yerde bekleyen/yeni bir şey olduğunu sayıyla ya da noktayla göstermek.",
            "Tablo ve listelerde kısa durum (`StatusBadge`).",
          ],
          whenNotToUse: [
            "Kullanıcının seçtiği/sildiği etiketler, kategoriler — Tag.",
            "Uzun açıklama gerektiren durum mesajı — Alert.",
          ],
          a11y:
            "Kabarcık görseldir (`aria-hidden`): sarılan düğmenin yanında ayrı okunan bir \"3\" anlamsız olur. Sayıyı düğmenin " +
            "adına katın (`aria-label=\"Bildirimler, 3 okunmamış\"`) ya da `label` verin (gizli metin). `StatusBadge`'de renk " +
            "tek başına anlam taşımaz — metin her zaman görünür. Nabız animasyonu hareket azaltma tercihinde durur.",
        }),
      },
    },
  },
  argTypes: {
    count: { control: "text" },
    overflowCount: { control: "number", description: "Bu sayının üstü \"N+\". Varsayılan: `99`." },
    showZero: { control: "boolean" },
    dot: { control: "boolean" },
    color: { ...colorArgType, description: "Varsayılan: `error`." },
    size: { control: "inline-radio", options: ["sm", "md"] },
    label: { control: "text", description: "Ekran okuyucu metni (\"3 okunmamış bildirim\")." },
    children: { control: false },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

/* ─────────────────────────── 1. Üst çubuk ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { count: 5, overflowCount: 99, showZero: false, dot: false, color: "error", size: "md", skeleton: false },
  render: (args) => (
    <Badge {...args}>
      <Avatar alt="Deniz Kaya" size="lg" />
    </Badge>
  ),
};

export const AppBar: Story = {
  name: "Üst Çubuk: Bildirim ve Sepet",
  ...storyDoc(
    "Sayı düğmenin ADINA katılır (\"Bildirimler, 3 okunmamış\") — ekran okuyucu tek parça okur. Sepete ekledikçe sayaç " +
      "artar; 99'dan sonra \"99+\". Okunmamış mesaj varlığı için sayı yerine nokta.",
    `
<Badge count={unread}>
  <Button variant="ghost" color="neutral" shape="circle" aria-label={\`Bildirimler, \${unread} okunmamış\`} icon={<BellIcon />} />
</Badge>
<Badge dot color="primary">
  <Button … aria-label="Mesajlar, yeni mesaj var" icon={<MessageSquareIcon />} />
</Badge>`
  ),
  render: () => {
    const [unread, setUnread] = useState(3);
    const [cart, setCart] = useState(97);
    return (
      <div className="flex max-w-xl flex-wrap items-center justify-between gap-4 rounded-xl border border-mari-border bg-mari-surface px-4 py-3">
        <span className="font-semibold text-mari-foreground">mari-ui Store</span>
        <div className="flex items-center gap-3">
          <Badge dot color="primary">
            <Button variant="ghost" color="neutral" shape="circle" aria-label="Mesajlar, yeni mesaj var" icon={<MessageSquareIcon size={18} aria-hidden />} />
          </Badge>
          <Badge count={unread}>
            <Button
              variant="ghost"
              color="neutral"
              shape="circle"
              aria-label={unread ? `Bildirimler, ${unread} okunmamış` : "Bildirimler"}
              icon={<BellIcon size={18} aria-hidden />}
              onClick={() => setUnread(0)}
            />
          </Badge>
          <Badge count={cart} color="primary">
            <Button variant="ghost" color="neutral" shape="circle" aria-label={`Sepet, ${cart} ürün`} icon={<ShoppingCartIcon size={18} aria-hidden />} />
          </Badge>
          <Button size="sm" variant="outline" color="neutral" onClick={() => setCart((c) => c + 1)}>
            Sepete ekle
          </Button>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Avatar ─────────────────────────── */

export const AvatarPresence: Story = {
  name: "Avatarda Çevrimiçi Durumu",
  ...storyDoc(
    "`dot` + `offset`: daire avatarda nokta köşenin biraz içine kaydırılır. Durum metnin kendisinde de var (renk tek başına " +
      "yetmez).",
    `<Badge dot color="success" offset={[-2, 2]}><Avatar alt="Deniz Kaya" /></Badge>`
  ),
  render: () => (
    <ul className="max-w-xs divide-y divide-mari-border rounded-xl border border-mari-border bg-mari-surface">
      {[
        { name: "Deniz Kaya", online: true },
        { name: "Elif Can", online: true },
        { name: "Mert Özdemir", online: false },
      ].map((p) => (
        <li key={p.name} className="flex items-center gap-3 px-4 py-3">
          <Badge dot color={p.online ? "success" : "neutral"} offset={[-2, 2]}>
            <Avatar alt={p.name} />
          </Badge>
          <span className="flex-1 text-sm font-medium text-mari-foreground">{p.name}</span>
          <span className="text-xs text-mari-muted">{p.online ? "Çevrimiçi" : "Çevrimdışı"}</span>
        </li>
      ))}
    </ul>
  ),
};

/* ─────────────────────────── 3. Durum rozeti ─────────────────────────── */

export const OrderStatus: Story = {
  name: "Sipariş Durumu (StatusBadge)",
  ...storyDoc(
    "Tabloda kısa durum. `processing`: süren işlem (kargolanıyor) nabız atar.",
    `
<StatusBadge color="success">Teslim edildi</StatusBadge>
<StatusBadge color="info" processing>Kargoda</StatusBadge>
<StatusBadge color="error">İptal edildi</StatusBadge>`
  ),
  render: () => (
    <div className="max-w-lg overflow-x-auto rounded-xl border border-mari-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-mari-surface-alt text-mari-muted">
          <tr>
            <th className="px-4 py-2.5 font-medium">Sipariş</th>
            <th className="px-4 py-2.5 font-medium">Tutar</th>
            <th className="px-4 py-2.5 font-medium">Durum</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-mari-border">
          {[
            ["#10482", "2.197,00 ₺", <StatusBadge key="s" color="success">Teslim edildi</StatusBadge>],
            ["#10481", "349,90 ₺", <StatusBadge key="s" color="info" processing>Kargoda</StatusBadge>],
            ["#10479", "1.050,00 ₺", <StatusBadge key="s" color="warning">Ödeme bekleniyor</StatusBadge>],
            ["#10477", "89,00 ₺", <StatusBadge key="s" color="error">İptal edildi</StatusBadge>],
          ].map(([id, total, status]) => (
            <tr key={String(id)}>
              <td className="px-4 py-3 font-medium text-mari-foreground">{id}</td>
              <td className="px-4 py-3 tabular-nums">{total}</td>
              <td className="px-4 py-3">{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
};

/* ─────────────────────────── 4. Menüde ─────────────────────────── */

export const InMenu: Story = {
  name: "Menüde Sayı ve \"Yeni\"",
  ...storyDoc(
    "`children` olmadan satır içinde: yan menüde gelen kutusu sayısı, yeni özellik etiketi. Satırın metni sayıyı da içerirse " +
      "(`label`) ekran okuyucu \"Gelen kutusu, 12 okunmamış\" okur.",
    `<Badge count={12} color="primary" label="12 okunmamış" />
<Badge count="Yeni" color="success" size="sm" />`
  ),
  render: () => (
    <nav aria-label="Posta" className="w-60 rounded-xl border border-mari-border bg-mari-surface p-2">
      {[
        { icon: <InboxIcon size={16} aria-hidden />, label: "Gelen kutusu", href: "/posta/gelen", badge: <Badge count={12} color="primary" label="12 okunmamış" /> },
        { icon: <MessageSquareIcon size={16} aria-hidden />, label: "Sohbetler", href: "/posta/sohbet", badge: <Badge count={0} /> },
        { icon: <SettingsIcon size={16} aria-hidden />, label: "Otomasyonlar", href: "/posta/otomasyon", badge: <Badge count="Yeni" color="success" size="sm" /> },
      ].map((item) => (
        <a key={item.label} href={item.href} onClick={(e) => e.preventDefault()} className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-mari-foreground hover:bg-mari-surface-alt">
          {item.icon}
          <span className="flex-1">{item.label}</span>
          {item.badge}
        </a>
      ))}
    </nav>
  ),
};

export const Appearance: Story = {
  name: "Boyut ve Renkler",
  ...storyDoc("sm / md, rol renkleri, `dot`.", `<Badge count={5} size="sm" color="primary" />`),
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {(["error", "primary", "success", "warning", "info", "neutral"] as const).map((color) => (
          <Badge key={color} count={8} color={color} />
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Badge count={5} size="sm" />
        <Badge count={5} />
        <Badge dot size="sm" />
        <Badge dot />
      </div>
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Badge count={5} skeleton>…</Badge>
<StatusBadge skeleton>Hazırlanıyor</StatusBadge>`),
  render: () => <SkeletonDemo>{(skeleton) => (
        <div className="flex items-center gap-6">
          <Badge count={5} skeleton={skeleton}>
            <span className="block size-10 rounded-md bg-mari-surface-alt" />
          </Badge>
          <StatusBadge color="success" skeleton={skeleton}>Teslim edildi</StatusBadge>
        </div>
      )}</SkeletonDemo>,
};
