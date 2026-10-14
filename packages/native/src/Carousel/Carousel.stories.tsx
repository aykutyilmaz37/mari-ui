import React from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Camera, Gamepad2, Headphones, ShoppingBag, Sparkles, Truck, Wallet, Watch } from "lucide-react-native";
import type { ColorRole } from "@mari-ui/core";
import { Carousel } from "./Carousel";
import { Button } from "../Button";
import { Image } from "../Image";
import { Text, Title } from "../Typography";
import { toPx } from "../theme/toPx";
import { useTheme } from "../theme/useTheme";
import { picsumLoader, storyPhotos } from "../stories/storyPhotos";
import { SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Carousel> = {
  title: "Native/Veri Gösterimi/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  // İlk dekoratör en içte: story tam genişlik, tema onun dışında.
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Slayt gösterici: parmakla yana kaydırarak, noktalarla ya da otomatik ilerleyerek gezinilir. `loop` kesintisizdir (sondan ileri ilk slayt yandan gelir). Aynı anda birden çok slayt (`slidesToShow`) ve adım başına kaydırma (`slidesToScroll`) ayarlanır.",
    whenToUse: ["Sınırlı alanda sırayla gösterilen banner'lar, ürün vitrini, fotoğraflar.", "Kullanıcının kaydırarak göz gezdireceği kart dizisi."],
    whenNotToUse: ["İçerik tek seferde taranabilecek kadar kısaysa — liste ya da ızgara daha erişilebilir.", "Önemli bilgi tek bir slaytta saklıysa (çoğu kullanıcı ilk slayttan sonrasını görmez)."],
    vsWeb: "Prop adları aynı (`className`/`itemClassName`/`viewportClassName` → `style`/`itemStyle`/`viewportStyle`). Embla yerine kendi izimiz (Animated + PanResponder, ek paket yok); yalnız YATAY sürükleme yakalanır, dikey kaydırma sayfaya kalır. **`arrows` native'de varsayılan `false`** (kaydırma + noktalar). `arrowsVisibility=\"hover\"` dokunmatikte anlamsız — yok sayılır. `responsive` aynı kural (pencere genişliği). Otomatik oynatma dokununca duraklar, durdur/başlat düğmesi var, \"Hareketi azalt\" açıksa başlamaz. Ekran okuyucuda görünmeyen slaytlar ve döngü kopyaları gizli; noktalar \"N. slayta git\" düğmeleri (seçili durumlu). `speed` web ölçeğinde (≈ speed × 16 ms).",
  }) } } },
  argTypes: {
    arrows: { control: "boolean" },
    arrowsPlacement: { control: "select", options: ["sides", "top-left", "top-right", "bottom-left", "bottom-right"] },
    autoplay: { control: "boolean" },
    autoplayDelay: { control: "number" },
    loop: { control: "boolean" },
    draggable: { control: "boolean" },
    slidesToShow: { control: "number" },
    slidesToScroll: { control: "number" },
    dotPosition: { control: "select", options: ["top", "bottom", "left", "right"] },
    dotsPlacement: { control: "select", options: ["overlay", "outside"] },
    skeleton: { control: "boolean" },
  },
};
export default meta;
type Story = StoryObj<typeof Carousel>;

const products = [
  { name: "Kablosuz Kulaklık", price: "899₺", Icon: Headphones, tone: "primary" },
  { name: "Akıllı Saat", price: "1.499₺", Icon: Watch, tone: "accent" },
  { name: "Aksiyon Kamerası", price: "2.199₺", Icon: Camera, tone: "success" },
  { name: "Oyun Kolu", price: "749₺", Icon: Gamepad2, tone: "warning" },
  { name: "Deri Cüzdan", price: "429₺", Icon: Wallet, tone: "info" },
  { name: "Sırt Çantası", price: "649₺", Icon: ShoppingBag, tone: "error" },
] as const;

function ProductCard({ index, gutter = true }: Readonly<{ index: number; gutter?: boolean }>) {
  const theme = useTheme();
  const p = products[index % products.length]!;
  const tone = theme.color[p.tone as ColorRole];
  return (
    <View style={gutter ? { paddingHorizontal: 6 } : undefined}>
      <View style={{ overflow: "hidden", borderRadius: toPx(theme.radius.lg), borderWidth: 1, borderColor: theme.color.canvas.border, backgroundColor: theme.color.canvas.surface }}>
        <View style={{ height: 160, alignItems: "center", justifyContent: "center", backgroundColor: tone.subtle }}>
          <p.Icon size={56} color={tone.subtleContrast} />
        </View>
        <View style={{ padding: 12 }}>
          <Text weight="medium" numberOfLines={1}>{p.name}</Text>
          <Text style={{ fontSize: 14, color: theme.color.canvas.muted }}>{p.price}</Text>
        </View>
      </View>
    </View>
  );
}

const makeProductSlides = (count: number, opts?: { gutter?: boolean }) => Array.from({ length: count }, (_, i) => <ProductCard key={`urun-${i}`} index={i} gutter={opts?.gutter} />);
const productSlides = makeProductSlides(3);

const promos = [
  { key: "yaz", Icon: Sparkles, eyebrow: "Sınırlı Süre", title: "Yaz Koleksiyonu %30 İndirimli", description: "Seçili ürünlerde geçerli — stoklarla sınırlı.", cta: "Alışverişe Başla", tone: "primary" },
  { key: "kargo", Icon: Truck, eyebrow: "Bu Hafta", title: "500₺ Üzeri Ücretsiz Kargo", description: "Ek bir kod girmenize gerek yok, sepette otomatik uygulanır.", cta: "Ürünleri Keşfet", tone: "success" },
  { key: "yeni", Icon: ShoppingBag, eyebrow: "Yeni Geldi", title: "Sonbahar/Kış Koleksiyonu", description: "İlk 48 saatte alışveriş yapana özel erken erişim.", cta: "Koleksiyonu Gör", tone: "accent" },
] as const;

function PromoSlide({ promo }: Readonly<{ promo: (typeof promos)[number] }>) {
  const theme = useTheme();
  const tone = theme.color[promo.tone as ColorRole];
  return (
    <View style={{ height: 320, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32, paddingBottom: 28, backgroundColor: tone.subtle }}>
      <promo.Icon size={40} color={tone.subtleContrast} />
      <Text weight="semibold" style={{ fontSize: 12, letterSpacing: 0.6, textTransform: "uppercase", color: tone.subtleContrast }}>{promo.eyebrow}</Text>
      <Title level={4} style={{ textAlign: "center", color: tone.subtleContrast }}>{promo.title}</Title>
      <Text style={{ fontSize: 14, textAlign: "center", color: tone.subtleContrast }}>{promo.description}</Text>
      <Button style={{ marginTop: 6 }}>{promo.cta}</Button>
    </View>
  );
}

const testimonials = [
  { name: "Aykut Y.", rating: "★★★★★", text: "Kargo hızlıydı, teşekkürler!" },
  { name: "Deniz K.", rating: "★★★★☆", text: "Ürün açıklamada belirtildiği gibi kaliteliydi, kargo paketlemesi de özenliydi. Bir sonraki siparişimde de aynı mağazayı tercih edeceğim, herkese tavsiye ederim." },
  { name: "Elif Ş.", rating: "★★★★★", text: "Beklediğimden daha kaliteli çıktı, çok memnun kaldım." },
];

function Testimonial({ t }: Readonly<{ t: (typeof testimonials)[number] }>) {
  const theme = useTheme();
  return (
    <View style={{ paddingHorizontal: 6 }}>
      <View style={{ borderRadius: toPx(theme.radius.lg), borderWidth: 1, borderColor: theme.color.canvas.border, backgroundColor: theme.color.canvas.surface, padding: 20, paddingTop: 52, gap: 8 }}>
        <Text style={{ color: theme.color.warning.text }}>{t.rating}</Text>
        <Text>{t.text}</Text>
        <Text weight="medium" style={{ fontSize: 14, color: theme.color.canvas.muted }}>{t.name}</Text>
      </View>
    </View>
  );
}

const Label = ({ children }: { children: string }) => <Text weight="medium" style={{ marginBottom: 8 }}>{children}</Text>;

export const Playground: Story = {
  ...storyDoc("Varsayılan hâl: tek seferde bir slayt, noktalar açık, kaydırılabilir, `loop` açık. Oklar native'de varsayılan kapalı."),
  args: { children: productSlides, loop: true, draggable: true, arrows: false, autoplay: false, slidesToShow: 1, dotsPlacement: "overlay", dotPosition: "bottom", skeleton: false },
};

export const PromoBanner: Story = {
  name: "Kampanya Bannerı",
  ...storyDoc(
    "Mağaza ana ekranının üstünde dönen kampanya banner'ı: `autoplay` + `loop`. Dokununca duraklar; noktaların solundaki düğme kalıcı olarak durdurur/başlatır. \"Hareketi azalt\" açıksa kendiliğinden başlamaz.",
    `<Carousel label="Kampanyalar" autoplay autoplayDelay={4000} loop viewportStyle={{ borderRadius: 12 }}>
  {kampanyalar.map((k) => (
    <View key={k.id} style={{ height: 320, paddingBottom: 28, alignItems: "center", justifyContent: "center" }}>
      <Title level={4}>{k.baslik}</Title>
      <Button>{k.eylem}</Button>
    </View>
  ))}
</Carousel>`
  ),
  render: () => (
    <Carousel label="Kampanyalar" autoplay autoplayDelay={4000} loop viewportStyle={{ borderRadius: 12 }}>
      {promos.map((p) => (
        <PromoSlide key={p.key} promo={p} />
      ))}
    </Carousel>
  ),
};

const photos = storyPhotos(5);

export const Photos: Story = {
  name: "Fotoğraflar (Image ile)",
  ...storyDoc(
    "Ürün/ilan fotoğrafları: her slayt bir `Image` (`preview` ile dokununca tam ekran). Kaydırma ile dokunma ayrışır — yatay sürükleme carousel'in, kısa dokunuş görselin.",
    `<Carousel label="Ürün fotoğrafları" viewportStyle={{ borderRadius: 12 }}>
  {fotolar.map((f) => <Image key={f.key} src={f.src} alt={f.alt} loader={cdnLoader} aspectRatio="4/3" preview style={{ borderRadius: 0 }} />)}
</Carousel>`
  ),
  render: () => (
    <Carousel label="Ürün fotoğrafları" viewportStyle={{ borderRadius: 12 }}>
      {photos.map((p) => (
        <Image key={p.key} src={p.src} alt={p.alt} loader={picsumLoader} aspectRatio="4/3" placeholder preview style={{ borderRadius: 0 }} />
      ))}
    </Carousel>
  ),
};

export const WithArrows: Story = {
  name: "Ok Butonlu",
  ...storyDoc("`arrows` açıkken önceki/sonraki okları görünür (44pt dokunma hedefi); ikisi de erişilebilir ad taşır. Döngü kapalıyken uçtaki ok soluk ve devre dışı.", `<Carousel arrows loop={false}>{urunler}</Carousel>`),
  args: { arrows: true, loop: false, children: productSlides },
};

export const Autoplay: Story = {
  name: "Otomatik Oynatma",
  ...storyDoc("`autoplay` + `autoplayDelay` (ms). Kullanıcı kaydırırsa (`autoplayStopOnInteraction`, varsayılan `true`) otomatik oynatma durur.", `<Carousel autoplay autoplayDelay={2000}>{urunler}</Carousel>`),
  args: { autoplay: true, autoplayDelay: 2000, children: productSlides },
};

export const SlidesToShow: Story = {
  name: "Aynı Anda Görünen Slayt Sayısı",
  ...storyDoc("`slidesToShow={2}`: vitrin önizlemesi. `dotsPlacement=\"outside\"`: noktalar kartın fiyat satırına binmesin diye altta.", `<Carousel slidesToShow={2} dotsPlacement="outside">{urunler}</Carousel>`),
  args: { slidesToShow: 2, dotsPlacement: "outside", children: makeProductSlides(6) },
};

export const SlidesToScroll: Story = {
  name: "Adım Başına Kaydırma",
  ...storyDoc("`slidesToShow` ile `slidesToScroll` farklı olabilir — 2,5 ürün görünür (yarım kart devamı olduğunu ima eder), her adımda 1 kayar. Kesirli değer telefonda dar kartları sıkıştırmadan vitrin hissi verir; döngü kapalıyken son durak son kartı sağa yaslar.", `<Carousel slidesToShow={2.5} slidesToScroll={1} loop={false} dotsPlacement="outside">{urunler}</Carousel>`),
  args: { slidesToShow: 2.5, slidesToScroll: 1, loop: false, dotsPlacement: "outside", children: makeProductSlides(6) },
};

export const AdaptiveHeight: Story = {
  name: "Değişken Yükseklik",
  ...storyDoc(
    "Yorumlar farklı uzunlukta: carousel en uzun slayt kadar yüksek. `arrowsPlacement=\"top-right\"`: oklar ortada metnin üzerine binmesin diye sağ üst köşede.",
    `<Carousel arrows arrowsPlacement="top-right" dotsPlacement="outside">{yorumlar}</Carousel>`
  ),
  render: () => (
    <Carousel arrows arrowsPlacement="top-right" dotsPlacement="outside" label="Müşteri yorumları">
      {testimonials.map((t) => (
        <Testimonial key={t.name} t={t} />
      ))}
    </Carousel>
  ),
};

export const LoopingAutoplay: Story = {
  name: "Döngülü Otomatik Oynatma",
  ...storyDoc("`loop` + `autoplay`: son slayttan sonra ilk slayt yandan gelir (geri sarma yok) — sürekli akan bir vitrin.", `<Carousel loop autoplay autoplayDelay={1500}>{urunler}</Carousel>`),
  args: { loop: true, autoplay: true, autoplayDelay: 1500, children: productSlides },
};

export const Draggable: Story = {
  name: "Sürüklenebilir",
  ...storyDoc("`draggable` (varsayılan `true`) parmakla kaydırmayı açar. `false` iken yalnız noktalar/oklar gezdirir — slayt içinde yatay kaydırılan bir öğe varsa (Slider gibi) kullanın.", `<Carousel draggable={false} arrows>{urunler}</Carousel>`),
  args: { draggable: false, arrows: true, children: productSlides },
};

export const Responsive: Story = {
  name: "Duyarlı (Responsive)",
  ...storyDoc(
    "`responsive`: pencere genişliğine göre `slidesToShow`/`slidesToScroll` (web ile aynı kural). Telefonda 1, tablette 2, geniş ekranda 3 ürün.",
    `<Carousel slidesToShow={3} responsive={[
  { breakpoint: 768, slidesToShow: 2 },
  { breakpoint: 480, slidesToShow: 1 },
]} dotsPlacement="outside">{urunler}</Carousel>`
  ),
  args: {
    slidesToShow: 3,
    responsive: [
      { breakpoint: 768, slidesToShow: 2 },
      { breakpoint: 480, slidesToShow: 1 },
    ],
    dotsPlacement: "outside",
    children: makeProductSlides(6),
  },
};

export const ArrowsPlacements: Story = {
  name: "Ok Yerleşimleri",
  ...storyDoc("`arrowsPlacement`: `sides` (varsayılan) ya da dört köşeden biri — köşede oklar yan yana.", `<Carousel arrows arrowsPlacement="sides">{urunler}</Carousel>
<Carousel arrows arrowsPlacement="top-right">{urunler}</Carousel>`),
  render: () => (
    <View style={{ gap: 24 }}>
      {(["sides", "top-left", "top-right", "bottom-left", "bottom-right"] as const).map((placement) => (
        <View key={placement}>
          <Label>{`arrowsPlacement: ${placement}`}</Label>
          <Carousel arrows arrowsPlacement={placement} dots={false} label={`Ürünler (oklar: ${placement})`}>
            {productSlides}
          </Carousel>
        </View>
      ))}
    </View>
  ),
};

export const DotPositions: Story = {
  name: "Nokta Konumları",
  ...storyDoc("`dotPosition`: `top`/`bottom`/`left`/`right` (`dotsPlacement=\"overlay\"`ta slaytın üzerinde). `dotsPlacement=\"outside\"` noktaları altta ayrı satıra alır.", `<Carousel dotPosition="left">{urunler}</Carousel>
<Carousel dotsPlacement="outside">{urunler}</Carousel>`),
  render: () => (
    <View style={{ gap: 24 }}>
      {(["top", "bottom", "left", "right"] as const).map((position) => (
        <View key={position}>
          <Label>{`Noktalar: ${position}`}</Label>
          <Carousel dotPosition={position} label={`Ürünler (noktalar: ${position})`}>
            {productSlides}
          </Carousel>
        </View>
      ))}
      <View>
        <Label>Noktalar: outside</Label>
        <Carousel dotsPlacement="outside" label="Ürünler (noktalar: outside)">
          {productSlides}
        </Carousel>
      </View>
    </View>
  ),
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` her slaytı kendi kutusunda nabza çevirir (içerik görünmez yerinde kalır → yüklenince zıplama yok); oklar gizlenir, noktalar iskelet çubuğu olur, kaydırma ve otomatik oynatma kapanır. Slaytlar arası boşluğu `itemStyle` ile verin — iskelet kutuları da aynı aralıkla çizilir.",
    `<Carousel skeleton={loading} slidesToShow={2} itemStyle={{ paddingHorizontal: 6 }} dotsPlacement="outside">{urunler}</Carousel>`
  ),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Carousel skeleton={skeleton} slidesToShow={2} itemStyle={{ paddingHorizontal: 6 }} dotsPlacement="outside">
          {makeProductSlides(6, { gutter: false })}
        </Carousel>
      )}
    </SkeletonDemo>
  ),
};
