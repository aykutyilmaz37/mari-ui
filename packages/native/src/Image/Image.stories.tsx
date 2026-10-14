import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { ImageIcon, RefreshCw } from "lucide-react-native";
import { Image } from "./Image";
import { ImageViewer, type ImageViewerItem } from "./ImageViewer";
import type { ImageLoader } from "./types";
import { Button } from "../Button";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { picsumLoader, storyPhotos } from "../stories/storyPhotos";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, jsxProps, storyDoc, withNarrow, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Image> = {
  title: "Native/Veri Gösterimi/Image",
  component: Image,
  tags: ["autodocs"],
  // İlk dekoratör en içte: story tam genişlik, tema onun dışında.
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Görseli kademeli yükler: önce küçük ve bulanık bir ön izleme, asıl görsel gelince yumuşak geçişle üstüne. Yer önceden ayrılır (`aspectRatio` ya da `width`/`height`) → yüklenince ekran kaymaz. CDN boyutlandırma `loader` ile. `preview` ile dokununca tam ekran görüntüleyici açılır.",
    whenToUse: ["İçerik görselleri: ürün, haber, kapak, galeri küçük resmi.", "Yavaş bağlantıda bile ekran düzeni sabit kalmalıysa (oran + ön izleme).", "Görselin büyütülüp incelenmesi gerekiyorsa (`preview`)."],
    whenNotToUse: ["İkon — doğrudan ikon bileşeni.", "Kişi fotoğrafı/baş harfi — Avatar.", "Çok sayıda fotoğrafın tarihe göre listelenmesi — ImageGallery."],
    vsWeb: "Prop adları aynı; `className`/`wrapperClassName` → `style` (kutu) + `imageStyle`. `src` ayrıca `require(\"./foto.jpg\")` alır (boyutu önceden bilinir). `srcSet`/`sizes` yok: `loader`a kutu genişliği × ekran piksel oranına en yakın `widths` adayı TEK istek olarak gider (kutu ölçülene kadar istek yok). `loading`/`priority` yok (RN görseli ekrana gelince yükler). `scale-down` RN'de yok: büyük görselde `contain`, küçükte ortada. Önizleme: tam ekran, aşağı çek = kapat, çift dokun / iki parmak = yakınlaş; ekran okuyucuda kutu `imagebutton`, görüntüleyicide yukarı/aşağı kaydırma = önceki/sonraki. Görüntüleyicide video yok.",
  }) } } },
  argTypes: {
    fit: { control: "select", options: ["cover", "contain", "fill", "none", "scale-down"] },
    aspectRatio: { control: "text" },
    placeholder: { control: "boolean" },
    preview: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Image>;

const photos = storyPhotos(12);

/** Story ızgarası: `columns` eşit sütun, 12 boşluk (web `grid gap-3`). */
function Grid({ columns, children }: Readonly<{ columns: number; children: React.ReactNode }>) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", margin: -6 }}>
      {React.Children.map(children, (child) => (
        <View style={{ width: `${100 / columns}%`, padding: 6 }}>{child}</View>
      ))}
    </View>
  );
}

function Caption({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useTheme();
  return <Text style={{ fontSize: 13, lineHeight: 18, color: theme.color.canvas.muted, marginTop: 6 }}>{children}</Text>;
}

export const Playground: Story = {
  ...storyDoc(
    "Tüm prop'ları canlı deneyin. Adres üretimi `loader`da; CDN parametrelerini kendi servisinize göre değiştirin.",
    (args) => `
const cdnLoader: ImageLoader = ({ src, width, quality = 75 }) => \`\${src}?w=\${width}&q=\${quality}\`;

<Image ${jsxProps(args, { skip: ["loader"] })} loader={cdnLoader} />`
  ),
  decorators: [withNarrow],
  args: { src: photos[0]!.src, alt: photos[0]!.alt, loader: picsumLoader, aspectRatio: "3/2", placeholder: true, preview: true, fit: "cover", skeleton: false },
};

function ProgressiveDemo() {
  const theme = useTheme();
  const [round, setRound] = useState(0);
  // Önbelleği atlamak için her turda farklı adres.
  const loader: ImageLoader = (p) => `${picsumLoader(p)}?r=${round}`;
  return (
    <View style={{ gap: 12, alignItems: "flex-start" }}>
      <Button size="sm" variant="outline" color="neutral" icon={<RefreshCw />} onPress={() => setRound((r) => r + 1)}>
        Yeniden yükle
      </Button>
      <View style={{ alignSelf: "stretch" }}>
        <Grid columns={2}>
          <View>
            <Image key={`a${round}`} src={photos[0]!.src} alt={photos[0]!.alt} loader={loader} aspectRatio="3/2" placeholder />
            <Caption>Bulanık ön izleme</Caption>
          </View>
          <View>
            <Image key={`b${round}`} src={photos[2]!.src} alt={photos[2]!.alt} loader={loader} aspectRatio="3/2" placeholder={<ImageIcon size={32} color={theme.color.canvas.muted} />} />
            <Caption>Özel yer tutucu</Caption>
          </View>
        </Grid>
      </View>
    </View>
  );
}

export const Progressive: Story = {
  name: "Kademeli Yükleme",
  ...storyDoc(
    "`placeholder`: önce küçük boy (`loader` ile 24px) bulanık gösterilir, asıl görsel yüklenince üstüne solarak gelir. `{ src, blurDataURL }` kaynaklarında `blurDataURL` kendiliğinden kullanılır. \"Yeniden yükle\" önbelleği atlayıp geçişi tekrar gösterir.",
    `<Image src="/seed/kapadokya/1600/1067" alt="Kapadokya" aspectRatio="3/2" loader={cdnLoader} placeholder />
<Image src="/fotograflar/efes.jpg" alt="Efes antik kenti" aspectRatio="3/2" loader={cdnLoader} placeholder={<ImageIcon size={32} />} />`
  ),
  render: () => <ProgressiveDemo />,
};

export const WithLoader: Story = {
  name: "CDN ile (loader)",
  ...storyDoc(
    "Adres üretimi `loader`da: kaynak + istenen genişlik → URL. Native'de kutu ölçülür, genişlik × ekran piksel oranına en yakın `widths` adayı istenir (343pt kutu, 3x ekran → 1080). Sabit sayısal `width`te tam o boy × oran. Tek satırlık bir sarmalayıcı tüm uygulamada aynı ayarı kullandırır.",
    `const cdnLoader: ImageLoader = ({ src, width, quality = 75 }) => \`https://cdn.ornek.com\${src}?w=\${width}&q=\${quality}\`;
export const AppImage = (props: ImageProps) => <Image loader={cdnLoader} {...props} />;

<AppImage src="/urunler/canta.jpg" alt="Deri çanta" aspectRatio="1" />
<AppImage src="/logo.png" alt="Logo" width={120} height={40} />`
  ),
  render: () => (
    <Grid columns={2}>
      {photos.slice(0, 4).map((p) => (
        <Image key={p.key} src={p.src} alt={p.alt} loader={picsumLoader} aspectRatio="1" placeholder />
      ))}
    </Grid>
  ),
};

export const Preview: Story = {
  name: "Önizleme",
  ...storyDoc(
    "`preview`: kutu bir düğme olur; dokununca tam ekran açılır. Çift dokunuş ya da iki parmak yakınlaştırır, yakınken sürükleyerek gezilir; aşağı çekmek kapatır, tek dokunuş üst/alt çubukları gizler. `preview.src` daha yüksek çözünürlüklü kaynak, `preview.caption` açıklama.",
    `<Image src={urun.kucuk} alt="Seramik vazo" aspectRatio="1" preview />
<Image src={foto.src} alt="Efes" aspectRatio="4/3" preview={{ src: foto.orijinal, caption: "Efes Antik Kenti, Selçuk" }} />`
  ),
  render: () => (
    <Grid columns={2}>
      {photos.slice(3, 7).map((p, i) => (
        <Image
          key={p.key}
          src={p.src}
          alt={p.alt}
          loader={picsumLoader}
          aspectRatio="4/3"
          placeholder
          preview={i === 1 ? { caption: `${p.alt.split(" — ")[0]} · ${p.takenAt.toLocaleDateString("tr-TR", { dateStyle: "long" })}` } : true}
        />
      ))}
    </Grid>
  ),
};

export const Fallback: Story = {
  name: "Yedek Görsel",
  ...storyDoc(
    "Yüklenemezse: varsayılan ikon + metin; `fallback` bir URL (yedek görsel) ya da node olabilir. Yedek URL de yüklenemezse varsayılana düşülür.",
    `<Image src="https://ornek.com/yok.jpg" alt="Ürün" aspectRatio="1" />
<Image src="https://ornek.com/yok.jpg" alt="Ürün" aspectRatio="1" fallback="https://ornek.com/gorsel-yok.png" fit="contain" />
<Image src="https://ornek.com/yok.jpg" alt="Ürün" aspectRatio="1" fallback={<Text>Görsel yakında</Text>} />`
  ),
  render: () => (
    <Grid columns={3}>
      <Image src="https://picsum.photos/bozuk-adres.jpg" alt="Ürün görseli" aspectRatio="1" />
      <Image src="https://picsum.photos/bozuk-adres.jpg" alt="Ürün görseli" aspectRatio="1" fallback="https://picsum.photos/seed/mari-fallback/300/300?grayscale" fit="contain" />
      <Image src="https://picsum.photos/bozuk-adres.jpg" alt="Ürün görseli" aspectRatio="1" fallback={<Text style={{ fontSize: 13, textAlign: "center" }}>Görsel yakında</Text>} />
    </Grid>
  ),
};

const viewerItems: ImageViewerItem[] = photos.slice(0, 6).map((p) => ({ key: p.key, src: p.src, alt: p.alt, caption: p.alt.split(" — ")[0] }));

function ViewerDemo() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  return (
    <>
      <Button onPress={() => setOpen(true)}>{`Albümü aç (${viewerItems.length})`}</Button>
      <ImageViewer items={viewerItems} open={open} onClose={() => setOpen(false)} index={index} onIndexChange={setIndex} loader={picsumLoader} />
    </>
  );
}

export const Viewer: Story = {
  name: "Görüntüleyici (ImageViewer)",
  ...storyDoc(
    "`ImageViewer` tek başına da kullanılır (kendi düğmeniz, kendi listeniz). Yana kaydırarak geçiş, alt şeritten atlama; `actions` üst çubuğa eylem ekler. Ekran okuyucuda yukarı/aşağı kaydırma önceki/sonraki öğeye geçer.",
    `const [open, setOpen] = useState(false);
<Button onPress={() => setOpen(true)}>Albümü aç</Button>
<ImageViewer
  open={open}
  onClose={() => setOpen(false)}
  loader={cdnLoader}
  items={[
    { key: 1, src: "/seed/kapadokya/1600/1067", alt: "Kapadokya", caption: "Göreme" },
    { key: 2, src: "/seed/kas/1200/1600", alt: "Kaş" },
  ]}
/>`
  ),
  render: () => <ViewerDemo />,
};

function Framed({ fit }: Readonly<{ fit: "cover" | "contain" }>) {
  const theme = useTheme();
  return (
    <View>
      <Image src={photos[1]!.src} alt={photos[1]!.alt} loader={picsumLoader} width={140} height={140} fit={fit} style={{ borderWidth: 1, borderColor: theme.color.canvas.border }} />
      <Caption>{fit}</Caption>
    </View>
  );
}

export const Fit: Story = {
  name: "Sığdırma ve Oran",
  ...storyDoc(
    "`fit` (varsayılan `cover`: kutuyu doldurur, taşanı kırpar; `contain`: tamamı görünür). Kutu boyutu `aspectRatio` ya da `width`/`height` ile — sayı pt, yüzde kaba göre.",
    `<Image src="/urunler/canta.jpg" alt="Deri çanta" width={140} height={140} fit="cover" />
<Image src="/urunler/canta.jpg" alt="Deri çanta" width={140} height={140} fit="contain" />
<Image src="/urunler/canta.jpg" alt="Deri çanta" aspectRatio="16/9" />`
  ),
  render: () => (
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
        <Framed fit="cover" />
        <Framed fit="contain" />
      </View>
      <View>
        <Image src={photos[4]!.src} alt={photos[4]!.alt} loader={picsumLoader} aspectRatio="16/9" />
        <Caption>{'aspectRatio="16/9"'}</Caption>
      </View>
    </View>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Image skeleton={isLoading} src="/urunler/canta.jpg" alt="Deri çanta" aspectRatio="4/3" preview />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Grid columns={2}>
          {photos.slice(6, 10).map((p) => (
            <Image key={p.key} skeleton={skeleton} src={p.src} alt={p.alt} loader={picsumLoader} aspectRatio="4/3" preview />
          ))}
        </Grid>
      )}
    </SkeletonDemo>
  ),
};
