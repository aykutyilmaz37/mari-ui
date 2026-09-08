import type { Meta, StoryObj } from "@storybook/react";
import { classNameArgType } from "../lib/storybookArgTypes";
import { Breadcrumb } from "./Breadcrumb";
import type { BreadcrumbProps } from "./Breadcrumb";

const meta: Meta<typeof Breadcrumb> = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Kullanıcının site hiyerarşisindeki konumunu gösteren gezinme yolu. Hook kullanmaz, sunucu bileşeni olarak " +
          "render edilebilir. **Not:** Eskiden `index.ts`'te tip export'u eksikti — `BreadcrumbItemType`/`BreadcrumbProps` " +
          "artık düzgün export ediliyor.",
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
