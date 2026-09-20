import type { Meta, StoryObj } from "@storybook/react";
import { Camera, Gamepad2, Headphones, Sparkles, Truck, Wallet, Watch, ShoppingBag } from "lucide-react";
import React from "react";
import { Button } from "../button";
import { Carousel } from "./Carousel";
import { componentDoc, storyDoc } from "../lib/storyMeta";

const meta: Meta<typeof Carousel> = {
  title: "Veri Gösterimi/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    // Not: eskiden `layout: "centered"` idi — Storybook'un canvas'ı hiçbir
    // gerçek genişlik vermiyor, Carousel'in kendi `w-full`ı da bu yüzden
    // içeriğe (örn. "Slayt 1" metnine) küçülüyordu; sonuç gerçek bir
    // carousel değil, küçük bir kutu gibi görünüyordu. `"padded"` canvas'a
    // gerçek bir genişlik veriyor.
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "[Embla Carousel](https://www.embla-carousel.com/) üzerine kurulu slayt gösterici. `embla-carousel-" +
            "react`/`embla-carousel-autoplay` opsiyonel peer bağımlılıktır — sadece bu component'i kullanan " +
            "tüketiciler kurar.",
          whenToUse: [
            "Bir dizi görsel/banner'ı sınırlı bir alanda sırayla göstermek için (kampanya banner'ları, ürün galerisi).",
            "Kullanıcının okla/sürükleyerek/otomatik olarak gezinebileceği bir dizi kart için.",
          ],
          whenNotToUse: ["İçerik tek seferde taranabilecek kadar kısaysa — bir listede/grid'de göstermek genelde daha erişilebilirdir."],
          a11y:
            "Önceki/sonraki okları ve nokta göstergeleri `aria-label` taşır (`\"Önceki slayt\"`, `\"N. slayta git\"`); " +
            "aktif nokta `aria-current` alır. **Not:** eskiden `slick-carousel`'den kalma `infinite`/`autoplaySpeed` " +
            "prop isimleri kullanılıyordu; Embla'ya geçişte `loop`/`autoplayDelay` olarak yeniden adlandırıldı.",
        }),
      },
    },
  },
  argTypes: {
    arrows: { control: "boolean", description: "Önceki/sonraki ok butonlarını gösterir." },
    arrowsVisibility: {
      control: "select",
      options: ["always", "hover"],
      description: "`always` (varsayılan) her zaman görünür, `hover` yalnızca carousel'in üzerine gelindiğinde/klavye odağında belirir.",
    },
    arrowsPlacement: {
      control: "select",
      options: ["sides", "top-left", "top-right", "bottom-left", "bottom-right"],
      description: "`sides` (varsayılan) biri solda biri sağda, dikeyde ortalanmış. Köşe değerleri ikisini de tek köşede gruplar — metin ağırlıklı slaytların üzerine binmemek için.",
    },
    autoplay: { control: "boolean", description: "Otomatik ilerlemeyi açar." },
    autoplayDelay: { control: "number", description: "Otomatik ilerleme aralığı (ms). Eskiden `autoplaySpeed`." },
    loop: { control: "boolean", description: "Sona gelince başa döner. Eskiden `infinite`." },
    draggable: { control: "boolean", description: "Fare/dokunma ile sürükleyerek gezinmeyi açar." },
    slidesToShow: { control: "number", description: "Aynı anda görünecek slayt sayısı." },
    slidesToScroll: { control: "number", description: "Her adımda kaydırılacak slayt sayısı." },
    dotPosition: { control: "select", options: ["top", "bottom", "left", "right"], description: "Sayfa noktalarının (dots) konumu. Sadece `dotsPlacement=\"overlay\"` iken anlamlı." },
    dotsPlacement: {
      control: "select",
      options: ["overlay", "outside"],
      description: "`overlay` (varsayılan) carousel'in üzerine biner. `outside` noktaları normal akışa alıp carousel'in ALTINA render eder — slayt içeriğiyle çakışmaz.",
    },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

/**
 * Soyut renkli kutular yerine tüm story'lerde tek, tutarlı bir gerçek kullanım
 * senaryosu: bir ürün galerisi. Görsel yerine (bize ait olmayan bir stok
 * fotoğraf kullanmamak için) tasarım sisteminin kendi renk rolleriyle
 * ikon + zemin kullanılıyor.
 */
const products = [
  { name: "Kablosuz Kulaklık", price: "899₺", icon: <Headphones className="h-14 w-14" />, tone: "primary" },
  { name: "Akıllı Saat", price: "1.499₺", icon: <Watch className="h-14 w-14" />, tone: "accent" },
  { name: "Aksiyon Kamerası", price: "2.199₺", icon: <Camera className="h-14 w-14" />, tone: "success" },
  { name: "Oyun Kolu", price: "749₺", icon: <Gamepad2 className="h-14 w-14" />, tone: "warning" },
  { name: "Deri Cüzdan", price: "429₺", icon: <Wallet className="h-14 w-14" />, tone: "info" },
  { name: "Sırt Çantası", price: "649₺", icon: <ShoppingBag className="h-14 w-14" />, tone: "error" },
] as const;

const TONE_CLASS: Record<(typeof products)[number]["tone"], string> = {
  primary: "bg-mari-primary-subtle text-mari-primary-subtle-contrast",
  accent: "bg-mari-accent-subtle text-mari-accent-subtle-contrast",
  success: "bg-mari-success-subtle text-mari-success-subtle-contrast",
  warning: "bg-mari-warning-subtle text-mari-warning-subtle-contrast",
  info: "bg-mari-info-subtle text-mari-info-subtle-contrast",
  error: "bg-mari-error-subtle text-mari-error-subtle-contrast",
};

function makeProductSlides(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const product = products[i % products.length]!;
    return (
      <div key={`product-${i}`} className="px-1.5">
        <div className="overflow-hidden rounded-lg border border-mari-border bg-mari-surface">
          <div className={`flex h-48 items-center justify-center ${TONE_CLASS[product.tone]}`}>{product.icon}</div>
          <div className="p-3">
            <p className="font-medium text-mari-foreground">{product.name}</p>
            <p className="text-sm text-mari-muted">{product.price}</p>
          </div>
        </div>
      </div>
    );
  });
}

const productSlides = makeProductSlides(3);

/**
 * Bir e-ticaret sayfasının üstündeki kampanya banner'ı.
 */
const promoSlides = [
  {
    key: "summer",
    icon: <Sparkles className="h-10 w-10" />,
    eyebrow: "Sınırlı Süre",
    title: "Yaz Koleksiyonu %30 İndirimli",
    description: "Seçili ürünlerde geçerli — stoklarla sınırlı.",
    cta: "Alışverişe Başla",
    className: "bg-gradient-to-br from-mari-primary-subtle to-mari-primary-subtle/40 text-mari-primary-subtle-contrast",
  },
  {
    key: "shipping",
    icon: <Truck className="h-10 w-10" />,
    eyebrow: "Bu Hafta",
    title: "500₺ Üzeri Ücretsiz Kargo",
    description: "Ek bir kod girmenize gerek yok, sepette otomatik uygulanır.",
    cta: "Ürünleri Keşfet",
    className: "bg-gradient-to-br from-mari-success-subtle to-mari-success-subtle/40 text-mari-success-subtle-contrast",
  },
  {
    key: "new-arrivals",
    icon: <ShoppingBag className="h-10 w-10" />,
    eyebrow: "Yeni Geldi",
    title: "Sonbahar/Kış Koleksiyonu",
    description: "İlk 48 saatte alışveriş yapana özel erken erişim.",
    cta: "Koleksiyonu Gör",
    className: "bg-gradient-to-br from-mari-accent-subtle to-mari-accent-subtle/40 text-mari-accent-subtle-contrast",
  },
] as const;

export const PromoBanner: Story = {
  name: "Kampanya Bannerı",
  ...storyDoc(
    "Bir e-ticaret sayfasının üst kısmında dönen kampanya banner'ı. `autoplay` + `loop` açık, her slaytın kendi " +
      "başlığı/açıklaması/eylem butonu var."
  ),
  render: () => (
    <Carousel autoplay autoplayDelay={4000} loop arrows dots>
      {promoSlides.map((slide) => (
        <div key={slide.key} className={`flex h-72 flex-col items-center justify-center gap-3 px-8 text-center ${slide.className}`}>
          {slide.icon}
          <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{slide.eyebrow}</span>
          <h3 className="text-2xl font-bold">{slide.title}</h3>
          <p className="max-w-md text-sm opacity-90">{slide.description}</p>
          <Button color="primary" className="mt-2">
            {slide.cta}
          </Button>
        </div>
      ))}
    </Carousel>
  ),
};

export const Basic: Story = {
  name: "Temel",
  ...storyDoc("Varsayılan hâl: tek seferde bir slayt, oklar/noktalar kapalı (yalnızca sürükleyerek gezinilir)."),
  args: {
    children: productSlides,
  },
};

export const WithArrows: Story = {
  name: "Ok Butonlu",
  ...storyDoc("`arrows` açıkken önceki/sonraki okları görünür — ikisi de erişilebilir isim taşır."),
  args: {
    arrows: true,
    children: productSlides,
  },
};

export const HoverArrows: Story = {
  name: "Üzerine Gelince Beliren Oklar",
  ...storyDoc(
    "`arrowsVisibility=\"hover\"` iken oklar varsayılan olarak görünmez, carousel'in üzerine gelince belirir — " +
      "daha sade bir görünüm ister ama slaytların üzerinde sabit bir kontrol istemeyen yerler için. Fareye " +
      "bağımlı kalmamak adına klavye odağında (`Tab`) da görünür."
  ),
  args: {
    arrows: true,
    arrowsVisibility: "hover",
    children: productSlides,
  },
};

export const Autoplay: Story = {
  name: "Otomatik Oynatma",
  ...storyDoc("`autoplay` + `autoplayDelay` (ms) — bir ürün galerisinde dikkat çekmek için. Kullanıcı sürüklemeye başlarsa (`autoplayStopOnInteraction`, varsayılan `true`) otomatik oynatma durur."),
  args: {
    autoplay: true,
    autoplayDelay: 2000, // eskiden autoplaySpeed
    children: productSlides,
  },
};

export const SlidesToShow: Story = {
  name: "Aynı Anda Görünen Slayt Sayısı",
  ...storyDoc(
    "`slidesToShow` ile bir kerede kaç ürünün görüneceği ayarlanır — bir ürün galerisinin 'vitrin' önizlemesi. " +
      "`dotsPlacement=\"outside\"`: noktalar varsayılan `overlay` konumda kartların alt kenarına (fiyat satırına) " +
      "biniyordu — dışarı, carousel'in altına alındı."
  ),
  args: {
    slidesToShow: 3,
    children: makeProductSlides(6),
    arrows: true,
    dotsPlacement: "outside",
  },
};

export const SlidesToScroll: Story = {
  name: "Adım Başına Kaydırma",
  ...storyDoc(
    "`slidesToShow` ile `slidesToScroll` farklı olabilir — burada 4 ürün gösterilir, her adımda 2 ürün kaydırılır. " +
      "`dotsPlacement=\"outside\"`: noktalar kart içeriğiyle çakışmasın diye dışarı, carousel'in altına alındı."
  ),
  args: {
    slidesToShow: 4,
    slidesToScroll: 2,
    arrows: true,
    loop: true,
    dotsPlacement: "outside",
    children: makeProductSlides(6),
  },
};

export const ArrowsPlacements: Story = {
  name: "Ok Yerleşimleri",
  ...storyDoc("`arrowsPlacement`: `sides` (varsayılan) veya dört köşeden biri (`top-left`/`top-right`/`bottom-left`/`bottom-right`) — köşe değerlerinde oklar tek grupta yan yana durur."),
  render: () => (
    <div className="flex flex-col gap-6">
      {(["sides", "top-left", "top-right", "bottom-left", "bottom-right"] as const).map((placement) => (
        <div key={`arrows-${placement}`} className="w-[640px]">
          <p className="mb-2 font-medium">arrowsPlacement: {placement}</p>
          <Carousel arrows arrowsPlacement={placement}>
            {productSlides}
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

export const DotPositions: Story = {
  name: "Nokta Konumları",
  ...storyDoc(
    "`dotPosition`: `top`/`bottom`/`left`/`right` — bunlar `dotsPlacement=\"overlay\"` (varsayılan) iken carousel'in " +
      "üzerine biner. `dotsPlacement=\"outside\"` ise `dotPosition`'dan bağımsız, noktaları normal akışa alıp " +
      "carousel'in ALTINA render eder — 3'lü/4'lü gösterilen galerilerde (slayt içeriğiyle çakışmasın diye) tercih " +
      "edilen yerleşim budur. Aktif nokta `aria-current` taşır. Oklar burada kapalı — odak noktaları göstermek."
  ),
  render: () => (
    <div className="flex flex-col gap-6">
      {(["top", "bottom", "left", "right"] as const).map((position) => (
        <div key={`dots-${position}`} className="w-[640px]">
          <p className="mb-2 font-medium">Noktalar: {position}</p>
          <Carousel dotPosition={position} arrows={false}>
            {productSlides}
          </Carousel>
        </div>
      ))}
      <div className="w-[640px]">
        <p className="mb-2 font-medium">Noktalar: outside</p>
        <Carousel dotsPlacement="outside" arrows={false}>
          {productSlides}
        </Carousel>
      </div>
    </div>
  ),
};

/** Gerçek yorumlar doğal olarak farklı uzunlukta olur — "değişken yükseklik" için en gerçekçi senaryo. */
const testimonials = [
  { name: "Aykut Y.", rating: "★★★★★", text: "Kargo hızlıydı, teşekkürler!" },
  {
    name: "Deniz K.",
    rating: "★★★★☆",
    text:
      "Ürün açıklamada belirtildiği gibi kaliteliydi, kargo paketlemesi de özenliydi. Bir sonraki siparişimde de " +
      "aynı mağazayı tercih edeceğim, herkese tavsiye ederim.",
  },
  { name: "Elif Ş.", rating: "★★★★★", text: "Beklediğimden daha kaliteli çıktı, çok memnun kaldım." },
];

function makeTestimonialSlides() {
  return testimonials.map((t) => (
    <div key={t.name} className="px-1.5">
      <div className="rounded-lg border border-mari-border bg-mari-surface p-6">
        <p className="text-mari-warning">{t.rating}</p>
        <p className="mt-2 text-mari-foreground">{t.text}</p>
        <p className="mt-3 text-sm font-medium text-mari-muted">{t.name}</p>
      </div>
    </div>
  ));
}

export const AdaptiveHeight: Story = {
  name: "Değişken Yükseklik",
  ...storyDoc(
    "Gerçek müşteri yorumları doğal olarak farklı uzunlukta olur. Embla tarafında yükseklik sabit; farklı içerik " +
      "yüksekliklerini görmek için container `auto` bırakılır. Dışarıdan yükseklik kontrolü isteniyorsa slayt " +
      "içinde `min-h`/`aspect` kullanılabilir. `arrowsPlacement=\"top-right\"`: varsayılan `sides` konumda oklar " +
      "dikeyde ortalanıp yorum metninin üzerine biniyordu — ikisi de sağ üst köşeye taşındı."
  ),
  args: {
    children: makeTestimonialSlides(),
    arrows: true,
    arrowsPlacement: "top-right",
  },
};

export const LoopingAutoplay: Story = {
  name: "Döngülü Otomatik Oynatma",
  ...storyDoc("`loop` + `autoplay` birlikte — sona gelince başa döner, sürekli akan bir vitrin sunar."),
  args: {
    loop: true, // eskiden infinite
    arrows: true,
    autoplay: true,
    autoplayDelay: 1500, // eskiden autoplaySpeed
    children: productSlides,
  },
};

export const Draggable: Story = {
  name: "Sürüklenebilir",
  ...storyDoc("`draggable` fare/dokunma ile sürüklemeyi açar — klavye kullanıcıları için ok butonları hâlâ gerekli."),
  args: {
    draggable: true,
    arrows: true,
    children: productSlides,
  },
};

export const Responsive: Story = {
  name: "Duyarlı (Responsive)",
  ...storyDoc(
    "`responsive` dizisi, ekran genişliğine göre `slidesToShow`/`slidesToScroll` değerlerini değiştirir " +
      "(Tailwind breakpoint'lerinden bağımsız, doğrudan `window.innerWidth`) — bir ürün galerisinde dar ekranda " +
      "daha az, geniş ekranda daha çok ürün göstermek için tipik kullanım."
  ),
  args: {
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      { breakpoint: 1024, slidesToShow: 3, slidesToScroll: 3 },
      { breakpoint: 768, slidesToShow: 2, slidesToScroll: 2 },
      { breakpoint: 480, slidesToShow: 1, slidesToScroll: 1 },
    ],
    arrows: true,
    loop: true,
    dotsPlacement: "outside",
    children: makeProductSlides(6),
  },
};
