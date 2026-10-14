import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Masonry, type MasonryItem } from "./Masonry";
import { Card } from "../Card";
import { Image } from "../Image";
import { Rate } from "../Rate";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { picsumLoader, storyPhotos } from "../stories/storyPhotos";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, jsxProps, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Masonry> = {
  title: "Native/Veri Gösterimi/Masonry",
  component: Masonry,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Farklı yükseklikteki kartları boşluksuz sütunlara dizen pano (Pinterest). Her öğe o an en kısa sütuna yerleşir; okuma sırası öğe sırası kalır. Kendi içinde kayar; `infinite` ile sona yaklaşınca sonraki sayfa.",
    whenToUse: ["Görsel ağırlıklı akış: ilham panosu, ürün keşfi, tarif kartları.", "Farklı uzunlukta kısa içerikler (yorum kartları)."],
    whenNotToUse: ["Aynı boyda öğeler — düz ızgara (ImageGallery) ya da List.", "Sırası önemli, taranacak liste — List.", "Binlerce öğe — sanallaştırma yok; FlatList / ImageGallery."],
    vsWeb: "API web Masonry ile aynı (`items`, `columns`, `gutter`, `infinite`, `onLayoutChange`). Kırılımlar pencere değil kapsayıcı genişliği (pt): base / sm 480 / md 768 / lg 1024; varsayılan `{ base: 2, sm: 3, md: 4 }`, boşluk `sm`. Kendi içinde kayar (ScrollView) — sayfa ScrollView'una koymayın; `header` ile üstüne başlık / filtre ekleyin.",
  }) } } },
  argTypes: {
    gutter: { control: "select", options: ["sm", "md", "lg"] },
    skeleton: { control: "boolean" },
  },
  args: { gutter: "sm", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Masonry>;

/** Telefon ekranı gibi sabit yükseklikte çerçeve — pano kendi içinde kayar. */
function Screen({ children, height = 520 }: Readonly<{ children: React.ReactNode; height?: number }>) {
  const theme = useTheme();
  return <View style={{ height, alignSelf: "stretch", borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 16, overflow: "hidden", backgroundColor: theme.color.canvas.surface }}>{children}</View>;
}

const photoItems = (count: number, offset = 0): MasonryItem[] =>
  storyPhotos(count + offset).slice(offset).map((p) => ({
    key: p.key,
    children: (
      <View style={{ gap: 4 }}>
        <Image src={p.src} alt={p.alt} loader={picsumLoader} aspectRatio={p.width / p.height} style={{ borderRadius: 12 }} />
        <Text numberOfLines={1} style={{ fontSize: 13 }}>{p.alt.split(" — ")[0]}</Text>
      </View>
    ),
  }));

export const Playground: Story = {
  ...storyDoc(
    "Tüm prop'ları canlı deneyin.",
    (args) => `
const items = photos.map((photo) => ({
  key: photo.id,
  children: <Image src={photo.src} alt={photo.alt} aspectRatio={photo.ratio} />,
}));

<Masonry ${jsxProps(args, { skip: ["items"] })} items={items} accessibilityLabel="Fotoğraflar" contentContainerStyle={{ padding: 8 }} />`
  ),
  render: (args) => (
    <Screen>
      <Masonry {...args} items={photoItems(12)} accessibilityLabel="Fotoğraflar" contentContainerStyle={{ padding: 8 }} />
    </Screen>
  ),
};

export const Inspiration: Story = {
  name: "İlham Panosu",
  ...storyDoc("Farklı oranlı fotoğraflar boşluksuz iki sütunda; `header` panonun üstünde, onunla birlikte kayar.", `<Masonry items={pins} header={<Title>Keşfet</Title>} contentContainerStyle={{ padding: 8 }} />`),
  render: () => (
    <Screen>
      <Masonry items={photoItems(16)} accessibilityLabel="İlham panosu" contentContainerStyle={{ padding: 8 }} header={<Text weight="semibold" style={{ fontSize: 20, paddingHorizontal: 4, paddingBottom: 8 }}>Keşfet</Text>} />
    </Screen>
  ),
};

const REVIEWS = [
  ["Selin A.", 5, "Gürültü engelleme metroda bile çok başarılı."],
  ["Mert Y.", 4, "Ses çok iyi, kılıf biraz daha küçük olabilirdi. Bir haftadır her gün kullanıyorum, pil gerçekten iki gün gidiyor."],
  ["Deniz K.", 5, "Harika."],
  ["Elif C.", 3, "Kulaklık rahat ama uygulamanın eşitleyicisi kafa karıştırıcı; ayarları bulmam uzun sürdü."],
  ["Emre A.", 5, "Fiyatına göre çok iyi, kesinlikle tavsiye ederim."],
  ["Zeynep S.", 4, "Mikrofon toplantılarda net. Rengi fotoğraftakinden biraz daha koyu."],
] as const;

export const Reviews: Story = {
  name: "Müşteri Yorumları (kartlar)",
  ...storyDoc("Farklı uzunlukta metin kartları — kısa yorum uzunun altında boşluk bırakmaz.", `
const reviews = [
  { id: "1", name: "Selin A.", rating: 5, text: "Gürültü engelleme metroda bile çok başarılı." },
  { id: "2", name: "Mert Y.", rating: 4, text: "Ses çok iyi, kılıf biraz daha küçük olabilirdi. Pil gerçekten iki gün gidiyor." },
  { id: "3", name: "Deniz K.", rating: 5, text: "Harika." },
];

<Masonry
  gutter="md"
  accessibilityLabel="Yorumlar"
  items={reviews.map((r) => ({
    key: r.id,
    children: (
      <Card>
        <Text weight="semibold">{r.name}</Text>
        <Rate readOnly value={r.rating} characterSize={14} accessibilityLabel={\`\${r.rating} yıldız\`} />
        <Text muted>{r.text}</Text>
      </Card>
    ),
  }))}
/>`),
  render: () => (
    <Screen>
      <Masonry
        gutter="md"
        accessibilityLabel="Yorumlar"
        contentContainerStyle={{ padding: 12 }}
        items={REVIEWS.map(([name, rating, text]) => ({
          key: name,
          children: (
            <Card>
              <View style={{ gap: 6 }}>
                <Text weight="semibold">{name}</Text>
                <Rate readOnly value={rating} characterSize={14} accessibilityLabel={`${rating} yıldız`} />
                <Text muted style={{ fontSize: 14, lineHeight: 20 }}>{text}</Text>
              </View>
            </Card>
          ),
        }))}
      />
    </Screen>
  ),
};

const PAGE = 10;
const TOTAL = 40;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function InfiniteDemo() {
  const [count, setCount] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const loadMore = async () => {
    setLoading(true);
    await wait(900);
    setCount((c) => Math.min(TOTAL, c + PAGE));
    setLoading(false);
  };
  return (
    <Screen>
      <Masonry items={photoItems(count)} accessibilityLabel="Pano" contentContainerStyle={{ padding: 8 }} infinite={{ hasMore: count < TOTAL, loading, onLoadMore: () => void loadMore(), endMessage: `${TOTAL} fotoğrafın hepsi bu` }} />
    </Screen>
  );
}

export const Infinite: Story = {
  name: "Sonsuz Pano (infinite)",
  ...storyDoc("`infinite`: sona 600pt kala `onLoadMore`; yüklenirken altta gösterge, bitince `endMessage`. Kaydıramayan kullanıcı için \"Daha fazla yükle\" düğmesi de var.", `<Masonry items={pins} infinite={{ hasMore, loading, onLoadMore: fetchNext }} />`),
  render: () => <InfiniteDemo />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Veri yokken farklı yükseklikte yer tutucular (`skeletonCount`).", `<Masonry skeleton={isLoading} items={pins ?? []} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Screen height={420}>
          <Masonry skeleton={skeleton} items={skeleton ? [] : photoItems(8)} accessibilityLabel="Pano" contentContainerStyle={{ padding: 8 }} />
        </Screen>
      )}
    </SkeletonDemo>
  ),
};
