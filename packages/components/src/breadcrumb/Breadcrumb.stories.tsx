import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ChevronRightIcon, HomeIcon, UserIcon } from "lucide-react";
import { classNameArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbProps } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Navigasyon/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Kullanıcının site hiyerarşisindeki konumunu gösteren gezinme yolu.",
          whenToUse: [
            "Kullanıcının derin bir hiyerarşide (kategori/alt kategori/ürün gibi) nerede olduğunu göstermek ve üst seviyelere hızlı dönüş sağlamak için.",
            "Aynı seviyedeki kardeş sayfalara (diğer kategoriler) tek adımda geçiş sunmak için — öğeye `menu` verin.",
          ],
          whenNotToUse: ["Site tek seviyeliyse veya sayfa geçmişi zaten tarayıcı geri tuşuyla yeterince açıksa."],
          a11y:
            "Gerçek bir `<nav><ol><li>` listesi — `aria-label=\"Gezinme yolu\"` taşır (değiştirilebilir), son öğe " +
            "`aria-current=\"page\"` alır, ayırıcı `aria-hidden`. `onClick` verilip `href` verilmeyen öğeler gerçek bir " +
            "`<button>`; `menu`lü öğe `aria-expanded` taşıyan bir düğme, menü Escape ile kapanır. `maxItems` ile " +
            "katlanan aralık, kaç yolun gizli olduğunu söyleyen \"…\" düğmesidir. Dokunmatik ekranda her bağlantının " +
            "dokunma alanı görünmez biçimde 44px'e genişler.",
        }),
      },
    },
  },
  argTypes: {
    items: { control: "object", description: "Yol öğeleri: `title`, `href`, `onClick`, `icon`, `menu`, `path`, `className`." },
    separator: { control: "text", description: "Öğeler arası ayırıcı (metin ya da ikon).", table: { defaultValue: { summary: '"/"' } } },
    maxItems: { control: { type: "number", min: 2 }, description: "Aşılınca ortadaki öğeler \"…\" düğmesine katlanır." },
    skeleton: { control: "boolean", description: "Veri gelene kadar her öğe yerine iskelet.", table: { defaultValue: { summary: "false" } } },
    "aria-label": { control: "text", description: "`<nav>`ın erişilebilir adı.", table: { defaultValue: { summary: '"Gezinme yolu"' } } },
    className: classNameArgType,
    itemRender: { control: false, description: "Her öğeyi özel render etmek için (varsayılan link/buton/span yerine)." },
    params: { control: false, description: "`itemRender`'a geçirilecek ek parametreler." },
  },
};

export default meta;
type Story = StoryObj<BreadcrumbProps>;

const productPath = [
  { title: "Ana Sayfa", href: "/" },
  { title: "Elektronik", href: "/elektronik" },
  { title: "Bilgisayar & Tablet", href: "/elektronik/bilgisayar-tablet" },
  { title: "Dizüstü Bilgisayar", href: "/elektronik/bilgisayar-tablet/laptop" },
  { title: "Apple MacBook Air 13\" M3 16GB 512GB" },
];

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    items: productPath.slice(0, 3).concat({ title: "Dizüstü Bilgisayar" }),
    separator: "/",
  },
};

export const WithIcons: Story = {
  name: "İkonlu",
  ...storyDoc(
    "`icon` başlığın soluna yerleşir. Ana sayfa gibi tanıdık düğümlerde ikon yeterince açıktır; yine de başlığı " +
      "boş bırakmayın — ekran okuyucu ikonu okumaz.",
    `
<Breadcrumb
  items={[
    { title: "Ana Sayfa", href: "/", icon: <HomeIcon /> },
    { title: "Hesabım", href: "/hesabim", icon: <UserIcon /> },
    { title: "Siparişlerim" },
  ]}
/>`
  ),
  args: {
    items: [
      { title: "Ana Sayfa", href: "/", icon: <HomeIcon /> },
      { title: "Hesabım", href: "/hesabim", icon: <UserIcon /> },
      { title: "Siparişlerim" },
    ],
  },
};

const withMenuDoc = storyDoc(
    "`menu` verilen öğe, aynı seviyedeki kardeş sayfaları listeleyen bir açılır menü tetikleyicisine dönüşür — " +
      "kullanıcı bir üst seviyeye çıkmadan başka bir kategoriye geçebilir.",
    `
<Breadcrumb
  items={[
    { title: "Ana Sayfa", href: "/" },
    { title: "Elektronik", href: "/elektronik" },
    {
      title: "Bilgisayar & Tablet",
      menu: {
        items: [
          { title: "Telefon", href: "/elektronik/telefon" },
          { title: "Bilgisayar & Tablet", href: "/elektronik/bilgisayar-tablet" },
          { title: "TV & Ses", href: "/elektronik/tv-ses" },
          { title: "Beyaz Eşya", href: "/elektronik/beyaz-esya" },
        ],
      },
    },
    { title: "Dizüstü Bilgisayar" },
  ]}
/>`
  );

export const WithMenu: Story = {
  name: "Açılır Menülü",
  // Panel akışa yer kaplamaz (portal) — docs kanvası kırpmasın diye yükseklik; storyDoc'un açıklamasını ezmeden birleştirilir.
  parameters: { docs: { ...withMenuDoc.parameters.docs, story: { height: "14rem" } } },
  args: {
    items: [
      { title: "Ana Sayfa", href: "/" },
      { title: "Elektronik", href: "/elektronik" },
      {
        title: "Bilgisayar & Tablet",
        menu: {
          items: [
            { title: "Telefon", href: "#telefon" },
            { title: "Bilgisayar & Tablet", href: "#bilgisayar-tablet" },
            { title: "TV & Ses", href: "#tv-ses" },
            { title: "Beyaz Eşya", href: "#beyaz-esya" },
          ],
        },
      },
      { title: "Dizüstü Bilgisayar" },
    ],
  },
};

export const Collapsed: Story = {
  name: "Katlanmış (maxItems)",
  ...storyDoc(
    "Derin bir ürün yolunda `maxItems={3}`: ilk öğe ve son iki öğe görünür, aradakiler \"…\" düğmesine katlanır. " +
      "Düğmeye basınca yolun tamamı açılır. Mobilde yolun iki satıra yayılmasını önler.",
    `<Breadcrumb maxItems={3} items={productPath} />`
  ),
  args: { items: productPath, maxItems: 3 },
};

export const CustomSeparator: Story = {
  name: "Özel Ayırıcı",
  ...storyDoc(
    "`separator` herhangi bir React node olabilir — metin ya da ikon (ikon 14px'e ölçeklenir).",
    `<Breadcrumb separator={<ChevronRightIcon />} items={items} />`
  ),
  args: {
    items: [
      { title: "Panel", href: "/panel" },
      { title: "Ayarlar", href: "/panel/ayarlar" },
      { title: "Bildirimler" },
    ],
    separator: <ChevronRightIcon />,
  },
};

export const LongPath: Story = {
  name: "Uzun Yol (Satır Kırılması)",
  ...storyDoc(
    "Katlama kullanılmadığında yol dar ekranda alt satıra kırılır; çok uzun tek bir başlık da kendi içinde " +
      "kırılır — sayfa hiçbir genişlikte yatay kaymaz.",
    `<Breadcrumb items={productPath} />`
  ),
  args: { items: productPath },
};

export const ClickHandlers: Story = {
  name: "Tıklama İşleyicili (href'siz)",
  ...storyDoc(
    "`href` verilmeyip `onClick` verilen öğeler (örn. bir SPA route değiştiricisi) gerçek bir `<button>` render " +
      "eder — Tab ile odaklanılabilir, Enter/Space ile tetiklenebilir.",
    `
<Breadcrumb
  items={[
    { title: "Panel", onClick: () => router.push("/panel") },
    { title: "Siparişler", onClick: () => router.push("/panel/siparisler") },
    { title: "#4821" },
  ]}
/>`
  ),
  args: {
    items: [
      { title: "Panel", onClick: () => alert("Panel'e git") },
      { title: "Siparişler", onClick: () => alert("Siparişler'e git") },
      { title: "#4821" },
    ],
  },
};

export const WithItemRender: Story = {
  name: "Özel Render",
  ...storyDoc(
    "`itemRender(route, params, routes, paths)` verilince her öğe tamamen özelleştirilebilir — örneğin kendi " +
      "yönlendiricinizin `Link` bileşeniyle. `paths`, o öğeye kadar biriken `path` değerleridir.",
    `
<Breadcrumb
  items={[
    { title: "Kullanıcılar", path: "kullanicilar" },
    { title: "Ayşe Yılmaz", path: "42" },
    { title: "Yetkiler", path: "yetkiler" },
  ]}
  itemRender={(route, _params, routes, paths) =>
    route === routes.at(-1) ? (
      <span className="text-mari-foreground">{route.title}</span>
    ) : (
      <Link href={\`/\${paths.join("/")}\`}>{route.title}</Link>
    )
  }
/>`
  ),
  args: {
    items: [
      { title: "Kullanıcılar", path: "kullanicilar" },
      { title: "Ayşe Yılmaz", path: "42" },
      { title: "Yetkiler", path: "yetkiler" },
    ],
    itemRender: (route, _params, routes, paths) =>
      route === routes.at(-1) ? (
        <span className="text-mari-foreground">{route.title}</span>
      ) : (
        <a href={`#/${paths.join("/")}`} className="rounded-sm text-mari-primary hover:underline">
          {route.title}
        </a>
      ),
  },
};

function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="flex flex-col items-start gap-4">
      <label className="flex items-center gap-2 text-sm text-mari-foreground">
        <input type="checkbox" checked={loading} onChange={(e) => setLoading(e.target.checked)} />
        Yükleniyor
      </label>
      <div aria-busy={loading}>
        <Breadcrumb skeleton={loading} items={productPath.slice(0, 4)} />
      </div>
    </div>
  );
}

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` her öğeyi kendi genişliğinde bir yer tutucuya çevirir; gerçek başlıklar görünmez olarak yerinde " +
      "kaldığı için yüklenince yol zıplamaz. Ayırıcılar görünür kalır.",
    `
<div aria-busy={loading}>
  <Breadcrumb skeleton={loading} items={items} />
</div>`
  ),
  render: () => <SkeletonDemo />,
};
