/**
 * Faz 13.6: örnekler gerçek senaryolar — sepet, filtre paneli, kayıt
 * düzenleme, bildirimler, paylaş (bottom sheet). "Show code" her story'de
 * `storyDoc`'un 2. argümanıyla verilen kopyalanabilir kodu gösterir.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc(...)`'unkini ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BellIcon,
  CheckCheckIcon,
  CopyIcon,
  FilterIcon,
  HeadphonesIcon,
  KeyboardIcon,
  LinkIcon,
  MailIcon,
  MessageCircleIcon,
  MinusIcon,
  PackageCheckIcon,
  PlusIcon,
  SendIcon,
  Share2Icon,
  ShoppingBagIcon,
  Trash2Icon,
  TruckIcon,
  UserPlusIcon,
  WatchIcon,
} from "lucide-react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Drawer } from "./Drawer";
import { Button } from "../button";
import { Checkbox } from "../checkbox";
import { Field } from "../field";
import { Input } from "../input";
import { Slider } from "../slider";

const meta: Meta<typeof Drawer> = {
  title: "Geri Bildirim/Drawer",
  component: Drawer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      // Çekmeceler document.body'ye portal edilir; docs sayfasında her
      // story ayrı bir iframe'de açılsın ki biri diğerinin üstüne binmesin.
      story: { inline: false, height: "520px" },
      description: {
        component: componentDoc({
          summary:
            "Ekranın kenarından kayarak açılan panel — sayfadan ayrılmadan ikincil bir görevi (sepet, filtre, kayıt " +
            "düzenleme, detay) yapmak için. `title` / `description` / `extra` başlık şeridini, `footer` sabit eylem " +
            "çubuğunu oluşturur; gövde kendi içinde kayar. `position=\"bottom\"` mobil bottom sheet görünümü verir.",
          whenToUse: [
            "Bağlamı kaybetmeden bir kaydı düzenlemek/incelemek (liste sayfasında satır detayı).",
            "Sayfanın yanında açık kalabilen yardımcı içerik: sepet, filtreler, bildirimler.",
          ],
          whenNotToUse: [
            "Kısa bir onay ya da tek bir soru için — Modal kullanın.",
            "Ana içeriğin kendisi için — çekmece ikincil görevler içindir; uzun akışları ayrı sayfaya taşıyın.",
          ],
          a11y:
            "`role=\"dialog\"` + `aria-modal`; `title` erişilebilir ad, `description` `aria-describedby` olur. Açılınca " +
            "odak ilk odaklanabilir öğeye (ya da `data-autofocus` taşıyana) taşınır ve Tab ile içeride döner; Escape " +
            "(`keyboard`) ve örtü (`maskClosable`) kapatır; kapanınca odak tetikleyiciye döner. Açıkken sayfa kaydırması " +
            "kilitlenir. Kapalıyken DOM'da değildir. `document.body`'ye portal edilir.",
        }),
      },
    },
  },
  argTypes: {
    open: { control: false },
    onClose: { table: { category: "Olaylar" } },
    position: { control: "inline-radio", options: ["right", "left", "top", "bottom"], description: "Açıldığı kenar. Varsayılan: `right`." },
    size: { ...baseSizeArgType, description: "Yan: 320 / 400 / 640px genişlik; üst-alt: yükseklik. Varsayılan: `md`." },
    width: { control: "text", description: "Özel genişlik (yan çekmece)." },
    height: { control: "text", description: "Özel yükseklik (üst/alt çekmece)." },
    title: { control: "text" },
    description: { control: "text" },
    extra: { control: false, description: "Başlık şeridinin sağında ek aksiyonlar." },
    header: { control: false, description: "**Deprecated** — `title`/`description`/`extra` kullanın." },
    footer: { control: false, description: "Altta sabit eylem çubuğu." },
    showCloseButton: { control: "boolean" },
    closeButtonPosition: { control: "inline-radio", options: ["left", "right"] },
    skeleton: {
      control: "boolean",
      description: "Veri gelene kadar başlık, açıklama, `extra`, gövde ve alt çubuk iskelete döner; Kapat çalışır.",
    },
    loading: { control: false, description: "**Deprecated** — `skeleton` kullanın." },
    mask: { control: "boolean", description: "Arka plan örtüsü. Varsayılan: `true`." },
    maskClosable: { control: "boolean", description: "Örtüye tıklayınca kapansın. Varsayılan: `true`." },
    keyboard: { control: "boolean", description: "Escape kapatsın. Varsayılan: `true`." },
  },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

const tl = (n: number) => n.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ₺";

/* ─────────────────────────── 1. Sepet ─────────────────────────── */

const FREE_SHIPPING = 750;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    position: "right",
    size: "md",
    title: "Çekmece başlığı",
    description: "Kısa açıklama",
    showCloseButton: true,
    closeButtonPosition: "right",
    skeleton: false,
    mask: true,
    maskClosable: true,
    keyboard: true,
  },
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Çekmeceyi aç</Button>
        <Drawer {...args} open={open} onClose={() => setOpen(false)} footer={<Button onClick={() => setOpen(false)}>Kapat</Button>}>
          <p className="text-sm">Çekmece içeriği.</p>
        </Drawer>
      </>
    );
  },
};

export const Cart: Story = {
  name: "Alışveriş Sepeti",
  ...storyDoc(
    "E-ticaret mini sepeti: ücretsiz kargo eşiği ilerlemesi, adet değiştirme, ürün kaldırma ve sabit alt " +
      "çubukta ara toplam + ödeme. Gövde kendi içinde kayar, alt çubuk hep görünür.",
    `
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Sepet (3)</Button>
<Drawer
  open={open}
  onClose={() => setOpen(false)}
  title="Sepetim"
  description="3 ürün"
  footer={
    <>
      <div className="flex justify-between"><span>Ara toplam</span><span>6.298,00 ₺</span></div>
      <Button block>Ödemeye geç</Button>
    </>
  }
>
  <CartItems />
</Drawer>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [items, setItems] = useState([
      { id: 1, name: "Kablosuz Kulaklık Pro", variant: "Gece mavisi", price: 249.9, qty: 1, Icon: HeadphonesIcon },
      { id: 2, name: "Akıllı Saat Kordonu", variant: "44 mm · Siyah", price: 189.9, qty: 2, Icon: WatchIcon },
      { id: 3, name: "Mekanik Klavye Kapağı", variant: "PBT · Türkçe Q", price: 99.9, qty: 1, Icon: KeyboardIcon },
    ]);
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce((n, i) => n + i.qty * i.price, 0);
    const remaining = Math.max(0, FREE_SHIPPING - subtotal);
    const setQty = (id: number, qty: number) => setItems((list) => list.map((i) => (i.id === id ? { ...i, qty } : i)).filter((i) => i.qty > 0));

    return (
      <>
        <Button onClick={() => setOpen(true)} icon={<ShoppingBagIcon size={16} aria-hidden />}>
          Sepet ({count})
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Sepetim"
          description={count ? `${count} ürün` : undefined}
          footer={
            items.length > 0 && (
              <div className="space-y-3 py-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-mari-muted">Ara toplam</span>
                  <span className="text-lg font-semibold tabular-nums text-mari-foreground">{tl(subtotal)}</span>
                </div>
                <Button block>Ödemeye geç</Button>
                <Button block variant="ghost" color="neutral" onClick={() => setOpen(false)}>
                  Alışverişe devam et
                </Button>
              </div>
            )
          }
        >
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-mari-surface-alt text-mari-muted">
                <ShoppingBagIcon size={24} aria-hidden />
              </span>
              <p className="font-medium text-mari-foreground">Sepetiniz boş</p>
              <p className="text-sm text-mari-muted">Beğendiğiniz ürünleri buraya ekleyin.</p>
            </div>
          ) : (
            <>
              <div className="mb-5 rounded-xl bg-mari-surface-alt p-3">
                <p className="mb-2 flex items-center gap-2 text-sm text-mari-foreground">
                  <TruckIcon size={16} className="shrink-0 text-mari-primary" aria-hidden />
                  {remaining > 0 ? (
                    <span>
                      Ücretsiz kargo için <strong className="tabular-nums">{tl(remaining)}</strong> daha ekleyin
                    </span>
                  ) : (
                    <span className="font-medium text-mari-success">Kargo ücretsiz!</span>
                  )}
                </p>
                <div
                  className="h-1.5 overflow-hidden rounded-full bg-mari-border"
                  role="progressbar"
                  aria-label="Ücretsiz kargo eşiği"
                  aria-valuemin={0}
                  aria-valuemax={FREE_SHIPPING}
                  aria-valuenow={Math.min(subtotal, FREE_SHIPPING)}
                >
                  <div className="h-full rounded-full bg-mari-primary-solid transition-[width] duration-300" style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }} />
                </div>
              </div>

              <ul className="divide-y divide-mari-border">
                {items.map(({ id, name, variant, price, qty, Icon }) => (
                  <li key={id} className="flex gap-3 py-4 first:pt-0">
                    <span className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-mari-surface-alt text-mari-muted">
                      <Icon size={24} aria-hidden />
                    </span>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-mari-foreground">{name}</p>
                          <p className="text-xs text-mari-muted">{variant}</p>
                        </div>
                        <button
                          type="button"
                          aria-label={`${name} ürününü kaldır`}
                          onClick={() => setQty(id, 0)}
                          className="-mr-1 inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-mari-muted hover:bg-mari-surface-alt hover:text-mari-error focus-visible:outline-2 focus-visible:outline-mari-ring"
                        >
                          <Trash2Icon size={16} aria-hidden />
                        </button>
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-lg border border-mari-border" role="group" aria-label={`${name} adedi`}>
                          <button type="button" aria-label="Azalt" onClick={() => setQty(id, qty - 1)} className="inline-flex size-8 cursor-pointer items-center justify-center text-mari-muted hover:text-mari-foreground">
                            <MinusIcon size={14} aria-hidden />
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                            {qty}
                          </span>
                          <button type="button" aria-label="Artır" onClick={() => setQty(id, qty + 1)} className="inline-flex size-8 cursor-pointer items-center justify-center text-mari-muted hover:text-mari-foreground">
                            <PlusIcon size={14} aria-hidden />
                          </button>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-mari-foreground">{tl(price * qty)}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Drawer>
      </>
    );
  },
};

/* ─────────────────────────── 2. Filtreler ─────────────────────────── */

const categories = [
  { label: "Kulaklık", count: 128 },
  { label: "Akıllı saat", count: 64 },
  { label: "Klavye", count: 91 },
  { label: "Hoparlör", count: 47 },
];
const brands = ["Aurora", "Mari", "Nova", "Pulse", "Zenith"];

export const Filters: Story = {
  name: "Filtre Paneli",
  ...storyDoc(
    "Liste sayfası filtreleri: soldan açılır, gövde kayar, alt çubukta \"Temizle\" + sonuç sayısıyla uygula. " +
      "Mobilde ekranın tamamını değil `100vw - 3rem`'i kaplar — örtüden bir şerit kalır.",
    `
<Drawer
  position="left"
  size="sm"
  open={open}
  onClose={close}
  title="Filtreler"
  extra={<Button variant="link" size="sm" onClick={reset}>Temizle</Button>}
  footer={<Button block onClick={apply}>128 ürünü göster</Button>}
>
  <Field label="Marka">
    <div className="flex flex-col gap-2">
      <Checkbox label="Apple" defaultChecked />
      <Checkbox label="Samsung" />
    </div>
  </Field>
  <Field label="Fiyat üst sınırı">
    <Slider min={0} max={50000} step={500} defaultValue={25000} />
  </Field>
</Drawer>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [selected, setSelected] = useState<string[]>(["Kulaklık"]);
    const [brandSel, setBrandSel] = useState<string[]>([]);
    const [price, setPrice] = useState<[number, number]>([500, 5000]);
    const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
    const results = selected.reduce((n, c) => n + (categories.find((x) => x.label === c)?.count ?? 0), 0) || 330;
    const activeCount = selected.length + brandSel.length + (price[0] !== 0 || price[1] !== 10000 ? 1 : 0);

    return (
      <>
        <Button variant="outline" color="neutral" onClick={() => setOpen(true)} icon={<FilterIcon size={16} aria-hidden />}>
          Filtreler{activeCount ? ` (${activeCount})` : ""}
        </Button>
        <Drawer
          position="left"
          size="sm"
          open={open}
          onClose={() => setOpen(false)}
          title="Filtreler"
          extra={
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                setSelected([]);
                setBrandSel([]);
                setPrice([0, 10000]);
              }}
            >
              Temizle
            </Button>
          }
          footer={
            <Button block onClick={() => setOpen(false)}>
              {results} ürünü göster
            </Button>
          }
        >
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-mari-foreground">Kategori</legend>
            <div className="space-y-2.5">
              {categories.map((c) => (
                <div key={c.label} className="flex items-center justify-between gap-2">
                  <Checkbox label={c.label} checked={selected.includes(c.label)} onChange={() => toggle(selected, setSelected, c.label)} />
                  <span className="text-xs tabular-nums text-mari-muted">{c.count}</span>
                </div>
              ))}
            </div>
          </fieldset>

          {/* Bölüm çizgisi fieldset'te değil sarmalayıcıda — fieldset'in kenarlığı legend'in içinden geçer. */}
          <div className="mt-6 border-t border-mari-border pt-6">
            <fieldset>
              <legend className="mb-3 flex w-full items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-mari-foreground">Fiyat</span>
                <span className="tabular-nums text-mari-muted">
                  {price[0].toLocaleString("tr-TR")} – {price[1].toLocaleString("tr-TR")} ₺
                </span>
              </legend>
              <Slider
                aria-label="Fiyat"
                min={0}
                max={10000}
                step={250}
                value={price}
                onChange={(v) => setPrice(v as [number, number])}
                formatValue={(v) => `${v.toLocaleString("tr-TR")} ₺`}
                marks={{ 0: "0 ₺", 10000: "10.000 ₺" }}
              />
            </fieldset>
          </div>

          <div className="mt-6 border-t border-mari-border pt-6">
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-mari-foreground">Marka</legend>
              <div className="flex flex-col gap-2.5">
                {brands.map((b) => (
                  <Checkbox key={b} label={b} checked={brandSel.includes(b)} onChange={() => toggle(brandSel, setBrandSel, b)} />
                ))}
              </div>
            </fieldset>
          </div>
        </Drawer>
      </>
    );
  },
};

/* ─────────────────────────── 3. Kayıt düzenleme ─────────────────────────── */

export const EditRecord: Story = {
  name: "Kayıt Düzenleme",
  // Controls'taki `skeleton` açıkken çekmece iskelette kalır (incelemek için);
  // kapalıyken "Düzenle" 900ms'lik gerçek bir yükleme taklidi yapar.
  args: { skeleton: false },
  ...storyDoc(
    "Liste satırını sayfadan ayrılmadan düzenleme: `size=\"lg\"`, veri gelene kadar `skeleton` (başlık, Sil ve alt " +
      "çubuk dahil her bölge iskelet; Kapat çalışır), başlıkta " +
      "`extra` ile tehlikeli aksiyon, alt çubukta sağa yaslı İptal / Kaydet. İlk alan `data-autofocus` ile odaklanır.",
    `
<Drawer
  size="lg"
  open={open}
  onClose={close}
  skeleton={isLoading}
  title="Müşteriyi düzenle"
  description="Deniz Kaya · #C-1042"
  extra={<Button variant="ghost" color="error" size="sm">Sil</Button>}
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="outline" color="neutral" onClick={close}>İptal</Button>
      <Button onClick={save}>Kaydet</Button>
    </div>
  }
>
  <Field label="Ad">
    <Input data-autofocus value={name} onChange={(e) => setName(e.target.value)} />
  </Field>
</Drawer>`
  ),
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const openDrawer = () => {
      setOpen(true);
      setLoading(true);
      setTimeout(() => setLoading(false), 900);
    };

    return (
      <div className="relative max-w-2xl overflow-hidden rounded-xl border border-mari-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-mari-surface-alt text-mari-muted">
            <tr>
              <th className="px-4 py-2.5 font-medium">Müşteri</th>
              <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Şehir</th>
              {/* aria-label boş başlığı düzeltmez (axe empty-table-header) — metin gerekir. */}
              <th className="px-4 py-2.5">
                <span className="sr-only">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-mari-border">
            {[
              ["Deniz Kaya", "deniz@mari-ui.com", "İstanbul"],
              ["Elif Can", "elif@mari-ui.com", "İzmir"],
            ].map(([name, email, city]) => (
              <tr key={email}>
                <td className="px-4 py-3">
                  <p className="font-medium text-mari-foreground">{name}</p>
                  <p className="text-xs text-mari-muted">{email}</p>
                </td>
                <td className="hidden px-4 py-3 text-mari-muted sm:table-cell">{city}</td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" color="neutral" onClick={openDrawer}>
                    Düzenle
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Drawer
          size="lg"
          open={open}
          onClose={() => setOpen(false)}
          skeleton={args.skeleton || loading}
          title="Müşteriyi düzenle"
          description="Deniz Kaya · #C-1042"
          extra={
            <Button variant="ghost" color="error" size="sm" icon={<Trash2Icon size={16} aria-hidden />}>
              Sil
            </Button>
          }
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="outline" color="neutral" onClick={() => setOpen(false)}>
                İptal
              </Button>
              <Button onClick={() => setOpen(false)}>Kaydet</Button>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ad">
              {/* `data-autofocus`: Drawer açılınca (ve veri gelince) odak buraya gider, Kapat'a değil. */}
              <Input data-autofocus defaultValue="Deniz" />
            </Field>
            <Field label="Soyad">
              <Input defaultValue="Kaya" />
            </Field>
            <Field label="E-posta" className="sm:col-span-2">
              <Input type="email" defaultValue="deniz@mari-ui.com" />
            </Field>
            <Field label="Telefon">
              <Input mask="(___) ___ __ __" replacement={{ _: /\d/ }} defaultValue="(532) 000 00 00" />
            </Field>
            <Field label="Şehir">
              <Input defaultValue="İstanbul" />
            </Field>
            <Field label="Adres" className="sm:col-span-2">
              <Input defaultValue="Moda Cd. No: 12 D: 4, Kadıköy" />
            </Field>
          </div>
          <div className="mt-6 flex flex-col items-start gap-3 border-t border-mari-border pt-6">
            <p className="text-sm font-semibold text-mari-foreground">İletişim izinleri</p>
            <Checkbox label="E-posta ile kampanya bildirimleri" defaultChecked />
            <Checkbox label="SMS ile sipariş durumu" defaultChecked />
          </div>
        </Drawer>
      </div>
    );
  },
};

/* ─────────────────────────── 4. Bildirimler ─────────────────────────── */

const initialNotifications = [
  { id: 1, Icon: PackageCheckIcon, title: "Siparişiniz teslim edildi", body: "#TR-48213 · Kadıköy", time: "5 dk", unread: true },
  { id: 2, Icon: MessageCircleIcon, title: "Elif Can yorum yaptı", body: "\"Buton boyutları token'a bağlandı mı?\"", time: "1 sa", unread: true },
  { id: 3, Icon: UserPlusIcon, title: "Deniz ekibe katıldı", body: "mari-ui çalışma alanı", time: "3 sa", unread: false },
  { id: 4, Icon: MailIcon, title: "Fatura hazır", body: "Eylül 2026 · 1.192,00 ₺", time: "Dün", unread: false },
];

export const Notifications: Story = {
  name: "Bildirimler",
  ...storyDoc(
    "Dar (`size=\"sm\"`) bildirim paneli; başlıkta `extra` ile \"Tümünü okundu say\". Okunmamışlar nokta + " +
      "kalın başlıkla ayrışır ve ekran okuyucuya metinle bildirilir.",
    `
<Drawer
  size="sm"
  open={open}
  onClose={close}
  title="Bildirimler"
  extra={<Button variant="ghost" shape="circle" aria-label="Tümünü okundu say" icon={<CheckCheckIcon />} onClick={markAllRead} />}
  bodyClassName="p-0"
>
  <NotificationList />
</Drawer>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [list, setList] = useState(initialNotifications);
    const unread = list.filter((n) => n.unread).length;
    return (
      <>
        <Button variant="outline" color="neutral" onClick={() => setOpen(true)} icon={<BellIcon size={16} aria-hidden />}>
          Bildirimler{unread ? ` (${unread})` : ""}
        </Button>
        <Drawer
          size="sm"
          open={open}
          onClose={() => setOpen(false)}
          title="Bildirimler"
          extra={
            unread > 0 && (
              // Dar panelde metinli düğme başlığı kesiyordu — ikon düğme + erişilebilir ad.
              <Button
                variant="ghost"
                color="neutral"
                size="sm"
                shape="circle"
                aria-label="Tümünü okundu say"
                icon={<CheckCheckIcon size={16} aria-hidden />}
                onClick={() => setList((l) => l.map((n) => ({ ...n, unread: false })))}
              />
            )
          }
          bodyClassName="p-0 sm:p-0"
        >
          <ul className="divide-y divide-mari-border">
            {list.map(({ id, Icon, title, body, time, unread: isUnread }) => (
              <li key={id} className={`flex gap-3 px-4 py-4 sm:px-6 ${isUnread ? "bg-mari-primary-subtle/40" : ""}`}>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mari-surface-alt text-mari-muted">
                  <Icon size={18} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm text-mari-foreground ${isUnread ? "font-semibold" : ""}`}>
                    {title}
                    {isUnread && <span className="sr-only"> (okunmadı)</span>}
                  </p>
                  <p className="truncate text-sm text-mari-muted">{body}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-xs text-mari-muted">{time}</span>
                  {isUnread && <span aria-hidden className="size-2 rounded-full bg-mari-primary-solid" />}
                </div>
              </li>
            ))}
          </ul>
        </Drawer>
      </>
    );
  },
};

/* ─────────────────────────── 5. Paylaş (bottom sheet) ─────────────────────────── */

export const ShareSheet: Story = {
  name: "Paylaş (Bottom Sheet)",
  ...storyDoc(
    "`position=\"bottom\"` — mobil alt sayfa: yuvarlak üst köşeler, tutamaç, yükseklik içeriğe göre " +
      "(`height=\"auto\"`), iPhone ana ekran çubuğu için güvenli alan boşluğu.",
    `
<Drawer position="bottom" height="auto" open={open} onClose={close} title="Paylaş">
  <div className="grid grid-cols-3 gap-3">
    <Button variant="outline" color="neutral" icon={<LinkIcon />}>Bağlantıyı kopyala</Button>
    <Button variant="outline" color="neutral" icon={<MailIcon />}>E-posta</Button>
    <Button variant="outline" color="neutral" icon={<MessageCircleIcon />}>Mesaj</Button>
  </div>
</Drawer>`
  ),
  render: () => {
    const [open, setOpen] = useState(true);
    const [copied, setCopied] = useState(false);
    const targets = [
      { label: "Mesaj", Icon: MessageCircleIcon },
      { label: "E-posta", Icon: MailIcon },
      { label: "Gönder", Icon: SendIcon },
      { label: "Diğer", Icon: Share2Icon },
    ];
    return (
      <>
        <Button variant="outline" color="neutral" onClick={() => setOpen(true)} icon={<Share2Icon size={16} aria-hidden />}>
          Paylaş
        </Button>
        <Drawer position="bottom" height="auto" open={open} onClose={() => setOpen(false)} title="Paylaş" className="mx-auto max-w-lg">
          <div className="grid grid-cols-4 gap-2">
            {targets.map(({ label, Icon }) => (
              <button
                key={label}
                type="button"
                className="flex cursor-pointer flex-col items-center gap-2 rounded-xl py-3 text-xs text-mari-foreground hover:bg-mari-surface-alt focus-visible:outline-2 focus-visible:outline-mari-ring"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-mari-surface-alt text-mari-primary">
                  <Icon size={20} aria-hidden />
                </span>
                {label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2">
            <div className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md border border-mari-input bg-mari-surface-alt px-3 text-sm text-mari-muted">
              <LinkIcon size={16} className="shrink-0" aria-hidden />
              <span className="truncate">https://mari.io/p/48213</span>
            </div>
            <Button
              variant="outline"
              color={copied ? "success" : "neutral"}
              icon={copied ? <CheckCheckIcon size={16} aria-hidden /> : <CopyIcon size={16} aria-hidden />}
              onClick={() => setCopied(true)}
            >
              {copied ? "Kopyalandı" : "Kopyala"}
            </Button>
          </div>
        </Drawer>
      </>
    );
  },
};

/* ─────────────────────────── Temel seçenekler ─────────────────────────── */

export const Positions: Story = {
  name: "Konumlar ve Boyutlar",
  ...storyDoc("Dört kenar × üç boyut.", `<Drawer position="left" size="lg" open={open} onClose={close} title="Başlık">
  <p>Çekmece içeriği.</p>
</Drawer>`),
  render: () => {
    // Açık/kapalı ayrı state: kapanırken konum/boyut sabit kalsın (yoksa
    // kapanış animasyonu varsayılan sağ/md çekmecede oynuyordu).
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<{ position: "top" | "right" | "bottom" | "left"; size: "sm" | "md" | "lg" }>({ position: "right", size: "md" });
    return (
      <div className="flex flex-col gap-3">
        {(["sm", "md", "lg"] as const).map((size) => (
          <div key={size} className="flex flex-wrap items-center gap-2">
            <span className="w-8 font-mono text-xs text-mari-muted">{size}</span>
            {(["right", "left", "top", "bottom"] as const).map((position) => (
              <Button key={position} size="sm" variant="outline" color="neutral" onClick={() => {
                  setState({ position, size });
                  setOpen(true);
                }}
              >
                {position}
              </Button>
            ))}
          </div>
        ))}
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          position={state.position}
          size={state.size}
          title={`position="${state.position}" · size="${state.size}"`}
          footer={
            <div className="flex justify-end">
              <Button onClick={() => setOpen(false)}>Tamam</Button>
            </div>
          }
        >
          <p className="text-sm text-mari-muted">Gövde uzun olursa kendi içinde kayar; başlık ve alt çubuk sabit kalır.</p>
        </Drawer>
      </div>
    );
  },
};

/* ─────────────────────────── İskelet ─────────────────────────── */

function SkeletonOverlayDemo({ skeleton }: { skeleton: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Çekmeceyi aç</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Siparişi düzenle" skeleton={skeleton}>
        <p className="text-sm">Teslimat adresi, not ve kargo seçenekleri burada düzenlenir.</p>
      </Drawer>
    </>
  );
}

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Drawer open title="Siparişi düzenle" skeleton>
  <Field label="Teslimat adresi">
    <Input defaultValue="Moda Cad. No:12, Kadıköy" />
  </Field>
</Drawer>`),
  render: () => <SkeletonDemo>{(skeleton) => <SkeletonOverlayDemo skeleton={skeleton} />}</SkeletonDemo>,
};
