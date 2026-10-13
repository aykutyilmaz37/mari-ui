import type { Meta, StoryObj } from "@storybook/react";
import { Bell, Heart, RefreshCcw, SearchX, WifiOff } from "lucide-react";
import { Empty } from "./Empty";
import { Button } from "../button";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { SearchInput } from "../input";

const meta: Meta<typeof Empty> = {
  title: "Veri Gösterimi/Empty",
  component: Empty,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Bir liste/tablo boş olduğunda gösterilecek yer tutucu.",
          whenToUse: ["Veri yüklendi ama sonuç yoksa — arama sonucu boş, filtre sonucu boş, yeni oluşturulan bir liste."],
          whenNotToUse: ["Veri henüz yükleniyorsa — o durumda `Skeleton`/`Loading` kullanılır."],
          a11y: "Hook kullanmaz, sunucu bileşeni olarak render edilebilir.",
        }),
      },
    },
  },
  argTypes: {
    title: { control: "text", description: "Ana başlık." },
    description: { control: "text", description: "Açıklayıcı alt metin (opsiyonel)." },
    buttonText: { control: "text", description: "Verilirse bir eylem butonu render edilir (örn. \"Tekrar Dene\")." },
    onClick: { description: "Buton tıklamasında çağrılır. `onClick`/`href` yoksa buton çizilmez." },
    size: { control: "inline-radio", options: ["sm", "md"], description: "`sm`: kart/tablo/liste içi kompakt.", table: { defaultValue: { summary: "md" } } },
    titleAs: { control: "select", options: ["p", "h2", "h3", "h4"], description: "Başlık etiketi. Varsayılan `p` (boş durum bir belge bölümü değil).", table: { defaultValue: { summary: "p" } } },
    skeleton: { control: "boolean", description: "Yer tutucu.", table: { defaultValue: { summary: "false" } } },
  },
  args: {
    title: "Veri Bulunamadı",
    description: "Kriterlerinize uyan herhangi bir veri bulamadık.",
    buttonText: "Tekrar Dene",
    buttonIcon: <RefreshCcw size={16} />,
    onClick: () => {},
    size: "md",
  },
};

export default meta;

type Story = StoryObj<typeof Empty>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
};

export const SearchResults: Story = {
  name: "Arama Sonucu",
  ...storyDoc(
    "Arama kutusunun altında, sonuç bulunamadığında. Kullanıcıya bir çıkış yolu verin: aramayı temizleme ya da kategorilere dönme.",
    `<Empty
  icon={<SearchX />}
  title="Sonuç bulunamadı"
  description={\`"\${query}" için sonuç yok. Yazımı kontrol edin ya da daha genel bir terim deneyin.\`}
  actions={<><Button variant="outline" color="neutral" onClick={clear}>Aramayı temizle</Button><Button href="/kategoriler">Kategorilere göz at</Button></>}
/>`
  ),
  render: () => (
    <div className="w-full max-w-md rounded-lg border border-mari-border p-4">
      <SearchInput aria-label="Ürün ara" placeholder="Ürün, marka veya kategori ara" defaultValue="pembe kazak" />
      <Empty
        icon={<SearchX />}
        title="Sonuç bulunamadı"
        description={'"pembe kazak" için sonuç yok. Yazımı kontrol edin ya da daha genel bir terim deneyin.'}
        actions={
          <>
            <Button variant="outline" color="neutral" size="sm">
              Aramayı temizle
            </Button>
            <Button size="sm" href="#">
              Kategorilere göz at
            </Button>
          </>
        }
      />
    </div>
  ),
};

export const InCard: Story = {
  name: "Kart İçinde (sm)",
  ...storyDoc(
    "`size=\"sm\"` — kart, tablo ya da liste içinde daha az boşluk ve küçük ikon. Table'ın boş hali de bunu kullanır.",
    `<Empty size="sm" icon={<Bell />} title="Bildirim yok" description="Yeni bir şey olduğunda burada göreceksiniz." />`
  ),
  render: () => (
    <div className="grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-lg border border-mari-border">
        <p className="border-b border-mari-border px-4 py-3 text-sm font-medium text-mari-foreground">Bildirimler</p>
        <Empty size="sm" icon={<Bell />} title="Bildirim yok" description="Yeni bir şey olduğunda burada göreceksiniz." />
      </div>
      <div className="rounded-lg border border-mari-border">
        <p className="border-b border-mari-border px-4 py-3 text-sm font-medium text-mari-foreground">Favoriler</p>
        <Empty size="sm" icon={<Heart />} title="Favori ürününüz yok" buttonText="Alışverişe başla" href="#" />
      </div>
    </div>
  ),
};

export const Varyantlar: Story = {
  name: "Varyantlar",
  ...storyDoc(
    "`description` ve eylem opsiyoneldir — en yalın hâlden (sadece başlık) eylem butonlu tam hâle. Buton yalnızca `onClick` ya da `href` varsa çizilir.",
    `<Empty title="Henüz sipariş yok" />
<Empty title="Henüz sipariş yok" description="İlk siparişinizi verdiğinizde burada listelenir." />
<Empty title="Bağlantı kurulamadı" description="İnternet bağlantınızı kontrol edin." buttonText="Tekrar dene" onClick={retry} />`
  ),
  render: () => (
    <div className="flex flex-col gap-8">
      <Empty title="Henüz sipariş yok" />
      <Empty title="Henüz sipariş yok" description="İlk siparişinizi verdiğinizde burada listelenir." />
      <Empty icon={<WifiOff />} title="Bağlantı kurulamadı" description="İnternet bağlantınızı kontrol edin." buttonText="Tekrar dene" buttonIcon={<RefreshCcw size={16} />} onClick={() => {}} />
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc("`skeleton` — ikon dairesi ve başlık/açıklama çizgileri.", `<Empty skeleton={isLoading} title="Sonuç bulunamadı" description="Kriterlerinize uyan herhangi bir veri bulamadık." />`),
  render: (args) => <SkeletonDemo>{(skeleton) => <Empty {...args} skeleton={skeleton} />}</SkeletonDemo>,
};
