import type { Meta, StoryObj } from "@storybook/react";
import { baseSizeArgType, classNameArgType } from "../lib/storybookArgTypes";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "İlgili içeriği bir yüzeyde gruplayan genel amaçlı konteyner. Başlık, ekstra aksiyon alanı, kapak görseli " +
          "ve alt bilgi (footer) bölümlerini destekler. Hook kullanmaz, sunucu bileşeni olarak render edilebilir " +
          "(`onClick` verildiğinde React etkileşimi otomatik olarak client boundary'sine taşır).",
      },
    },
  },
  argTypes: {
    className: classNameArgType,
    title: { control: "text", description: "Başlık alanı." },
    extra: { control: false, description: "Başlığın sağında gösterilecek ek içerik (örn. bir buton/link)." },
    cover: { control: false, description: "Kartın üstünde tam genişlikte gösterilecek kapak içeriği (genelde görsel)." },
    footer: { control: false, description: "Alt bilgi alanı — verilirse bir ayırıcı çizgiyle birlikte render edilir." },
    bordered: { control: "boolean", description: "Kenarlık gösterir. Varsayılan: `true`." },
    hoverable: { control: "boolean", description: "Üzerine gelince gölge efekti ekler." },
    loading: { control: "boolean", description: "İçerik yerine iskelet (skeleton) satırları gösterir." },
    inset: { control: "boolean", description: "İç içe/gömülü kart görünümü — tonlanmış bir arka plan verir." },
    size: baseSizeArgType,
  },
  args: {
    children: "Bu, kart içeriğidir.",
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  args: {
    title: "Kart Başlığı",
    className: "w-[400px]",
  },
};

export const WithCoverAndFooter: Story = {
  name: "Kapak ve Alt Bilgili",
  args: {
    title: "Kapaklı Kart",
    className: "w-[400px]",
    cover: <img width={400} height={200} src="https://placehold.co/400x200" alt="kapak" />,
    footer: <span className="text-sm text-mari-muted">Son güncelleme: bugün</span>,
  },
};

export const Borderless: Story = {
  name: "Kenarlıksız",
  args: {
    className: "w-[400px]",
    title: "Kenarlıksız Kart",
    bordered: false,
  },
};

export const Hoverable: Story = {
  name: "Hover Efektli",
  args: {
    className: "w-[400px]",
    title: "Hover Kart",
    hoverable: true,
  },
};

export const Loading: Story = {
  name: "Yükleniyor",
  args: {
    className: "w-[400px]",
    title: "Yüklenen Kart",
    loading: true,
  },
};

export const Sizes: Story = {
  name: "Boyutlar",
  render: () => (
    <div className="flex gap-4">
      <Card className="w-[400px]" title="Küçük" size="sm">
        Küçük kart içeriği
      </Card>
      <Card className="w-[400px]" title="Orta" size="md">
        Orta kart içeriği
      </Card>
      <Card className="w-[400px]" title="Büyük" size="lg">
        Büyük kart içeriği
      </Card>
    </div>
  ),
};

export const Inset: Story = {
  name: "Gömülü",
  args: {
    className: "w-[400px]",
    title: "Gömülü Kart",
    inset: true,
  },
};
