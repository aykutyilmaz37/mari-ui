/**
 * Faz 16.3: gerçek senaryolar — ekip üyeleri (avatar + eylemler), bildirimler
 * ("daha fazla yükle"), blog akışı (dikey + kapak), ürün ızgarası (kartlar),
 * sayfalı sipariş listesi, boş durum, iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  BellIcon,
  CameraIcon,
  HeadphonesIcon,
  KeyboardIcon,
  LaptopIcon,
  MessageCircleIcon,
  PackageIcon,
  ShieldCheckIcon,
  StarIcon,
  ThumbsUpIcon,
  TruckIcon,
  WatchIcon,
} from "lucide-react";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { List, ListItem, ListItemMeta } from ".";
import { Avatar } from "../avatar";
import { Button } from "../button";
import { Card } from "../card";
import { Tag } from "../tag";
import { Switch } from "../switch";

const meta: Meta<typeof List> = {
  title: "Veri Gösterimi/List",
  component: List,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Aynı türden kayıtları alt alta (ya da ızgarada) gösterir: her satırda avatar + başlık + açıklama (`ListItemMeta`), " +
            "sağda eylemler, isteğe bağlı `extra`. `itemLayout=\"vertical\"` içerik akışları (blog, yorum) için; `grid` kart " +
            "listeleri için. Sayfalama (istemci ya da sunucu tarafı), \"daha fazla yükle\", boş durum ve iskelet dahildir.",
          whenToUse: [
            "Kişiler, bildirimler, dosyalar, yorumlar — her kaydın birkaç satır bilgisi ve eylemi olan listeler.",
            "Kart ızgarası (ürünler, projeler) — `grid`.",
          ],
          whenNotToUse: [
            "Kayıtların sütunlar halinde karşılaştırılması, sıralanması gerekiyorsa — Table.",
            "Seçilebilir seçenek listesi — Select, RadioGroup ya da Checkbox grubu.",
            "Sayfa gezinmesi — Menu/Sidebar.",
          ],
          a11y:
            "`<ul>` + `<li>`; ekran okuyucu \"liste, 12 öğe\" der. Görünür başlık yoksa `aria-label`, varsa `aria-labelledby` verin. Satır eylemleri " +
            "kendi listesindedir ve adlandırılmış düğmeler olmalıdır (\"Ayşe'yi düzenle\" gibi bağlamlı ad tercih edin). " +
            "`skeleton`/`loading` sırasında kök `aria-busy`; `loading`de satırlar `inert` olur (yarım veriye tıklanmaz).",
        }),
      },
    },
  },
  argTypes: {
    dataSource: { control: false },
    renderItem: { control: false },
    rowKey: { control: false },
    header: { control: "text" },
    footer: { control: "text" },
    bordered: { control: "boolean" },
    split: { control: "boolean", table: { defaultValue: { summary: "true" } } },
    size: { control: "inline-radio", options: ["sm", "md", "lg"], table: { defaultValue: { summary: "md" } } },
    itemLayout: { control: "inline-radio", options: ["horizontal", "vertical"], table: { defaultValue: { summary: "horizontal" } } },
    grid: { control: false },
    pagination: { control: false },
    loadMore: { control: false },
    empty: { control: false },
    loading: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof List>;

interface Member {
  id: number;
  name: string;
  email: string;
  role: "Yönetici" | "Editör" | "Görüntüleyici";
  color: "primary" | "accent" | "success" | "warning" | "info";
}

const members: Member[] = [
  { id: 1, name: "Ayşe Kaya", email: "ayse.kaya@ornek.com", role: "Yönetici", color: "primary" },
  { id: 2, name: "Mehmet Demir", email: "mehmet.demir@ornek.com", role: "Editör", color: "accent" },
  { id: 3, name: "Zeynep Arslan", email: "zeynep.arslan@ornek.com", role: "Editör", color: "success" },
  { id: 4, name: "Can Yıldız", email: "can.yildiz@ornek.com", role: "Görüntüleyici", color: "info" },
];

const roleColor = { Yönetici: "primary", Editör: "accent", Görüntüleyici: "neutral" } as const;

/* ─────────────────────────── Playground ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc(
    "Tüm props'ları canlı deneyin.",
    (args) => `
const members = [
  { id: 1, name: "Ayşe Kaya", email: "ayse.kaya@ornek.com", color: "primary" },
  { id: 2, name: "Mehmet Demir", email: "mehmet.demir@ornek.com", color: "accent" },
] as const;

<List
  ${jsxProps(args)}
  dataSource={members}
  renderItem={(m) => (
    <ListItem actions={[<Button key="edit" size="sm" variant="link">Düzenle</Button>]}>
      <ListItemMeta avatar={<Avatar alt={m.name} color={m.color} />} title={m.name} description={m.email} />
    </ListItem>
  )}
/>`
  ),
  args: { bordered: true, header: "Ekip üyeleri", footer: "4 üye", size: "md", itemLayout: "horizontal", split: true },
  render: (args) => (
    <div className="max-w-2xl">
      <List
        {...args}
        dataSource={members}
        renderItem={(m) => (
          <ListItem actions={[<Button key="e" size="sm" variant="link">Düzenle</Button>]}>
            <ListItemMeta avatar={<Avatar alt={m.name} color={m.color} />} title={m.name} description={m.email} />
          </ListItem>
        )}
      />
    </div>
  ),
};

/* ─────────────────────────── 1. Ekip üyeleri ─────────────────────────── */

export const TeamMembers: Story = {
  name: "Ekip Üyeleri",
  ...storyDoc(
    "En yaygın kullanım: avatar + ad + e-posta, sağda rol etiketi ve eylemler. Dar ekranda eylemler satırın altına " +
      "iner. Eylem düğmelerinin adı kişiyi de söyler (ekran okuyucu listede \"Düzenle, Düzenle, Düzenle\" duymasın).",
    `
<List
  bordered
  header={<span id="ekip-baslik">Ekip üyeleri</span>}
  aria-labelledby="ekip-baslik"
  dataSource={members}
  renderItem={(m) => (
    <ListItem
      actions={[
        <Button size="sm" variant="link" aria-label={\`\${m.name} kişisini düzenle\`}>Düzenle</Button>,
        <Button size="sm" variant="link" color="error" aria-label={\`\${m.name} kişisini çıkar\`}>Çıkar</Button>,
      ]}
    >
      <ListItemMeta avatar={<Avatar alt={m.name} color={m.color} />} title={m.name} description={m.email} />
      <Tag color={roleColor[m.role]}>{m.role}</Tag>
    </ListItem>
  )}
/>`
  ),
  render: () => (
    <div className="max-w-2xl">
      <List
        bordered
        header={<span id="ekip-baslik">Ekip üyeleri</span>}
        aria-labelledby="ekip-baslik"
        dataSource={members}
        renderItem={(m) => (
          <ListItem
            actions={[
              <Button key="e" size="sm" variant="link" aria-label={`${m.name} kişisini düzenle`}>
                Düzenle
              </Button>,
              <Button key="c" size="sm" variant="link" color="error" aria-label={`${m.name} kişisini çıkar`}>
                Çıkar
              </Button>,
            ]}
          >
            <ListItemMeta avatar={<Avatar alt={m.name} color={m.color} />} title={m.name} description={m.email} />
            <Tag color={roleColor[m.role]}>{m.role}</Tag>
          </ListItem>
        )}
      />
    </div>
  ),
};

/* ─────────────────────────── 3. Bildirimler ─────────────────────────── */

const allNotifications = [
  { id: 1, Icon: TruckIcon, color: "info" as const, title: "Siparişiniz kargoya verildi", text: "#20481 numaralı sipariş yarın teslim edilecek.", time: "5 dk önce" },
  { id: 2, Icon: ShieldCheckIcon, color: "success" as const, title: "Yeni cihazdan giriş", text: "MacBook Pro · İstanbul. Siz değilseniz şifrenizi değiştirin.", time: "1 sa önce" },
  { id: 3, Icon: StarIcon, color: "warning" as const, title: "Ürünü değerlendirin", text: "Kablosuz Kulaklık Pro hakkında ne düşünüyorsunuz?", time: "Dün" },
  { id: 4, Icon: PackageIcon, color: "primary" as const, title: "İade talebiniz onaylandı", text: "Tutar 3-5 iş günü içinde kartınıza yansır.", time: "2 gün önce" },
  { id: 5, Icon: BellIcon, color: "accent" as const, title: "Fiyatı düştü", text: "Takip ettiğiniz Akıllı Saat S3 %15 indirimde.", time: "3 gün önce" },
  { id: 6, Icon: TruckIcon, color: "info" as const, title: "Siparişiniz teslim edildi", text: "#20377 numaralı sipariş teslim alındı.", time: "1 hf önce" },
];

export const Notifications: Story = {
  name: "Bildirimler (Daha Fazla Yükle)",
  ...storyDoc(
    "`loadMore` listenin altında bir düğme alanıdır; düğme yüklerken `loading` verir, gelen kayıtlar listeye eklenir. " +
      "Sonsuz kaydırma yerine düğme: klavye ve ekran okuyucu kullanıcısı sayfanın sonuna ulaşabilir.",
    `
const [count, setCount] = useState(3);
const [loading, setLoading] = useState(false);

<List
  aria-label="Bildirimler"
  dataSource={notifications.slice(0, count)}
  loadMore={count < notifications.length && (
    <Button variant="outline" size="sm" loading={loading} onClick={loadMore}>Daha fazla yükle</Button>
  )}
  renderItem={(n) => (
    <ListItem extra={<span className="text-xs text-mari-muted">{n.time}</span>}>
      <ListItemMeta avatar={<Avatar icon={<n.Icon />} color={n.color} />} title={n.title} description={n.text} />
    </ListItem>
  )}
/>`
  ),
  render: () => {
    const [count, setCount] = useState(3);
    const [loading, setLoading] = useState(false);
    const loadMore = () => {
      setLoading(true);
      setTimeout(() => {
        setCount((c) => c + 3);
        setLoading(false);
      }, 800);
    };
    return (
      <div className="max-w-xl">
        <List
          aria-label="Bildirimler"
          dataSource={allNotifications.slice(0, count)}
          loadMore={
            count < allNotifications.length && (
              <Button variant="outline" size="sm" loading={loading} onClick={loadMore}>
                Daha fazla yükle
              </Button>
            )
          }
          renderItem={(n) => (
            <ListItem extra={<span className="text-xs whitespace-nowrap text-mari-muted">{n.time}</span>}>
              <ListItemMeta avatar={<Avatar icon={<n.Icon />} color={n.color} alt="" />} title={n.title} description={n.text} />
            </ListItem>
          )}
        />
      </div>
    );
  },
};

/* ─────────────────────────── 4. Blog akışı ─────────────────────────── */

const posts = [
  {
    id: 1,
    title: "Tasarım sisteminde token katmanları",
    author: "Ayşe Kaya",
    color: "primary" as const,
    date: "24 Eyl",
    excerpt:
      "Primitive, semantic ve component token'larını neden ayırdık? Tema stüdyosunda bir rengi değiştirdiğinizde hangi katmanın nasıl etkilendiğini örneklerle anlatıyoruz.",
    likes: 128,
    comments: 14,
    Icon: LaptopIcon,
  },
  {
    id: 2,
    title: "Erişilebilir form alanları için kontrol listesi",
    author: "Mehmet Demir",
    color: "accent" as const,
    date: "19 Eyl",
    excerpt:
      "Etiket, açıklama ve hata mesajı arasındaki aria bağlantıları; dokunmatikte 44px hedef; renge güvenmeyen durum göstergeleri.",
    likes: 86,
    comments: 9,
    Icon: KeyboardIcon,
  },
];

function Cover({ Icon }: Readonly<{ Icon: typeof LaptopIcon }>) {
  return (
    <div className="flex aspect-[16/10] w-full items-center justify-center rounded-lg bg-gradient-to-br from-mari-primary-subtle to-mari-surface-alt text-mari-primary sm:w-60">
      <Icon size={48} strokeWidth={1.25} aria-hidden />
    </div>
  );
}

export const BlogFeed: Story = {
  name: "Blog Akışı (Dikey)",
  ...storyDoc(
    "`itemLayout=\"vertical\"`: başlık/yazar üstte, özet ortada, eylemler (beğeni, yorum) altta; `extra` sağda kapak " +
      "görseli. Dar ekranda görsel içeriğin üstüne çıkar.",
    `
<List
  itemLayout="vertical"
  size="lg"
  aria-label="Son yazılar"
  dataSource={posts}
  renderItem={(p) => (
    <ListItem
      extra={<img src={p.cover} alt="" className="w-60 rounded-lg" />}
      actions={[
        <span className="inline-flex items-center gap-1"><ThumbsUpIcon size={14} aria-hidden /> {p.likes} beğeni</span>,
        <span className="inline-flex items-center gap-1"><MessageCircleIcon size={14} aria-hidden /> {p.comments} yorum</span>,
      ]}
    >
      <ListItemMeta avatar={<Avatar alt={p.author} />} title={<a href={\`/blog/\${p.id}\`}>{p.title}</a>} description={\`\${p.author} · \${p.date}\`} />
      <p>{p.excerpt}</p>
    </ListItem>
  )}
/>`
  ),
  render: () => (
    <div className="max-w-3xl">
      <List
        itemLayout="vertical"
        size="lg"
        aria-label="Son yazılar"
        dataSource={posts}
        renderItem={(p) => (
          <ListItem
            extra={<Cover Icon={p.Icon} />}
            actions={[
              <span key="l" className="inline-flex items-center gap-1">
                <ThumbsUpIcon size={14} aria-hidden /> {p.likes} beğeni
              </span>,
              <span key="c" className="inline-flex items-center gap-1">
                <MessageCircleIcon size={14} aria-hidden /> {p.comments} yorum
              </span>,
            ]}
          >
            <ListItemMeta
              avatar={<Avatar alt={p.author} color={p.color} />}
              title={
                <a href={`#blog-${p.id}`} className="hover:text-mari-primary hover:underline">
                  {p.title}
                </a>
              }
              description={`${p.author} · ${p.date}`}
            />
            <p className="leading-6 text-mari-foreground">{p.excerpt}</p>
          </ListItem>
        )}
      />
    </div>
  ),
};

/* ─────────────────────────── 4b. Sonsuz akış ─────────────────────────── */

const activityNames = ["Ayşe Kaya", "Mehmet Demir", "Zeynep Arslan", "Can Yıldız", "Elif Şahin"];
const activityActions = ["siparişi onayladı", "yorum ekledi", "ürün fiyatını güncelledi", "iade talebini kapattı", "kampanya oluşturdu"];
const makeActivity = (from: number, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const n = from + i;
    return { id: n, who: activityNames[n % 5]!, what: activityActions[(n * 3) % 5]!, when: `${n + 2} dk önce` };
  });

export const InfiniteFeed: Story = {
  name: "Sonsuz Akış (infinite)",
  ...storyDoc(
    "`infinite`: liste sonu görünüme girince (200px önceden) `onLoadMore`; yüklenirken \"Yükleniyor…\", bitince " +
      "\"Hepsi bu kadar\" duyurulur. Kaydırılan bir kabın içinde de çalışır. Klavye kullanıcısı için Tab ile odaklanınca " +
      "beliren \"Daha fazla yükle\" düğmesi vardır (yalnız kaydırmaya bağlı yükleme alt bilgiye erişimi engeller).",
    `
const [items, setItems] = useState(firstPage);
const [loading, setLoading] = useState(false);

<div className="h-96 overflow-y-auto">
  <List
    aria-label="Etkinlik akışı"
    dataSource={items}
    renderItem={(a) => (
      <ListItem>
        <ListItemMeta title={a.title} description={a.time} />
      </ListItem>
    )}
    infinite={{
      hasMore: items.length < total,
      loading,
      onLoadMore: async () => {
        setLoading(true);
        setItems([...items, ...(await fetchNext(items.length))]);
        setLoading(false);
      },
    }}
  />
</div>`
  ),
  render: () => {
    const TOTAL = 40;
    const [items, setItems] = useState(() => makeActivity(0, 10));
    const [loading, setLoading] = useState(false);
    const onLoadMore = () => {
      setLoading(true);
      setTimeout(() => {
        setItems((prev) => [...prev, ...makeActivity(prev.length, 10)]);
        setLoading(false);
      }, 700);
    };
    return (
      // Kaydırılan bölge klavyeyle de kaydırılabilsin: içinde odaklanabilir düğme var.
      <div className="h-96 max-w-lg overflow-y-auto rounded-lg border border-mari-border bg-mari-surface px-4">
        <List
          aria-label="Etkinlik akışı"
          dataSource={items}
          renderItem={(a) => (
            <ListItem extra={<span className="text-xs whitespace-nowrap text-mari-muted">{a.when}</span>}>
              <ListItemMeta avatar={<Avatar alt={a.who} size="sm" />} title={a.who} description={a.what} />
            </ListItem>
          )}
          infinite={{ hasMore: items.length < TOTAL, loading, onLoadMore, endMessage: `Son ${TOTAL} etkinliğin hepsi bu kadar` }}
        />
      </div>
    );
  },
};

/* ─────────────────────────── 5. Ürün ızgarası ─────────────────────────── */

const products = [
  { id: 1, name: "Kablosuz Kulaklık Pro", price: 2499, Icon: HeadphonesIcon },
  { id: 2, name: "Akıllı Saat S3 44 mm", price: 3799, Icon: WatchIcon },
  { id: 3, name: "Mekanik Klavye TKL", price: 1899, Icon: KeyboardIcon },
  { id: 4, name: "Aynasız Fotoğraf Makinesi", price: 32499, Icon: CameraIcon },
  { id: 5, name: "Ultra İnce Dizüstü 14\"", price: 41999, Icon: LaptopIcon },
  { id: 6, name: "Kablosuz Kulaklık Lite", price: 1299, Icon: HeadphonesIcon },
];

const tl = (n: number) => n.toLocaleString("tr-TR") + " ₺";

export const ProductGrid: Story = {
  name: "Ürün Izgarası (grid)",
  ...storyDoc(
    "`grid`: satırlar yerine hücreler; her hücrede bir Card. Sütun sayısı kırılım noktası başına verilir (mobil önce): " +
      "`{ base: 1, sm: 2, lg: 3 }`. Izgarada satır ayırıcısı çizilmez.",
    `
<List
  aria-label="Ürünler"
  grid={{ columns: { base: 1, sm: 2, lg: 3 }, gap: "md" }}
  dataSource={products}
  renderItem={(p) => (
    <ListItem>
      <Card href={\`/urun/\${p.id}\`} size="sm" cover={<img src={p.image} alt="" />} title={p.name}>
        {tl(p.price)}
      </Card>
    </ListItem>
  )}
/>`
  ),
  render: () => (
    <div className="max-w-4xl">
      <List
        aria-label="Ürünler"
        grid={{ columns: { base: 1, sm: 2, lg: 3 }, gap: "md" }}
        dataSource={products}
        renderItem={(p) => (
          <ListItem>
            <Card
              href={`#urun-${p.id}`}
              size="sm"
              title={p.name}
              cover={
                <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-mari-primary-subtle to-mari-surface-alt text-mari-primary">
                  <p.Icon size={48} strokeWidth={1.25} aria-hidden />
                </div>
              }
            >
              <span className="font-semibold">{tl(p.price)}</span>
            </Card>
          </ListItem>
        )}
      />
    </div>
  ),
};

/* ─────────────────────────── 6. Sayfalı siparişler ─────────────────────────── */

const statuses = [
  { label: "Teslim edildi", color: "success" },
  { label: "Kargoda", color: "info" },
  { label: "Hazırlanıyor", color: "warning" },
  { label: "İptal", color: "error" },
] as const;

const orders = Array.from({ length: 23 }, (_, i) => ({
  id: 20500 - i,
  date: `${28 - (i % 28)} Eyl 2026`,
  total: 499 + ((i * 1370) % 9000),
  status: statuses[i % statuses.length]!,
}));

export const PaginatedOrders: Story = {
  name: "Sayfalı Siparişler",
  ...storyDoc(
    "`pagination` verilince List `dataSource`u kendisi dilimler (istemci tarafı). Sunucu tarafı için `totalItems` verin: " +
      "`dataSource` o sayfanın kayıtları olur, `onPageChange`de yenisini getirirsiniz. Pagination'ın tüm prop'ları geçer.",
    `
<List
  bordered
  header="Siparişlerim"
  dataSource={orders}
  pagination={{ pageSize: 5, showTotal: true }}
  renderItem={(o) => (
    <ListItem extra={<a href={\`/siparis/\${o.id}\`}>Detay</a>}>
      <ListItemMeta title={\`#\${o.id}\`} description={o.date} />
      <span className="font-medium">{o.total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}</span>
      <Tag color={o.status.color}>{o.status.label}</Tag>
    </ListItem>
  )}
/>

// Sunucu tarafı:
<List
  dataSource={pageRows}
  pagination={{ totalItems: 1240, currentPage: page, onPageChange: fetchPage }}
  renderItem={(o) => <ListItem><ListItemMeta title={\`#\${o.id}\`} description={o.date} /></ListItem>}
/>`
  ),
  render: () => (
    <div className="max-w-2xl">
      <List
        bordered
        header="Siparişlerim"
        dataSource={orders}
        pagination={{ pageSize: 5, showTotal: true }}
        renderItem={(o) => (
          <ListItem
            extra={
              <a href={`#siparis-${o.id}`} className="text-mari-primary hover:underline" aria-label={`#${o.id} sipariş detayı`}>
                Detay
              </a>
            }
          >
            <ListItemMeta title={`#${o.id}`} description={o.date} />
            <div className="flex items-center gap-3">
              <span className="font-medium tabular-nums">{tl(o.total)}</span>
              <Tag color={o.status.color}>{o.status.label}</Tag>
            </div>
          </ListItem>
        )}
      />
    </div>
  ),
};

/* ─────────────────────────── 7. Boş durum ─────────────────────────── */

export const EmptyState: Story = {
  name: "Boş Durum",
  ...storyDoc(
    "Kayıt yokken varsayılan olarak küçük bir Empty (\"Kayıt yok\") çizilir; `empty` ile bağlama uygun metin ve eylem verin.",
    `
<List
  bordered
  header="Kayıtlı adresler"
  dataSource={[] as { id: number; title: string }[]}
  renderItem={(address) => <ListItem>{address.title}</ListItem>}
  empty={<Empty size="sm" title="Kayıtlı adresiniz yok" description="Hızlı ödeme için bir teslimat adresi ekleyin." buttonText="Adres ekle" onClick={() => setAddressOpen(true)} />}
/>`
  ),
  render: () => (
    <div className="grid max-w-4xl gap-6 md:grid-cols-2">
      <List bordered header="Varsayılan" dataSource={[] as Member[]} renderItem={(m) => <ListItem>{m.name}</ListItem>} />
      <List
        bordered
        header="Kayıtlı adresler"
        dataSource={[] as Member[]}
        renderItem={(m) => <ListItem>{m.name}</ListItem>}
        empty={
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <p className="font-semibold">Kayıtlı adresiniz yok</p>
            <p className="text-mari-muted">Hızlı ödeme için bir teslimat adresi ekleyin.</p>
            <Button size="sm" className="mt-2">
              Adres ekle
            </Button>
          </div>
        }
      />
    </div>
  ),
};

/* ─────────────────────────── 2. Boyutlar ─────────────────────────── */

const settings = ["İki adımlı doğrulama", "Oturum açma bildirimleri", "Haftalık özet e-postası"];

export const Sizes: Story = {
  name: "Boyutlar ve Çerçeve",
  ...storyDoc(
    "`size` satır dolgusunu değiştirir (sm 8 / md 12 / lg 16px); `bordered` dış çerçeve ekler ve satırları yatayda içeri " +
      "çeker. Çerçevesiz liste bir kartın/panelin içine gömülür.",
    `
const settings = ["İki adımlı doğrulama", "Oturum açma bildirimleri", "Haftalık özet e-postası"];
const renderSetting = (s: string) => <ListItem extra={<Switch aria-label={s} />}>{s}</ListItem>;

<List size="sm" bordered header="Güvenlik" dataSource={settings} renderItem={renderSetting} />
<List size="md" bordered header="Güvenlik" dataSource={settings} renderItem={renderSetting} />
<List size="lg" bordered header="Güvenlik" dataSource={settings} renderItem={renderSetting} />
{/* ayırıcısız, çerçevesiz */}
<List split={false} dataSource={settings} renderItem={renderSetting} />`
  ),
  render: () => (
    <div className="grid max-w-5xl gap-6 md:grid-cols-2">
      {(["sm", "md", "lg"] as const).map((size) => (
        <List
          key={size}
          size={size}
          bordered
          header={`Güvenlik (${size})`}
          dataSource={settings}
          renderItem={(s) => <ListItem extra={<Switch size="sm" aria-label={`${s} (${size})`} defaultChecked={s !== settings[2]} />}>{s}</ListItem>}
        />
      ))}
      <List
        split={false}
        header="Ayırıcısız, çerçevesiz"
        dataSource={settings}
        renderItem={(s) => <ListItem extra={<Switch size="sm" aria-label={`${s} (ayırıcısız)`} />}>{s}</ListItem>}
      />
    </div>
  ),
};

/* ─────────────────────────── 8. İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton`: veri varsa (yenileme) satırlar kendi şeklinde, yoksa (ilk yükleme) sayfa boyu kadar genel satır çizilir; " +
      "başlık, alt bilgi ve sayfalama da iskelete döner. Bir EYLEM sürerken (sayfa değişimi) `loading` kullanın.",
    `
const members = [
  { id: 1, name: "Ayşe Kaya", email: "ayse.kaya@ornek.com" },
  { id: 2, name: "Mehmet Demir", email: "mehmet.demir@ornek.com" },
];
const renderMember = (m: (typeof members)[number]) => (
  <ListItem><ListItemMeta title={m.name} description={m.email} /></ListItem>
);

<List skeleton bordered header="Ekip üyeleri" dataSource={members} renderItem={renderMember} />
{/* ilk yükleme: veri yokken satır iskeletleri */}
<List skeleton bordered header="Ekip üyeleri" dataSource={[] as typeof members} renderItem={renderMember} />
<List loading dataSource={members} renderItem={renderMember} />`
  ),
  render: () => {
    const row = (m: Member) => (
      <ListItem actions={[<Button key="e" size="sm" variant="link">Düzenle</Button>]}>
        <ListItemMeta avatar={<Avatar alt={m.name} color={m.color} />} title={m.name} description={m.email} />
      </ListItem>
    );
    return (
      <SkeletonDemo className="w-full max-w-5xl">
        {(skeleton) => (
          <div className="grid gap-6 md:grid-cols-2">
            <List skeleton={skeleton} bordered header="Yenileme (veri var)" footer="4 üye" dataSource={members} renderItem={row} />
            <List skeleton={skeleton} bordered header="İlk yükleme (veri yok)" dataSource={skeleton ? [] : members} renderItem={row} />
            <List loading={skeleton} bordered header="loading (eylem sürüyor)" dataSource={members} renderItem={row} />
          </div>
        )}
      </SkeletonDemo>
    );
  },
};
