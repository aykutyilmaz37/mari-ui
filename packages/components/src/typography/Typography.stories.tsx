import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Paragraph, Text, Title } from "./Typography";

/**
 * Not: `Title`/`Text`/`Paragraph` üç ayrı component ama tek bir aile — bu
 * yüzden `meta.component` bağlanmıyor; autodocs prop tablosu yerine örnekler
 * üzerinden anlatım tercih edildi.
 */
const meta: Meta = {
  title: "Genel/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Metin öğeleri için üç bileşen: `Title` (h1–h6 başlık), `Text` (satır içi/inline metin), `Paragraph` (`<p>`). " +
            "Üçü de hook kullanmaz, sunucu bileşeni olarak render edilebilir. h1–h3 mobilde bir adım küçük başlar; başlıklar " +
            "`text-balance`, paragraflar `text-pretty` ile dengeli kırılır. `ellipsis` taşan metni kısaltır, `skeleton` yer tutucu çizer.",
          whenToUse: [
            "Bir başlık hiyerarşisi kurmak için (`Title level={1..6}`) — doğru `<h*>` etiketini otomatik seçer.",
            "Gövde metni ve yardımcı/ikincil (`muted`) açıklama metinleri için.",
            "Bir renk rolüyle vurgulanmış metin için (`color=\"primary\"` vb.).",
          ],
          whenNotToUse: [
            "Etkileşimli metin için — bağlantı `<a>`, buton `Button`.",
            "Uzun biçimli zengin içerik (CMS gövdesi) için — orada `prose` benzeri bir yapı daha uygun.",
          ],
          a11y:
            "`Title` her zaman `level` ile eşleşen gerçek `<h1>`–`<h6>` etiketini render eder — seviye atlamamaya dikkat edin " +
            "(görsel boyut için `className` kullanın, yanlış `level` değil). `ellipsis` ile kısaltılan metnin tamamı için `title` verin. " +
            "İskelet halleri ekran okuyucudan gizlidir.",
        }),
      },
    },
  },
};

export default meta;

export const Playground: StoryObj<React.ComponentProps<typeof Title>> = {
  ...storyDoc("Başlık seviyesi, rol rengi ve kısaltma (`ellipsis`); `Text` ve `Paragraph` aynı renk/kısaltma eksenlerini paylaşır."),
  args: { level: 2, children: "Ekim ayı satış özeti" },
  argTypes: { level: { control: "inline-radio", options: [1, 2, 3, 4, 5] }, color: { control: "select", options: [undefined, "primary", "accent", "success", "warning", "error", "info", "neutral"] } },
  render: (args) => <Title {...args} />,
};

export const TitleLevels: StoryObj = {
  name: "Başlık Seviyeleri",
  ...storyDoc(
    "`level` 1–6 — her biri gerçek `<h1>`–`<h6>` etiketi. h1/h2/h3 375px'te bir adım küçük, `sm` (640px) ve üstünde tam boyut. Pencereyi daraltarak deneyin.",
    `<Title>Sipariş Özeti</Title>
<Title level={2}>Teslimat Bilgileri</Title>
<Title level={3}>Fatura Adresi</Title>
<Title level={4}>Ödeme Yöntemi</Title>
<Title level={5}>Kampanya Kodu</Title>
<Title level={6}>Notlar</Title>`
  ),
  render: () => (
    <div className="flex flex-col gap-2">
      <Title>Sipariş Özeti</Title>
      <Title level={2}>Teslimat Bilgileri</Title>
      <Title level={3}>Fatura Adresi</Title>
      <Title level={4}>Ödeme Yöntemi</Title>
      <Title level={5}>Kampanya Kodu</Title>
      <Title level={6}>Notlar</Title>
    </div>
  ),
};

export const Article: StoryObj = {
  name: "Makale",
  ...storyDoc(
    "Üç bileşenin birlikte kullanımı: başlık, `muted` meta satırı, paragraflar ve paragraf içinde vurgulu `Text`.",
    `<article>
  <Title level={2}>Kargo süreleri bayram döneminde uzayabilir</Title>
  <Text muted>12 Nisan 2026 · 3 dk okuma</Text>
  <Paragraph>
    Bayram tatili boyunca kargo firmalarının <Text weight="semibold">dağıtım merkezleri kapalı</Text> olacak…
  </Paragraph>
</article>`
  ),
  render: () => (
    <article className="flex max-w-prose flex-col gap-3">
      <Title level={2}>Kargo süreleri bayram döneminde uzayabilir</Title>
      <Text muted>12 Nisan 2026 · 3 dk okuma</Text>
      <Paragraph>
        Bayram tatili boyunca kargo firmalarının <Text weight="semibold">dağıtım merkezleri kapalı</Text> olacak. Tatilden önceki son
        gün saat 14.00&apos;e kadar verilen siparişler aynı gün kargoya teslim edilir; sonrasındaki siparişler tatil bitiminde sırayla
        gönderilir.
      </Paragraph>
      <Paragraph muted>
        Siparişinizin durumunu Hesabım → Siparişlerim sayfasından takip edebilirsiniz. Gecikme yaşanırsa size SMS ile bilgi vereceğiz.
      </Paragraph>
    </article>
  ),
};

export const Ellipsis: StoryObj = {
  name: "Kısaltma (ellipsis)",
  ...storyDoc(
    "Dar kartlarda uzun ürün adları için: `ellipsis` tek satır, `ellipsis={{ rows: 2 }}` iki satırdan sonra `…`. Kısaltılan metnin tamamını `title` ile verin.",
    `<Title level={5} ellipsis={{ rows: 2 }} title={product.name}>{product.name}</Title>
<Paragraph muted ellipsis={{ rows: 2 }}>{product.desc}</Paragraph>
<Text ellipsis>{product.seller}</Text>`
  ),
  render: () => (
    <div className="grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
      {products.map((p) => (
        <div key={p.name} className="flex flex-col gap-1 rounded-lg border border-mari-border p-4">
          <Title level={5} ellipsis={{ rows: 2 }} title={p.name}>
            {p.name}
          </Title>
          <Paragraph muted ellipsis={{ rows: 2 }}>
            {p.desc}
          </Paragraph>
          <Text ellipsis className="text-xs">
            Satıcı: Teknoloji Mağazası Resmi Distribütör Hesabı
          </Text>
        </div>
      ))}
    </div>
  ),
};

function TypographySkeleton() {
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <div className="flex max-w-prose flex-col gap-4">
          <article className="flex flex-col gap-3">
            <Title level={2} skeleton={skeleton}>
              Kargo süreleri bayram döneminde uzayabilir
            </Title>
            <Text muted skeleton={skeleton}>
              12 Nisan 2026 · 3 dk okuma
            </Text>
            <Paragraph skeleton={skeleton} skeletonRows={3}>
              Bayram tatili boyunca kargo firmalarının dağıtım merkezleri kapalı olacak. Tatilden önceki son gün saat 14.00&apos;e kadar
              verilen siparişler aynı gün kargoya teslim edilir; sonrasındaki siparişler tatil bitiminde sırayla gönderilir.
            </Paragraph>
          </article>
        </div>
      )}
    </SkeletonDemo>
  );
}

export const Colors: StoryObj = {
  name: "Renkler",
  ...storyDoc(
    "`color` bir renk rolüdür; verilmezse `--mari-color-foreground`. Durum mesajlarında metni renklendirmek için — tek başına renge güvenmeyin, anlamı metin de taşısın.",
    `<Text color="success" weight="medium">Ödeme alındı</Text>
<Text color="warning" weight="medium">Stokta son 2 ürün</Text>
<Text color="error" weight="medium">Kart reddedildi</Text>`
  ),
  render: () => (
    <div className="flex flex-col gap-1">
      <Title level={4} color="primary">
        Hesap Ayarları
      </Title>
      <Text color="success" weight="medium">
        Ödeme alındı
      </Text>
      <Text color="warning" weight="medium">
        Stokta son 2 ürün
      </Text>
      <Text color="error" weight="medium">
        Kart reddedildi
      </Text>
      <Text muted>Son güncelleme: 5 dakika önce</Text>
    </div>
  ),
};

const products = [
  {
    name: "Apple MacBook Air 13 inç M3 Çip 8 Çekirdekli CPU 10 Çekirdekli GPU 16GB 512GB SSD Gece Yarısı",
    desc: "Gün boyu süren pil, fansız sessiz tasarım ve Liquid Retina ekranla her yerde çalışın. Wi-Fi 6E ve iki harici ekran desteği.",
  },
  {
    name: "Logitech MX Master 3S Kablosuz Mouse",
    desc: "8K DPI sensör, sessiz tıklama ve cam dahil her yüzeyde iz sürme. USB-C ile hızlı şarj: 1 dakika şarj 3 saat kullanım.",
  },
];

export const Skeleton: StoryObj = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton`: `Title` başlık satırı yüksekliğinde bir çubuk, `Paragraph` `skeletonRows` kadar satır (sonuncusu kısa), `Text` metni şeffaf tutup tam genişliğinde. " +
      "Satır kutuları gerçek satır yüksekliğinde (`1lh`) — yüklenince blok zıplamaz.",
    `<Title level={2} skeleton={isLoading}>{post.title}</Title>
<Text muted skeleton={isLoading}>{post.meta}</Text>
<Paragraph skeleton={isLoading} skeletonRows={3}>{post.body}</Paragraph>`
  ),
  render: () => <TypographySkeleton />,
};
