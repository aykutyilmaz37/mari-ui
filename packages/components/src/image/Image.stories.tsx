/**
 * Faz 16.7: gerçek senaryolar — kademeli yükleme (bulanık ön izleme → asıl
 * görsel), CDN `loader`ı, önizleme, yedek görsel, görüntüleyici; sonra görünüm
 * (`fit`, oran) ve iskelet. "Show code" her story'de `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { ImageIcon, RefreshCwIcon } from "lucide-react";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { STORY_VIDEO, picsumLoader, storyPhotos } from "../lib/storyPhotos";
import { Image, ImageViewer } from ".";
import type { ImageLoader, ImageViewerItem } from ".";
import { Button } from "../button";

const meta: Meta<typeof Image> = {
  title: "Veri Gösterimi/Image",
  component: Image,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Görseli kademeli yükler: önce küçük ve bulanık bir ön izleme, asıl görsel gelince yumuşak geçişle üstüne. " +
            "Yer önceden ayrılır (`aspectRatio` ya da `width`/`height`) → yüklenince sayfa kaymaz. CDN ve boyutlandırma " +
            "`loader` ile (`srcSet` adayları da ondan üretilir); framework'e bağlı değil — `next/image` gerekmez. " +
            "`preview` ile tıklayınca tam ekran görüntüleyici açılır.",
          whenToUse: [
            "İçerik görselleri: ürün, haber, profil kapağı, galeri küçük resmi.",
            "Yavaş bağlantıda bile sayfa düzeni sabit kalmalıysa (oran + ön izleme).",
            "Görselin büyütülüp incelenmesi gerekiyorsa (`preview`).",
          ],
          whenNotToUse: [
            "İkon ya da süsleme SVG'si — doğrudan ikon bileşeni.",
            "Kişi fotoğrafı/baş harfi — Avatar.",
            "Çok sayıda fotoğrafın tarihe göre listelenmesi — ImageGallery.",
          ],
          a11y:
            "`alt` zorunlu; süs görselinde `alt=\"\"`. `preview`de kutu bir düğmedir (\"… — büyüt\", `aria-haspopup=dialog`). " +
            "Görüntüleyici `role=dialog` + odak tuzağı; ←/→ geçiş, +/− yakınlaştırma, 0 sıfırla, Escape kapatır ve odak " +
            "küçük resme döner; geçiş `aria-live` ile duyurulur. Hareket azaltma tercihinde animasyonlar kapanır.",
        }),
      },
    },
  },
  argTypes: {
    src: { control: "text" },
    alt: { control: "text" },
    aspectRatio: { control: "text" },
    fit: {
      control: "inline-radio",
      options: ["cover", "contain", "fill", "none", "scale-down"],
      table: { defaultValue: { summary: "cover" } },
    },
    placeholder: { control: "boolean" },
    preview: { control: "boolean" },
    loading: { control: "inline-radio", options: ["lazy", "eager"], table: { defaultValue: { summary: "lazy" } } },
    priority: { control: "boolean" },
    loader: { control: false },
    fallback: { control: "text" },
    skeleton: { control: "boolean" },
    onLoad: { table: { category: "Olaylar" } },
    onError: { table: { category: "Olaylar" } },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

const photos = storyPhotos(12);

export const Playground: Story = {
  ...storyDoc(
    "Tüm props'ları canlı deneyin. Adres üretimi `loader`da; örnekteki CDN parametrelerini kendi servisinize göre değiştirin.",
    (args) => `
const cdnLoader: ImageLoader = ({ src, width, quality = 75 }) => \`\${src}?w=\${width}&q=\${quality}\`;

<Image ${jsxProps(args, { skip: ["loader"] })} loader={cdnLoader} />`
  ),
  args: {
    src: photos[0]!.src,
    alt: photos[0]!.alt,
    loader: picsumLoader,
    aspectRatio: "3/2",
    placeholder: true,
    preview: true,
    wrapperClassName: "max-w-md",
  },
};

/* ─────────────────────────── 1. Senaryolar ─────────────────────────── */

export const Progressive: Story = {
  name: "Kademeli Yükleme",
  ...storyDoc(
    "`placeholder`: önce küçük boy (`loader` ile 24px) bulanık gösterilir, asıl görsel yüklenince üstüne solarak gelir. " +
      "Statik import'larda (`{ src, blurDataURL }`) `blurDataURL` kendiliğinden kullanılır. \"Yeniden yükle\" önbelleği " +
      "atlayıp geçişi tekrar gösterir.",
    `
<Image src="/seed/kapadokya/1600/1067" alt="Kapadokya" aspectRatio="3/2" loader={cdnLoader} placeholder />

// Next.js statik import — blurDataURL'i Next üretir, ek ayar gerekmez
import hero from "./hero.jpg";
<Image src={hero} alt="Kapadokya'da gün doğumu" />`
  ),
  render: () => {
    const [round, setRound] = useState(0);
    // Önbelleği atlamak için her turda farklı adres.
    const loader: ImageLoader = (p) => `${picsumLoader(p)}?r=${round}`;
    return (
      <div className="flex max-w-3xl flex-col items-start gap-3">
        <Button size="sm" variant="outline" color="neutral" icon={<RefreshCwIcon />} onClick={() => setRound((r) => r + 1)}>
          Yeniden yükle
        </Button>
        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          <figure className="flex flex-col gap-1.5">
            <Image key={`a${round}`} src={photos[0]!.src} alt={photos[0]!.alt} loader={loader} aspectRatio="3/2" placeholder />
            <figcaption className="text-sm text-mari-muted">Bulanık ön izleme</figcaption>
          </figure>
          <figure className="flex flex-col gap-1.5">
            <Image
              key={`b${round}`}
              src={photos[2]!.src}
              alt={photos[2]!.alt}
              loader={loader}
              aspectRatio="3/2"
              placeholder={<ImageIcon className="size-8 text-mari-muted" />}
            />
            <figcaption className="text-sm text-mari-muted">Özel yer tutucu</figcaption>
          </figure>
        </div>
      </div>
    );
  },
};

export const WithLoader: Story = {
  name: "CDN ile (loader)",
  ...storyDoc(
    "Adres üretimi `loader`da: kaynak + istenen genişlik → URL. Duyarlı görselde `widths` adayları + `sizes`, sabit " +
      "genişlikte 1x/2x üretilir. Asset prefix'i ve CDN adresi uygulamada bağlanır; " +
      "kütüphane env okumaz. Tek satırlık bir sarmalayıcı tüm projede aynı ayarı kullandırır.",
    `
import { Image, type ImageLoader, type ImageProps } from "@mari-ui/components/image";

const base = import.meta.env.VITE_CDN_URL ?? "";
const asset = (src: string) => (src.startsWith("http") ? src : \`\${base}\${src}\`);
const cdnLoader: ImageLoader = ({ src, width, quality = 75 }) => \`\${asset(src)}?w=\${width}&q=\${quality}\`;

export const AppImage = (props: ImageProps) => <Image loader={cdnLoader} {...props} />;

<AppImage src="/urunler/canta.jpg" alt="Deri çanta" aspectRatio="1" sizes="(min-width: 768px) 25vw, 50vw" />
<AppImage src="/logo.png" alt="Logo" width={120} height={40} />   // 1x/2x`
  ),
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
      {photos.slice(0, 4).map((p) => (
        <Image key={p.key} src={p.src} alt={p.alt} loader={picsumLoader} aspectRatio="1" sizes="(min-width: 768px) 25vw, 50vw" placeholder />
      ))}
    </div>
  ),
};

export const Preview: Story = {
  name: "Önizleme",
  ...storyDoc(
    "`preview`: kutu bir düğme olur; tıklayınca görsel küçük resimden büyüyerek tam ekran açılır. Dokunmatikte iki parmak, " +
      "masaüstünde tekerlek ya da çift tıklama yakınlaştırır; aşağı çekmek kapatır. `preview.src` daha yüksek çözünürlüklü " +
      "bir kaynak, `preview.caption` açıklama verir.",
    `
<Image src={urun.kucuk} alt="Seramik vazo" aspectRatio="1" preview />
<Image src={foto.src} alt="Efes" aspectRatio="4/3" preview={{ src: foto.orijinal, caption: "Efes Antik Kenti, Selçuk" }} />`
  ),
  render: () => (
    <div className="grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
      {photos.slice(3, 6).map((p, i) => (
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
    </div>
  ),
};

export const Fallback: Story = {
  name: "Yedek Görsel",
  ...storyDoc(
    "Yüklenemezse: varsayılan ikon + metin; `fallback` bir URL (yedek görsel) ya da node olabilir. Yedek URL de " +
      "yüklenemezse varsayılana düşülür.",
    `
<Image src="/yok.jpg" alt="Ürün" aspectRatio="1" />
<Image src="/yok.jpg" alt="Ürün" aspectRatio="1" fallback="/gorsel-yok.svg" />
<Image src="/yok.jpg" alt="Ürün" aspectRatio="1" fallback={<span>Görsel yakında</span>} />`
  ),
  render: () => (
    <div className="grid max-w-2xl grid-cols-3 gap-3">
      <Image src="https://picsum.photos/bozuk-adres.jpg" alt="Ürün görseli" aspectRatio="1" />
      <Image src="https://picsum.photos/bozuk-adres.jpg" alt="Ürün görseli" aspectRatio="1" fallback="/images/avatar-placeholder.svg" fit="contain" />
      <Image
        src="https://picsum.photos/bozuk-adres.jpg"
        alt="Ürün görseli"
        aspectRatio="1"
        fallback={<span className="flex size-full items-center justify-center text-sm text-mari-muted">Görsel yakında</span>}
      />
    </div>
  ),
};

const viewerItems: ImageViewerItem[] = [
  ...photos.slice(0, 5).map((p) => ({ key: p.key, src: p.src, alt: p.alt, caption: p.alt.split(" — ")[0] })),
  { key: "video", src: STORY_VIDEO.src, poster: STORY_VIDEO.poster, alt: "Çiçek açarken (video)", type: "video" as const },
];

export const Viewer: Story = {
  name: "Görüntüleyici (ImageViewer)",
  ...storyDoc(
    "`ImageViewer` tek başına da kullanılır (kendi düğmeniz, kendi listeniz). Yana kaydırarak ya da ←/→ ile geçiş, alt " +
      "şeritten atlama; video öğeleri yerel oynatıcıyla. `getOriginElement` verilirse açılış/kapanış o küçük resimden " +
      "olur ve kapanınca odak ona döner.",
    `
const [open, setOpen] = useState(false);
<Button onClick={() => setOpen(true)}>Albümü aç</Button>
<ImageViewer
  open={open}
  onClose={() => setOpen(false)}
  loader={cdnLoader}
  items={[
    { key: 1, src: "/seed/kapadokya/1600/1067", alt: "Kapadokya", caption: "Göreme" },
    { key: 2, src: "/videolar/cicek.mp4", alt: "Çiçek açarken", type: "video", poster: "/videolar/cicek.jpg" },
  ]}
/>`
  ),
  render: () => {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Albümü aç ({viewerItems.length})</Button>
        <ImageViewer items={viewerItems} open={open} onClose={() => setOpen(false)} index={index} onIndexChange={setIndex} loader={picsumLoader} />
      </>
    );
  },
};

/* ─────────────────────────── 2. Görünüm ─────────────────────────── */

export const Fit: Story = {
  name: "Sığdırma ve Oran",
  ...storyDoc(
    "`fit` = `object-fit` (varsayılan `cover`: kutuyu doldurur, taşanı kırpar; `contain`: tamamı görünür). Kutu " +
      "boyutu `aspectRatio` ya da `width`/`height` ile — sayı px, string herhangi bir CSS uzunluğu.",
    `
<Image src="/urunler/canta.jpg" alt="Deri çanta" width={200} height={200} fit="cover" />
<Image src="/urunler/canta.jpg" alt="Deri çanta" width={200} height={200} fit="contain" />
<Image src="/urunler/canta.jpg" alt="Deri çanta" aspectRatio="16/9" />`
  ),
  render: () => (
    <div className="flex flex-wrap items-start gap-4">
      {(["cover", "contain"] as const).map((fit) => (
        <figure key={fit} className="flex flex-col gap-1.5">
          <Image src={photos[1]!.src} alt={photos[1]!.alt} loader={picsumLoader} width={160} height={160} fit={fit} wrapperClassName="border border-mari-border" />
          <figcaption className="text-sm text-mari-muted">{fit}</figcaption>
        </figure>
      ))}
      <figure className="flex w-72 flex-col gap-1.5">
        <Image src={photos[4]!.src} alt={photos[4]!.alt} loader={picsumLoader} aspectRatio="16/9" />
        <figcaption className="text-sm text-mari-muted">aspectRatio=&quot;16/9&quot;</figcaption>
      </figure>
    </div>
  ),
};

/* ─────────────────────────── 3. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Image skeleton={isLoading} src="/urunler/canta.jpg" alt="Deri çanta" aspectRatio="4/3" />`),
  render: () => (
    <SkeletonDemo className="grid w-full max-w-2xl grid-cols-2 gap-3 md:grid-cols-3">
      {(skeleton) =>
        photos.slice(6, 9).map((p) => <Image key={p.key} skeleton={skeleton} src={p.src} alt={p.alt} loader={picsumLoader} aspectRatio="4/3" preview />)
      }
    </SkeletonDemo>
  ),
};
