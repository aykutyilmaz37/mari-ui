import React, { useState } from "react";
import { Text, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import type { ColorRole } from "@mari-ui/core";
import { Bell, PackageCheck, Truck } from "lucide-react-native";
import { Button } from "../Button";
import { List, ListItem, ListItemMeta } from "./List";
import { NativeConfigProvider } from "../nativeConfig";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";
import { useTheme } from "../theme/useTheme";

interface Contact {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: ColorRole;
}

const CONTACTS: Contact[] = [
  { id: "ayse", name: "Ayşe Demir", role: "Ürün tasarımcısı · İstanbul", initials: "AD", color: "primary" },
  { id: "mert", name: "Mert Kaya", role: "Mobil geliştirici · Ankara", initials: "MK", color: "success" },
  { id: "elif", name: "Elif Can", role: "Ürün yöneticisi · İzmir", initials: "EC", color: "warning" },
];

const meta: Meta<typeof List> = {
  title: "Native/Veri Gösterimi/List",
  component: List,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Uzun ve sanallaştırılmış kayıt listeleri. Native `FlatList` kaydırma, yenileme ve sonsuz sayfalama davranışlarını korur; metrikler native config'ten gelir.",
          whenToUse: ["Kişi, sipariş veya bildirim kayıtları.", "Büyük veri kümelerinde sanallaştırılmış kaydırma."],
          whenNotToUse: ["Kısa, sabit içerik — `View` ile düzenleyin.", "Kart tabanlı tekil özet — `Card` kullanın."],
          vsWeb: "`dataSource` → `data`, `rowKey` → `keyExtractor`, `header/footer/empty` → `ListHeaderComponent/ListFooterComponent/ListEmptyComponent`, `infinite` → guarded `FlatList.onEndReached`. Boyutlar native config'ten gelir.",
        }),
      },
    },
  },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    itemLayout: { control: "select", options: ["horizontal", "vertical"] },
    bordered: { control: "boolean" },
    split: { control: "boolean" },
    skeleton: { control: "boolean" },
    skeletonRows: { control: { type: "number", min: 1, max: 10 } },
  },
  args: { size: "md", itemLayout: "horizontal", bordered: true, split: true, skeleton: false, skeletonRows: 3 },
};

export default meta;
type Story = StoryObj<typeof meta>;

function AvatarBadge({ contact }: { contact: Contact }) {
  const theme = useTheme();
  return (
    <View style={{ width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: theme.color[contact.color].solid }}>
      <Text style={{ color: theme.color[contact.color].solidContrast, fontSize: 14, fontWeight: "700" }}>{contact.initials}</Text>
    </View>
  );
}

function ContactList() {
  const theme = useTheme();
  return (
    <List
      bordered
      data={CONTACTS}
      keyExtractor={(contact) => contact.id}
      ListHeaderComponent={<Text style={{ padding: 16, fontSize: 17, fontWeight: "600", color: theme.color.canvas.foreground }}>Ürün ekibi · 3 kişi</Text>}
      renderItem={(contact) => (
        <ListItem>
          <ListItemMeta avatar={<AvatarBadge contact={contact} />} title={contact.name} description={contact.role} />
        </ListItem>
      )}
    />
  );
}

export const Playground: Story = {
  ...storyDoc("Native ölçekte yoğunluk, düzen, kenarlık, ayırıcı ve iskeleti deneyin.", `<List
  bordered
  size="md"
  data={contacts}
  keyExtractor={(c) => c.id}
  renderItem={(c) => (
    <ListItem>
      <ListItemMeta avatar={<Avatar alt={c.name} />} title={c.name} description={c.role} />
    </ListItem>
  )}
/>`),
  render: (args) => (
    <List
      {...args}
      data={CONTACTS}
      keyExtractor={(contact) => contact.id}
      renderItem={(contact) => <ListItem><ListItemMeta avatar={<AvatarBadge contact={contact} />} title={contact.name} description={contact.role} /></ListItem>}
    />
  ),
};

export const Contacts: Story = {
  name: "Ekip Rehberi",
  ...storyDoc("Avatar, ad ve ikincil bilgi içeren sanallaştırılmış ekip listesi. Satır anahtarı `keyExtractor` ile kararlı tutulur.", `<List data={team} keyExtractor={(person) => person.id} renderItem={(person) => (
  <ListItem><ListItemMeta avatar={<Avatar />} title={person.name} description={person.role} /></ListItem>
)} />`),
  render: () => <ContactList />,
};

const NOTIFICATIONS = [
  { id: "shipped", title: "Sipariş kargoya verildi", description: "#4821 · Tahmini teslimat 6 Ekim", icon: Truck },
  { id: "delivered", title: "Paketiniz teslim edildi", description: "#4798 · Dün, 14.32", icon: PackageCheck },
  { id: "reminder", title: "Favoriniz tekrar stokta", description: "Kablosuz Kulaklık Pro · 2 saat önce", icon: Bell },
  { id: "promo", title: "Hafta sonu fırsatları başladı", description: "Seçili ürünlerde ücretsiz kargo", icon: Bell },
];

function NotificationFeed() {
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 700);
  };
  return (
    <List
      data={NOTIFICATIONS}
      refreshing={refreshing}
      onRefresh={refresh}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={<Text style={{ paddingHorizontal: 16, paddingVertical: 12, color: theme.color.canvas.muted, fontSize: 13 }}>Son hareketler · yenilemek için aşağı çekin</Text>}
      renderItem={(item) => {
        const Icon = item.icon;
        return (
          <ListItem>
            <ListItemMeta
              avatar={<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.color.primary.subtle, alignItems: "center", justifyContent: "center" }}><Icon size={19} color={theme.color.primary.text} /></View>}
              title={item.title}
              description={item.description}
            />
          </ListItem>
        );
      }}
    />
  );
}

export const Notifications: Story = {
  name: "Bildirim Akışı",
  ...storyDoc("Bildirim satırlarında avatar/ikon, başlık ve açıklama; yenilemek için native pull-to-refresh hareketi.", `<List
  data={notifications}
  refreshing={refreshing}
  onRefresh={reload}
  renderItem={(n) => (
    <ListItem extra={<Text muted>{n.time}</Text>}>
      <ListItemMeta avatar={<n.Icon size={20} />} title={n.title} description={n.description} />
    </ListItem>
  )}
/>`),
  render: () => <NotificationFeed />,
};

const ACTIVITY_EVENTS = [
  { title: "Sipariş #4821 kargoya verildi", description: "MNG Kargo · 16 dk önce", icon: Truck },
  { title: "Paket #4798 teslim edildi", description: "Kadıköy, İstanbul · 34 dk önce", icon: PackageCheck },
  { title: "Yeni bir ürün yorumu var", description: "Kablosuz Kulaklık Pro · 48 dk önce", icon: Bell },
  { title: "Sipariş #4830 hazırlanıyor", description: "Tahmini kargoya veriliş: bugün", icon: PackageCheck },
  { title: "Stok bildirimi gönderildi", description: "Akıllı Saat S3 · 1 saat önce", icon: Bell },
  { title: "İade talebi alındı", description: "#4782 · İnceleme bekliyor", icon: PackageCheck },
  { title: "Kurye paketinizi teslim aldı", description: "Sipariş #4817 · 2 saat önce", icon: Truck },
  { title: "Hafta sonu fırsatları başladı", description: "Seçili ürünlerde ücretsiz kargo", icon: Bell },
  { title: "Sipariş #4805 teslim edildi", description: "Çankaya, Ankara · 3 saat önce", icon: PackageCheck },
  { title: "Yeni ürün koleksiyonu yayında", description: "Ev ve yaşam · 4 saat önce", icon: Bell },
];

const INFINITE_TOTAL = 34;
const INFINITE_PAGE_SIZE = 10;
const makeActivityPage = (start: number, count: number) =>
  Array.from({ length: Math.min(count, INFINITE_TOTAL - start) }, (_, index) => {
    const eventIndex = (start + index) % ACTIVITY_EVENTS.length;
    return { id: `activity-${start + index}`, ...ACTIVITY_EVENTS[eventIndex]! };
  });

function InfiniteActivityFeed() {
  const theme = useTheme();
  const [items, setItems] = useState(() => makeActivityPage(0, INFINITE_PAGE_SIZE));
  const [loading, setLoading] = useState(false);
  const loadMore = () => {
    if (loading || items.length >= INFINITE_TOTAL) return;
    setLoading(true);
    setTimeout(() => {
      setItems((current) => [...current, ...makeActivityPage(current.length, INFINITE_PAGE_SIZE)]);
      setLoading(false);
    }, 700);
  };
  return (
    <View style={{ width: "100%", alignSelf: "stretch", height: 440, overflow: "hidden", borderWidth: 1, borderColor: theme.color.canvas.border, borderRadius: 12, backgroundColor: theme.color.canvas.surface }}>
      <List
        accessibilityLabel="Etkinlik akışı"
        style={{ flex: 1, width: "100%" }}
        data={items}
        keyExtractor={(item) => item.id}
        onEndReachedThreshold={0.25}
        infinite={{ hasMore: items.length < INFINITE_TOTAL, loading, onLoadMore: loadMore, endMessage: "Tüm etkinlikler gösterildi" }}
        renderItem={(item) => {
          const Icon = item.icon;
          return (
            <ListItem>
              <ListItemMeta
                avatar={<View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.color.primary.subtle, alignItems: "center", justifyContent: "center" }}><Icon size={19} color={theme.color.primary.text} /></View>}
                title={item.title}
                description={item.description}
              />
            </ListItem>
          );
        }}
      />
    </View>
  );
}

export const InfiniteScroll: Story = {
  name: "Sonsuz Akış",
  ...storyDoc(
    "Listenin sonuna yaklaştıkça yeni etkinlikleri otomatik ekler. Yüklenirken gösterge, kaydırmaya alternatif olarak erişilebilir bir `Daha fazla yükle` düğmesi, son sayfada bitiş mesajı gösterir.",
    `<List
  data={activities}
  keyExtractor={(activity) => activity.id}
  onEndReachedThreshold={0.25}
  infinite={{
    hasMore,
    loading,
    onLoadMore: fetchNextPage,
    endMessage: "Tüm etkinlikler gösterildi",
  }}
  renderItem={(activity) => <ListItem>…</ListItem>}
/>`
  ),
  render: () => <InfiniteActivityFeed />,
};

function RefreshableOrders() {
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();
  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 650);
  };
  return (
    <List
      bordered
      data={[{ id: "4821", date: "3 Eki", status: "Kargoda", amount: "₺1.284,50" }, { id: "4798", date: "1 Eki", status: "Teslim edildi", amount: "₺679,00" }]}
      refreshing={refreshing}
      onRefresh={refresh}
      renderItem={(order) => (
        <ListItem extra={<Text style={{ color: theme.color.success.text, fontSize: 13, fontWeight: "600" }}>{order.status}</Text>}>
          <ListItemMeta title={`Sipariş #${order.id}`} description={`${order.date} · ${order.amount}`} />
        </ListItem>
      )}
    />
  );
}

export const PullToRefresh: Story = {
  name: "Siparişler · Yenile",
  ...storyDoc("Sipariş geçmişinde yerel pull-to-refresh hareketi ve her satırda durum/ücret bilgisi.", `<List
  data={orders}
  refreshing={refreshing}
  onRefresh={reload}
  renderItem={(o) => (
    <ListItem extra={<Tag color={o.color}>{o.status}</Tag>}>
      <ListItemMeta title={"Sipariş #" + o.id} description={o.total} />
    </ListItem>
  )}
/>`),
  render: () => <RefreshableOrders />,
};

export const LoadMore: Story = {
  name: "Sayfalı Bildirimler",
  ...storyDoc("`ListFooterComponent` bir devam eylemi sunar; düğmenin boyutu native kontrol ölçeğini kullanır.", `<List
  data={items}
  renderItem={(n) => <ListItem><ListItemMeta title={n.title} description={n.description} /></ListItem>}
  ListFooterComponent={hasMore ? <Button variant="outline" size="sm" loading={loading} onPress={loadMore}>Daha fazla yükle</Button> : undefined}
/>`),
  render: () => <LoadMoreDemo />,
};

export const CustomNativeScale: Story = {
  name: "Uygulamaya Özel Native Ölçek",
  ...storyDoc("`NativeConfigProvider` ile yalnızca bu alanın satır yüksekliği, dolgusu ve başlık boyutu değişir; diğer native varsayılanlar korunur.", `<NativeConfigProvider config={{ list: { md: { rowMinHeight: 56, rowPaddingVertical: 16, titleFontSize: 17 } } }}>
  <List data={contacts} renderItem={(c) => <ListItem><ListItemMeta title={c.name} description={c.role} /></ListItem>} />
</NativeConfigProvider>`),
  render: () => (
    <NativeConfigProvider config={{ list: { md: { rowMinHeight: 56, rowPaddingVertical: 16, titleFontSize: 17 } } }}>
      <List
        data={CONTACTS}
        keyExtractor={(contact) => contact.id}
        renderItem={(contact) => <ListItem><ListItemMeta avatar={<AvatarBadge contact={contact} />} title={contact.name} description={contact.role} /></ListItem>}
      />
    </NativeConfigProvider>
  ),
};

function LoadMoreDemo() {
  const [count, setCount] = useState(2);
  const [loading, setLoading] = useState(false);
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setCount(NOTIFICATIONS.length);
      setLoading(false);
    }, 500);
  };
  return (
    <List
      data={NOTIFICATIONS.slice(0, count)}
      renderItem={(item) => <ListItem><ListItemMeta title={item.title} description={item.description} /></ListItem>}
      ListFooterComponent={count < NOTIFICATIONS.length ? <View style={{ alignItems: "center", padding: 12 }}><Button variant="outline" size="sm" loading={loading} onPress={loadMore}>Daha fazla yükle</Button></View> : undefined}
    />
  );
}
export const Empty: Story = {
  name: "Boş Durum",
  ...storyDoc("Özel `ListEmptyComponent` ile henüz içerik yokken sonraki adımı açıklayın.", `<List
  data={[]}
  renderItem={() => null}
  ListEmptyComponent={
    <View style={{ alignItems: "center", padding: 24, gap: 12 }}>
      <Text weight="semibold">Kaydedilmiş adres yok</Text>
      <Button size="sm" onPress={addAddress}>Adres ekle</Button>
    </View>
  }
/>`),
  render: () => <EmptyAddresses />,
};

function EmptyAddresses() {
  const [added, setAdded] = useState(false);
  const theme = useTheme();
  return (
    <List
      data={[]}
      renderItem={() => null}
      ListEmptyComponent={
        <View style={{ alignItems: "center", padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: theme.color.canvas.foreground }}>{added ? "Adres ekleme başlatıldı" : "Kaydedilmiş adres yok"}</Text>
          <Text style={{ color: theme.color.canvas.muted, textAlign: "center" }}>{added ? "Teslimat adresinizi bir sonraki adımda girebilirsiniz." : "İlk adresinizi eklediğinizde teslimat sırasında burada seçebilirsiniz."}</Text>
          <Button size="sm" onPress={() => setAdded(true)}>{added ? "Devam et" : "Adres ekle"}</Button>
        </View>
      }
    />
  );
}


export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<List data={team} skeleton={isLoading} skeletonRows={3} keyExtractor={(p) => p.id} renderItem={(p) => (
  <ListItem><ListItemMeta avatar={<Avatar />} title={p.name} description={p.role} /></ListItem>
)} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <List
          bordered
          skeleton={skeleton}
          skeletonRows={CONTACTS.length}
          data={CONTACTS}
          keyExtractor={(contact) => contact.id}
          renderItem={(contact) => <ListItem><ListItemMeta avatar={<AvatarBadge contact={contact} />} title={contact.name} description={contact.role} /></ListItem>}
        />
      )}
    </SkeletonDemo>
  ),
};
