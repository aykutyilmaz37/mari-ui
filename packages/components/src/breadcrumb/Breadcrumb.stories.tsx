import type { Meta, StoryObj } from "@storybook/react";
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
          whenToUse: ["Kullanıcının derin bir hiyerarşide (kategori/alt kategori/ürün gibi) nerede olduğunu göstermek ve üst seviyelere hızlı dönüş sağlamak için."],
          whenNotToUse: ["Site tek seviyeliyse veya sayfa geçmişi zaten tarayıcı geri tuşuyla yeterince açıksa."],
          a11y:
            "Gerçek bir `<nav><ol><li>` listesi — `aria-label=\"Gezinme yolu\"` taşır, son öğe `aria-current=\"page\"` " +
            "alır, ayırıcı `aria-hidden` (ekran okuyucu her öğe arasında ayırıcıyı okumaz). `onClick` verilip " +
            "`href` verilmeyen öğeler gerçek bir `<button>` olarak render edilir — eskiden klavyeyle erişilemeyen " +
            "bir `<span role=\"none\">` idi.",
        }),
      },
    },
  },
  argTypes: {
    separator: { control: "text", description: "Öğeler arası ayırıcı. Varsayılan: `/`." },
    className: classNameArgType,
    itemRender: { control: false, description: "Her öğeyi özel render etmek için (varsayılan link/span yerine)." },
    params: { control: false, description: "`itemRender`'a geçirilecek ek parametreler." },
  },
};

export default meta;

export const Playground: StoryObj<BreadcrumbProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    items: [
      { title: "Ana Sayfa", href: "/" },
      { title: "Kategori", href: "/kategori" },
      { title: "Ürün", path: "urun" },
    ],
    separator: "/",
  },
};

export const CustomSeparator: StoryObj<BreadcrumbProps> = {
  name: "Özel Ayırıcı",
  ...storyDoc("`separator` herhangi bir React node olabilir — metin, ikon vb."),
  args: {
    items: [
      { title: "Panel", href: "/panel" },
      { title: "Ayarlar", href: "/panel/ayarlar" },
    ],
    separator: "→",
  },
};

export const WithItemRender: StoryObj<BreadcrumbProps> = {
  name: "Özel Render",
  ...storyDoc("`itemRender` verilince her öğe tamamen özelleştirilebilir — varsayılan link/buton/span yerine."),
  args: {
    items: [
      { title: "A", path: "a" },
      { title: "B", path: "b" },
      { title: "C", path: "c" },
    ],
    itemRender: (route, _params, _routes, paths) => (
      <a href={`/${paths.join("/")}`} className="text-mari-primary hover:underline">
        {route.title}
      </a>
    ),
  },
};

export const ClickHandlers: StoryObj<BreadcrumbProps> = {
  name: "Tıklama İşleyicili (href'siz)",
  ...storyDoc(
    "`href` verilmeyip `onClick` verilen öğeler (örn. bir SPA route değiştiricisi) gerçek bir `<button>` render " +
      "eder — Tab ile odaklanılabilir, Enter/Space ile tetiklenebilir."
  ),
  args: {
    items: [
      { title: "Panel", onClick: () => alert("Panel'e git") },
      { title: "Siparişler", onClick: () => alert("Siparişler'e git") },
      { title: "#4821" },
    ],
  },
};
