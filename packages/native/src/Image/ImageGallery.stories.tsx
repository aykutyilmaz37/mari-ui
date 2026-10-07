import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Share2, Trash2 } from "lucide-react-native";
import { ImageGallery, type ImageGalleryItem } from "./ImageGallery";
import type { GalleryView } from "./galleryUtils";
import { Button } from "../Button";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { picsumLoader, storyPhotos } from "../stories/storyPhotos";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

/** Örnek albüm: fotoğraflar + her 11. sırada bir video (kapak + süre). */
function album(count: number): ImageGalleryItem[] {
  return storyPhotos(count).map((p, i) =>
    i % 11 === 5
      ? { key: p.key, src: "https://ornek.com/cicek.mp4", poster: `https://picsum.photos/seed/mari-video-${i}/480/480`, alt: `Çiçek açarken — ${i + 1}. video`, date: p.takenAt, type: "video" as const, duration: 5 + (i % 50) }
      : { key: p.key, src: p.src, alt: p.alt, date: p.takenAt, caption: p.alt.split(" — ")[0] }
  );
}

const ALBUM = album(240);
const without = (keys: React.Key[]) => (all: ImageGalleryItem[]) => all.filter((i) => !keys.includes(i.key));

const meta: Meta<typeof ImageGallery> = {
  title: "Native/Veri Gösterimi/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs"],
  // İlk dekoratör en içte: story tam genişlik, tema onun dışında.
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Fotoğraf/video galerisi (yapı iPhone Fotoğraflar): kare küçük resimler kıl payı aralıkla, tarihe göre bölümler ve Yıllar / Aylar / Günler / Tümü görünümleri (üst görünümde başlığa dokununca bir alta inilir), sütun sayısı, seçim modu, tam ekran görüntüleyici. Binlerce öğede akıcı: satırlar sanal, `infinite` ile sonraki sayfalar istenir.",
    whenToUse: ["Kullanıcının kendi fotoğrafları/videoları, ilan ya da ürün albümü.", "Tarihe göre gezilen büyük medya koleksiyonu."],
    whenNotToUse: ["Birkaç görsel — `Image` ya da Carousel.", "Metin ağırlıklı kartlar — List."],
    vsWeb: "Prop'lar aynı (`className` → `style`, `aria-label` → `accessibilityLabel`, `headingLevel` yok). Galeri KENDİ İÇİNDE kayar (FlatList; satır konumları önceden bilindiği için ölçümsüz sanallaştırma) — ekranı doldurun (`flex: 1`) ya da yükseklik verin; ScrollView içine koymayın. Klavye ızgarası/Shift aralık seçimi yok; uzun basış seçim moduna alır (ekran okuyucuda \"Seç\" eylemi). **Video oynatılmaz:** ızgarada kapak + süre, görüntüleyicide kapak görseli (RN çekirdeğinde video oynatıcı yok; oynatmayı `viewerActions` ya da kendi ekranınızla bağlayın). Görüntüleyici küçük resimden büyüyerek açılmaz (soluklaşarak açılır).",
  }) } } },
  argTypes: {
    view: { control: "select", options: ["year", "month", "day", "all"] },
    selectable: { control: "boolean" },
    toolbar: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof ImageGallery>;

/** Galeri kendi içinde kayar: story'lerde sabit yükseklikte kutu (uygulamada ekranın kendisi). */
function Frame({ height = 560, children }: { height?: number; children: React.ReactNode }) {
  const theme = useTheme();
  return <View style={{ height, borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 12, overflow: "hidden", padding: 4 }}>{children}</View>;
}

function Note({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return <Text style={{ fontSize: 14, color: theme.color.canvas.muted, fontVariant: ["tabular-nums"] }}>{children}</Text>;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  args: { items: ALBUM.slice(0, 60), loader: picsumLoader, title: "Fotoğraflar", selectable: true, toolbar: true, skeleton: false },
  render: (args) => (
    <Frame>
      <ImageGallery {...args} />
    </Frame>
  ),
};

export const Album: Story = {
  name: "Albüm (Tarihe Göre)",
  ...storyDoc(
    "Öğeler `date` ile bölümlenir (Bugün / Dün / tarih). Üstteki seçiciden Yıllar / Aylar / Günler / Tümü; Yıllar ve Aylar'da bir başlığa dokunmak bir alt görünüme iner ve o bölüme kaydırır. Büyüteç düğmeleri sütun sayısını değiştirir (görünüm değişince yeniden kendiliğinden olur). Bir küçük resme dokununca tam ekran görüntüleyici açılır.",
    `<ImageGallery
  style={{ flex: 1 }}
  title="Fotoğraflar"
  loader={cdnLoader}
  items={fotolar.map((f) => ({ key: f.id, src: f.yol, alt: f.aciklama, date: new Date(f.cekim) }))}
/>`
  ),
  render: () => (
    <Frame>
      <ImageGallery items={ALBUM} loader={picsumLoader} title="Fotoğraflar" />
    </Frame>
  ),
};

function ViewsDemo() {
  const [view, setView] = useState<GalleryView>("year");
  return (
    <View style={{ gap: 8 }}>
      <Note>{`Geçerli görünüm: ${view}`}</Note>
      <Frame>
        <ImageGallery items={ALBUM} loader={picsumLoader} view={view} onViewChange={setView} views={["year", "month", "day"]} />
      </Frame>
    </View>
  );
}

export const Views: Story = {
  name: "Görünümler",
  ...storyDoc(
    "`view` kontrollü de kullanılabilir. Gün görünümü iri, yıl görünümü sık küçük resim gösterir (iPhone gibi). `views` araç çubuğundaki seçenekleri kısıtlar; `columns` sabit sütun verir.",
    `const [view, setView] = useState<GalleryView>("year");
<ImageGallery items={items} view={view} onViewChange={setView} views={["year", "month", "day"]} />
<ImageGallery items={items} view="all" columns={6} toolbar={false} />`
  ),
  render: () => <ViewsDemo />,
};

function SelectionDemo() {
  const [items, setItems] = useState(() => ALBUM.slice(0, 48));
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [mode, setMode] = useState(false);
  return (
    <Frame>
      <ImageGallery
        items={items}
        loader={picsumLoader}
        title="Seçim"
        selectable
        selectionMode={mode}
        onSelectionModeChange={setMode}
        selectedKeys={selected}
        onSelectionChange={setSelected}
        selectionActions={(keys) => (
          <>
            <Button size="sm" variant="ghost" color="neutral" shape="circle" icon={<Share2 />} accessibilityLabel="Paylaş" disabled={!keys.length} />
            <Button
              size="sm"
              variant="ghost"
              color="error"
              shape="circle"
              icon={<Trash2 />}
              accessibilityLabel="Sil"
              disabled={!keys.length}
              onPress={() => {
                setItems(without(keys));
                setSelected([]);
                setMode(false);
              }}
            />
          </>
        )}
      />
    </Frame>
  );
}

export const Selection: Story = {
  name: "Seçim Modu",
  ...storyDoc(
    "`selectable` araç çubuğuna \"Seç\" ekler; bir küçük resme uzun basmak da seçim moduna alır ve onu seçer. Seçim modunda dokunmak seçer/bırakır. `selectionActions` seçili anahtarlarla eylem düğmeleri çizer — silme gibi işlemler tüketicinin elinde.",
    `const [items, setItems] = useState(fotolar);
const [selected, setSelected] = useState<React.Key[]>([]);
<ImageGallery
  items={items}
  selectable
  selectedKeys={selected}
  onSelectionChange={setSelected}
  selectionActions={(keys) => (
    <Button size="sm" color="error" variant="ghost" icon={<Trash2 />} accessibilityLabel="Sil" disabled={!keys.length}
      onPress={() => setItems((all) => all.filter((i) => !keys.includes(i.key)))} />
  )}
/>`
  ),
  render: () => <SelectionDemo />,
};

const LIBRARY = album(3000);
const PAGE = 120;
const nextPage = (count: number) => Math.min(count + PAGE, LIBRARY.length);

function InfiniteDemo() {
  const [count, setCount] = useState(PAGE);
  const [loading, setLoading] = useState(false);
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setCount(nextPage);
      setLoading(false);
    }, 600);
  };
  return (
    <View style={{ gap: 8 }}>
      <Note>{`Yüklenen: ${count} / ${LIBRARY.length}`}</Note>
      <Frame>
        <ImageGallery items={LIBRARY.slice(0, count)} loader={picsumLoader} title="Kütüphane" defaultView="all" infinite={{ hasMore: count < LIBRARY.length, loading, onLoadMore: loadMore }} />
      </Frame>
    </View>
  );
}

export const Infinite: Story = {
  name: "Binlerce Öğe (Sanal + Sonsuz)",
  ...storyDoc(
    "Yalnız görünen satırlar (+ birkaç yedek) çizilir; 3000 öğede de kaydırma akıcıdır. `infinite` sona yaklaşınca `onLoadMore` çağırır (ekran okuyucu için \"Daha fazla yükle\" düğmesi de var).",
    `const { items, hasMore, loading, loadMore } = useFotolar({ sayfa: 120 });
<ImageGallery style={{ flex: 1 }} items={items} loader={cdnLoader} infinite={{ hasMore, loading, onLoadMore: loadMore }} />`
  ),
  render: () => <InfiniteDemo />,
};

export const Videos: Story = {
  name: "Video",
  ...storyDoc(
    "`type: \"video\"` öğeler ızgarada kapak görseli (`poster`) ve süreyle (`duration`, sn) görünür. Native görüntüleyicide video oynatılmaz, kapak görseli gösterilir — oynatmayı kendi oynatıcınızla bağlayın.",
    `<ImageGallery
  items={[
    { key: 1, src: "https://ornek.com/cicek.mp4", poster: "https://ornek.com/cicek.jpg", alt: "Çiçek açarken", type: "video", duration: 5, date },
    { key: 2, src: "/foto/kas.jpg", alt: "Kaş", date },
  ]}
/>`
  ),
  render: () => (
    <Frame height={420}>
      <ImageGallery items={ALBUM.filter((i, n) => i.type === "video" || n % 3 === 0).slice(0, 18)} loader={picsumLoader} defaultView="all" toolbar={false} />
    </Frame>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<ImageGallery skeleton={loading} items={items} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Frame height={480}>
          <ImageGallery skeleton={skeleton} items={ALBUM.slice(0, 24)} loader={picsumLoader} title="Fotoğraflar" />
        </Frame>
      )}
    </SkeletonDemo>
  ),
};
