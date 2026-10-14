/**
 * Faz 16.7: gerçek senaryolar — tarihe göre albüm, görünümler, seçim modu,
 * binlerce öğe (sanal + sonsuz kaydırma), video; sonra iskelet. "Show code"
 * her story'de `storyDoc`'un 2. argümanı. Story seviyesinde `parameters`
 * YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Share2Icon, Trash2Icon } from "lucide-react";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { STORY_VIDEO, picsumLoader, storyPhotos } from "../lib/storyPhotos";
import { Button } from "../button";
import { ImageGallery } from ".";
import type { ImageGalleryItem } from ".";

/** Örnek albüm: fotoğraflar + her 11. sırada bir video. */
function album(count: number): ImageGalleryItem[] {
  return storyPhotos(count).map((p, i) =>
    i % 11 === 5
      ? { key: p.key, src: STORY_VIDEO.src, poster: STORY_VIDEO.poster, alt: `Çiçek açarken — ${i + 1}. video`, date: p.takenAt, type: "video", duration: 5 + (i % 50) }
      : { key: p.key, src: p.src, alt: p.alt, date: p.takenAt, caption: p.alt.split(" — ")[0] }
  );
}

const ALBUM = album(240);

const without = (keys: React.Key[]) => (all: ImageGalleryItem[]) => all.filter((i) => !keys.includes(i.key));

const meta: Meta<typeof ImageGallery> = {
  title: "Veri Gösterimi/ImageGallery",
  component: ImageGallery,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Fotoğraf ve videoları iPhone Fotoğraflar gibi gösterir: kıl payı aralıklı kare küçük resimler, tarihe göre " +
            "bölümler ve Yıllar / Aylar / Günler / Tümü görünümleri (üst görünümde başlığa tıklayınca bir alta inilir), " +
            "değiştirilebilir sütun sayısı, seçim modu ve tam ekran görüntüleyici. Sanaldır: yalnız görünen satırlar " +
            "DOM'dadır; `infinite` ile sonraki sayfalar istenir — binlerce öğede de akıcı.",
          whenToUse: [
            "Kullanıcının kendi fotoğraf/video arşivi, medya kütüphanesi, etkinlik albümü.",
            "Çok sayıda görselin tarih sırasıyla taranması ve toplu seçilip işlem yapılması (paylaş, sil, indir).",
          ],
          whenNotToUse: [
            "Birkaç görsellik ürün galerisi — Image (`preview`) ya da Carousel.",
            "Farklı yükseklikte kartlar (Pinterest düzeni) — Masonry.",
            "Tek bir görselin gösterimi — Image.",
          ],
          a11y:
            "APG `grid`: tek sekme durağı; ok tuşları, Home/End (Ctrl ile ilk/son), PageUp/PageDown gezinir — sanallaştırmada " +
            "hedef satır render edilip odaklanır. Enter/Space görüntüleyiciyi açar (seçim modunda seçer); Shift+tık/ok aralık, " +
            "Ctrl/⌘+A tümü, Escape seçimden çıkar. Seçim modunda `aria-multiselectable` + `aria-selected`; seçili sayı " +
            "`aria-live` ile duyurulur. Bölüm başlıkları gerçek başlık (`headingLevel`). Dokunmatikte uzun basış seçime alır.",
        }),
      },
    },
  },
  argTypes: {
    view: { control: "inline-radio", options: ["year", "month", "day", "all"], table: { defaultValue: { summary: "day" } } },
    columns: { control: "number" },
    gap: { control: { type: "number", min: 0, max: 8 }, table: { defaultValue: { summary: "2" } } },
    toolbar: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    selectable: { control: "boolean" },
    skeleton: { control: "boolean" },
    items: { control: false },
    loader: { control: false },
    infinite: { control: false },
    onViewChange: { table: { category: "Olaylar" } },
    onColumnsChange: { table: { category: "Olaylar" } },
    onSelectionChange: { table: { category: "Olaylar" } },
    onSelectionModeChange: { table: { category: "Olaylar" } },
  },
};

export default meta;
type Story = StoryObj<typeof ImageGallery>;

export const Playground: Story = {
  ...storyDoc(
    "Tüm props'ları canlı deneyin. `items` tarih (`date`) taşır; galeri bunlarla bölümlenir.",
    (args) => `
const cdnLoader: ImageLoader = ({ src, width, quality = 75 }) => \`\${src}?w=\${width}&q=\${quality}\`;
const items = [
  { key: "p0", src: "/fotograflar/kapadokya.jpg", alt: "Kapadokya — gün doğumu", caption: "Kapadokya", date: new Date("2026-10-01") },
  { key: "p1", src: "/fotograflar/efes.jpg", alt: "Efes antik kenti", caption: "Efes", date: new Date("2026-09-28") },
];

<ImageGallery ${jsxProps(args, { skip: ["items", "loader"] })} items={items} loader={cdnLoader} />`
  ),
  args: { items: ALBUM.slice(0, 60), loader: picsumLoader, title: "Fotoğraflar", selectable: true },
};

/* ─────────────────────────── 1. Senaryolar ─────────────────────────── */

export const Album: Story = {
  name: "Albüm (Tarihe Göre)",
  ...storyDoc(
    "Öğeler `date` ile bölümlenir (Bugün / Dün / tarih). Üstteki seçiciden Yıllar / Aylar / Günler / Tümü; Yıllar ve " +
      "Aylar'da bir başlığa tıklamak bir alt görünüme iner ve o bölüme kaydırır. Büyüteç düğmeleri sütun sayısını " +
      "değiştirir (görünüm değişince yeniden kendiliğinden olur). Bir küçük resme tıklayınca görüntüleyici o kareden " +
      "büyüyerek açılır; kaydırdıkça ızgara da izler.",
    `
<ImageGallery
  title="Fotoğraflar"
  loader={cdnLoader}
  items={fotolar.map((f) => ({ key: f.id, src: f.yol, alt: f.aciklama, date: new Date(f.cekim) }))}
/>`
  ),
  render: () => <ImageGallery items={ALBUM} loader={picsumLoader} title="Fotoğraflar" />,
};

export const Views: Story = {
  name: "Görünümler",
  ...storyDoc(
    "`view` kontrollü de kullanılabilir. Gün görünümü iri, yıl görünümü sık küçük resim gösterir (iPhone gibi). " +
      "`views` araç çubuğundaki seçenekleri kısıtlar; `columns` sabit sütun verir.",
    `
const [view, setView] = useState<GalleryView>("year");
<ImageGallery items={items} view={view} onViewChange={setView} views={["year", "month", "day"]} />
<ImageGallery items={items} view="all" columns={6} toolbar={false} />`
  ),
  render: () => {
    const [view, setView] = useState<"year" | "month" | "day">("year");
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-mari-muted">Geçerli görünüm: {view}</p>
        <ImageGallery items={ALBUM} loader={picsumLoader} view={view} onViewChange={(v) => setView(v as typeof view)} views={["year", "month", "day"]} />
      </div>
    );
  },
};

export const Selection: Story = {
  name: "Seçim Modu",
  ...storyDoc(
    "`selectable` araç çubuğuna \"Seç\" ekler; dokunmatikte uzun basış da seçime alır. Seçim modunda tıklama seçer, " +
      "Shift+tık aralık seçer, Ctrl/⌘+A tümünü seçer, Escape çıkar. `selectionActions` seçili anahtarlarla eylem " +
      "düğmeleri çizer — silme gibi işlemler tüketicinin elinde.",
    `
const [items, setItems] = useState(fotolar);
const [selected, setSelected] = useState<React.Key[]>([]);
<ImageGallery
  items={items}
  selectable
  selectedKeys={selected}
  onSelectionChange={setSelected}
  selectionActions={(keys) => (
    <Button size="sm" color="error" variant="ghost" icon={<Trash2Icon />} disabled={!keys.length}
      onClick={() => setItems((all) => all.filter((i) => !keys.includes(i.key)))}>
      Sil
    </Button>
  )}
/>`
  ),
  render: () => {
    const [items, setItems] = useState(() => ALBUM.slice(0, 48));
    const [selected, setSelected] = useState<React.Key[]>([]);
    const [mode, setMode] = useState(false);
    return (
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
            <Button size="sm" variant="ghost" color="neutral" icon={<Share2Icon />} aria-label="Paylaş" disabled={!keys.length} />
            <Button
              size="sm"
              variant="ghost"
              color="error"
              icon={<Trash2Icon />}
              aria-label="Sil"
              disabled={!keys.length}
              onClick={() => {
                setItems(without(keys));
                setSelected([]);
                setMode(false);
              }}
            />
          </>
        )}
      />
    );
  },
};

const LIBRARY = album(3000);
const PAGE = 120;
const nextPage = (count: number) => Math.min(count + PAGE, LIBRARY.length);

export const Infinite: Story = {
  name: "Binlerce Öğe (Sanal + Sonsuz)",
  ...storyDoc(
    "Yalnız görünen satırlar (+ birkaç yedek) DOM'dadır; 3000 öğede de kaydırma akıcıdır. `infinite` sona yaklaşınca " +
      "`onLoadMore` çağırır (klavye için \"Daha fazla yükle\" düğmesi de var). Galeri sayfada da, kendi kaydırma " +
      "alanında da çalışır — burada 32rem'lik bir kutuda. Araç çubuğu kutunun üstüne yapışır.",
    `
const { items, hasMore, loading, loadMore } = useFotolar({ sayfa: 120 });
<div className="h-[32rem] overflow-y-auto">
  <ImageGallery items={items} loader={cdnLoader} infinite={{ hasMore, loading, onLoadMore: loadMore }} />
</div>`
  ),
  render: () => {
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
      <div className="flex flex-col gap-2">
        <p className="text-sm text-mari-muted tabular-nums">
          Yüklenen: {count} / {LIBRARY.length}
        </p>
        <div className="h-[32rem] overflow-y-auto rounded-lg border border-mari-border">
          <ImageGallery
            items={LIBRARY.slice(0, count)}
            loader={picsumLoader}
            title="Kütüphane"
            defaultView="all"
            infinite={{ hasMore: count < LIBRARY.length, loading, onLoadMore: loadMore }}
          />
        </div>
      </div>
    );
  },
};

export const Videos: Story = {
  name: "Video",
  ...storyDoc(
    "`type: \"video\"` öğeler ızgarada kapak görseli (`poster`) ve süreyle (`duration`, sn) görünür; görüntüleyicide yerel " +
      "oynatıcıyla oynar. Konuşma içeren videolarda `tracks` ile altyazı verin.",
    `
<ImageGallery
  items={[
    { key: 1, src: "/videolar/cicek.mp4", poster: "/videolar/cicek.jpg", alt: "Çiçek açarken", type: "video", duration: 5, date },
    { key: 2, src: "/foto/kas.jpg", alt: "Kaş", date },
  ]}
/>`
  ),
  render: () => <ImageGallery items={ALBUM.filter((i, n) => i.type === "video" || n % 3 === 0).slice(0, 18)} loader={picsumLoader} defaultView="all" toolbar={false} />,
};

/* ─────────────────────────── 2. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<ImageGallery skeleton={loading} items={items} />`),
  render: () => (
    <SkeletonDemo className="w-full">{(skeleton) => <ImageGallery skeleton={skeleton} items={ALBUM.slice(0, 24)} loader={picsumLoader} title="Fotoğraflar" />}</SkeletonDemo>
  ),
};
