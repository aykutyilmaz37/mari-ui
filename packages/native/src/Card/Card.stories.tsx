import React, { useState } from "react";
import { Switch as NativeSwitch, Text, View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { ArrowDownRight, ArrowUpRight, BookOpen, Check, Headphones, Keyboard, Laptop, Pencil, Share2, ShoppingBag, Smartphone, Star, Watch } from "lucide-react-native";
import { Card } from "./Card";
import { CardMeta } from "./CardMeta";
import { Button } from "../Button/Button";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Card> = {
  title: "Native/Veri Gösterimi/Card",
  component: Card,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "İçerik kartı: kapak, başlık, ek bilgi, gövde, alt bilgi ve eşit bölünmüş eylemler. CardMeta avatar/başlık/açıklama düzeni sunar.",
    whenToUse: ["Sipariş, profil, ürün veya ayar gruplarını özetlemek.", "onPress ile tek bir dokunulabilir liste öğesi oluşturmak."],
    whenNotToUse: ["Kartın içindeki düğmeler ayrı çalışacaksa kartın tamamına onPress vermeyin."],
    vsWeb: "Özellikler ortak; ölçüler native'e özel: sm/md/lg dolgu 12/16/20, yazı 14/16/17. onClick yerine onPress; href/target yerine uygulamanın yönlendirme callback'i. classNames yerine slotStyles. hoverable yalnız basılma geri bildirimini kontrol eder.",
  }) } } },
  argTypes: {
    title: { control: "text" }, children: { control: "text" }, extra: { control: "text" }, footer: { control: "text" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    bordered: { control: "boolean" }, inset: { control: "boolean" }, disabled: { control: "boolean" },
    hoverable: { control: "boolean" }, skeleton: { control: "boolean" },
    actions: { control: false }, cover: { control: false }, slotStyles: { control: false },
  },
  args: { title: "Sipariş #4821", children: "2 ürün · ₺1.284,50 · Kargoda", bordered: true, size: "md", skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Card>;

export const Playground: Story = {
  ...storyDoc("Native ölçekte tüm özellikleri deneyin."),
  render: (args) => <Stack><Card {...args} /></Stack>,
};

export const OrderSummary: Story = {
  name: "Sipariş Özeti",
  ...storyDoc("Başlık, ek bilgi, alt bilgi ve bağımsız eylemler.", `<Card title="Sipariş #4821" extra="3 Eki" footer="Tahmini teslimat: 6 Ekim" actions={[<Button onPress={track}>Takip</Button>, <Button onPress={help}>Destek</Button>]}>2 ürün · ₺1.284,50</Card>`),
  render: () => <OrderExample />,
};

const products = [
  { name: "Kablosuz Kulaklık Pro", price: "₺2.499", oldPrice: "₺3.199", rating: "4,8", reviews: "128 değerlendirme", Icon: Headphones, color: "primary" as const },
  { name: "Akıllı Saat S3 · 44 mm", price: "₺3.799", oldPrice: undefined, rating: "4,6", reviews: "86 değerlendirme", Icon: Watch, color: "accent" as const },
  { name: "Mekanik Klavye TKL", price: "₺1.899", oldPrice: "₺2.299", rating: "4,9", reviews: "342 değerlendirme", Icon: Keyboard, color: "success" as const },
  { name: "Günlük Sırt Çantası", price: "₺1.249", oldPrice: undefined, rating: "4,7", reviews: "57 değerlendirme", Icon: ShoppingBag, color: "info" as const },
];

export const ProductGrid: Story = {
  name: "Ürün Kataloğu",
  ...storyDoc("Mobil mağazada iki sütunlu ürün kartları: görsel alanı, puan, indirimli fiyat ve kart içine yerleştirilmiş bağımsız sepet eylemi."),
  render: () => <ProductCatalog />,
};
function ProductCatalog() {
  const theme = useTheme();
  const [added, setAdded] = useState<string[]>([]);
  const toggleProduct = (name: string) => setAdded((items) => items.includes(name) ? items.filter((item) => item !== name) : [...items, name]);
  return <Stack><Text style={{ color: theme.color.canvas.muted }}>Çok satanlar · Ücretsiz kargo</Text><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
    {products.map(({ name, price, oldPrice, rating, reviews, Icon, color }) => {
      const tone = theme.color[color];
      const isAdded = added.includes(name);
      return <Card key={name} size="sm" style={{ flexGrow: 1, flexBasis: 145, maxWidth: "49%" }} cover={<View style={{ height: 104, alignItems: "center", justifyContent: "center", backgroundColor: tone.subtle }}><Icon size={38} color={tone.text} /></View>}>
        <Text style={{ color: theme.color.canvas.foreground, fontWeight: "600" }} numberOfLines={2}>{name}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}><Star size={14} color={theme.color.warning.solid} /><Text style={{ color: theme.color.canvas.foreground }}>{rating}</Text><Text style={{ color: theme.color.canvas.muted, fontSize: 12 }}>({reviews})</Text></View>
        <View style={{ flexDirection: "row", alignItems: "baseline", flexWrap: "wrap", gap: 6, marginTop: 10 }}><Text style={{ color: theme.color.canvas.foreground, fontWeight: "700", fontSize: 17 }}>{price}</Text>{oldPrice ? <Text style={{ color: theme.color.canvas.muted, fontSize: 12, textDecorationLine: "line-through" }}>{oldPrice}</Text> : null}</View>
        <View style={{ marginTop: 10 }}><Button size="sm" block variant={isAdded ? "soft" : "solid"} color={isAdded ? "success" : "primary"} onPress={() => toggleProduct(name)}>{isAdded ? "Sepete eklendi" : "Sepete ekle"}</Button></View>
      </Card>;
    })}
  </View></Stack>;
}

const metrics = [
  { label: "Toplam gelir", value: "₺482.310", delta: "+12,4%", positive: true, Icon: ArrowUpRight },
  { label: "Siparişler", value: "3.847", delta: "+8,1%", positive: true, Icon: ArrowUpRight },
  { label: "Dönüşüm", value: "%3,2", delta: "−0,4%", positive: false, Icon: ArrowDownRight },
  { label: "Ort. sepet", value: "₺1.254", delta: "+3,9%", positive: true, Icon: ArrowUpRight },
];

export const KpiDashboard: Story = {
  name: "Satış Özeti",
  ...storyDoc("Yönetici dashboard'unda kısa dönem karşılaştırmalı metrikler. Dört kart küçük ekranda iki sütun olur; iskelet düğmesi yüklenme halini gösterir."),
  render: () => <KpiExample />,
};
function KpiExample() {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  return <Stack><View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}><Text style={{ color: theme.color.canvas.muted }}>Son 30 gün · önceki döneme göre</Text><Button size="sm" variant="outline" color="neutral" onPress={() => { setLoading(true); setTimeout(() => setLoading(false), 1100); }}>Yenile</Button></View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>{metrics.map(({ label, value, delta, positive, Icon }) => <Card key={label} size="sm" skeleton={loading} style={{ flexGrow: 1, flexBasis: 150 }}>
      <Text style={{ color: theme.color.canvas.muted, fontSize: 14 }}>{label}</Text><Text style={{ color: theme.color.canvas.foreground, fontSize: 20, fontWeight: "700", marginTop: 4 }}>{value}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 }}><Icon size={16} color={positive ? theme.color.success.text : theme.color.error.text} /><Text style={{ color: positive ? theme.color.success.text : theme.color.error.text, fontWeight: "600" }}>{delta}</Text><Text style={{ color: theme.color.canvas.muted, fontSize: 12 }}>geçen aya göre</Text></View>
    </Card>)}</View>
  </Stack>;
}

export const ArticleFeed: Story = {
  name: "Makale Akışı",
  ...storyDoc("Okuma listesinde kapak, kategori, iki satırda kesilen başlık ve yazar bilgisi. Kaydet düğmesi kartın geri kalanından bağımsız çalışır."),
  render: () => <ArticleExample />,
};
function ArticleExample() {
  const theme = useTheme();
  const [saved, setSaved] = useState(false);
  return <Stack><Card cover={<View style={{ height: 128, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary.subtle }}><BookOpen size={42} color={theme.color.primary.text} /></View>} extra={<Text style={{ color: theme.color.accent.text, fontSize: 12, fontWeight: "600" }}>TASARIM</Text>} footer={<CardMeta avatar={<View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.accent.subtle }}><Text style={{ color: theme.color.accent.text, fontWeight: "600" }}>EC</Text></View>} title="Elif Can" description="24 Eyl · 6 dk okuma" />}>
      <Text style={{ color: theme.color.canvas.foreground, fontSize: 17, lineHeight: 23, fontWeight: "700" }} numberOfLines={2}>Token tabanlı temada renkleri çalışma zamanında değiştirmek</Text><Text style={{ color: theme.color.canvas.muted, marginTop: 8, lineHeight: 20 }}>Tek tema kaynağından açık, koyu ve markaya özel görünümler üretmenin pratik yolu.</Text>
    </Card><Button size="sm" variant={saved ? "soft" : "outline"} color={saved ? "success" : "neutral"} onPress={() => setSaved((value) => !value)}>{saved ? "Okuma listesine kaydedildi" : "Okuma listesine kaydet"}</Button></Stack>;
}

const plans = [
  { name: "Başlangıç", price: "Ücretsiz", cadence: "5 kullanıcıya kadar", features: ["3 proje", "Temel raporlar", "Topluluk desteği"], featured: false },
  { name: "Ekip", price: "₺149", cadence: "kullanıcı başı / ay", features: ["Sınırsız proje", "Gelişmiş raporlar", "Öncelikli destek"], featured: true },
  { name: "Kurumsal", price: "Teklif al", cadence: "ihtiyacınıza göre", features: ["SSO ve denetim kaydı", "Özel SLA", "Atanmış destek"], featured: false },
];

export const Pricing: Story = {
  name: "Abonelik Planları",
  ...storyDoc("Küçük ekranda art arda akan plan kartları; öne çıkan pakette açık rozet, dahil olan özellikler ve tek ana eylem."),
  render: () => <PricingExample />,
};
function PricingExample() {
  const theme = useTheme();
  const [selected, setSelected] = useState("");
  return <Stack>{plans.map((plan) => {
    let callToAction = "Bu planı seç";
    if (plan.featured) callToAction = "14 gün ücretsiz dene";
    if (selected === plan.name) callToAction = "Seçildi";
    return <Card key={plan.name} title={plan.name} size="sm" inset={plan.featured} extra={plan.featured ? <Text style={{ color: theme.color.primary.text, fontSize: 12, fontWeight: "600" }}>ÖNERİLEN</Text> : undefined} footer={selected === plan.name ? "Planınız seçildi. İstediğiniz zaman değiştirebilirsiniz." : plan.cadence}>
    <Text style={{ color: theme.color.canvas.foreground, fontSize: 24, lineHeight: 30, fontWeight: "700" }}>{plan.price}</Text>
    <View style={{ gap: 8, marginTop: 12 }}>{plan.features.map((feature) => <View key={feature} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Check size={16} color={theme.color.success.text} /><Text style={{ flex: 1, color: theme.color.canvas.foreground }}>{feature}</Text></View>)}</View>
    <View style={{ marginTop: 14 }}><Button block variant={plan.featured ? "solid" : "outline"} color={plan.featured ? "primary" : "neutral"} onPress={() => setSelected(plan.name)}>{callToAction}</Button></View>
  </Card>;
  })}</Stack>;
}

export const SettingsPanel: Story = {
  name: "Ayarlar ve Oturumlar",
  ...storyDoc("Hesap ekranında ayar bölümleri ve iç içe oturum kartları. Bildirim anahtarları sistemin native Switch kontrolünü kullanır."),
  render: () => <SettingsExample />,
};
function SettingsExample() {
  const theme = useTheme();
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  return <Stack><Card title="Bildirim tercihleri" footer="Tercihleriniz otomatik kaydedilir.">
    <View style={{ gap: 16 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}><View style={{ flex: 1 }}><Text style={{ color: theme.color.canvas.foreground, fontWeight: "600" }}>Sipariş güncellemeleri</Text><Text style={{ color: theme.color.canvas.muted, marginTop: 3 }}>Kargo ve teslimat durumu</Text></View><NativeSwitch value={orderAlerts} onValueChange={setOrderAlerts} accessibilityLabel="Sipariş güncellemeleri" /></View>
      <View style={{ height: 1, backgroundColor: theme.color.canvas.border }} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}><View style={{ flex: 1 }}><Text style={{ color: theme.color.canvas.foreground, fontWeight: "600" }}>Hesap güvenliği</Text><Text style={{ color: theme.color.canvas.muted, marginTop: 3 }}>Yeni giriş ve parola değişikliği</Text></View><NativeSwitch value={securityAlerts} onValueChange={setSecurityAlerts} accessibilityLabel="Hesap güvenliği uyarıları" /></View>
    </View>
  </Card><Card title="Açık oturumlar" extra={<Text style={{ color: theme.color.success.text, fontSize: 12, fontWeight: "600" }}>2 cihaz</Text>}>
    <Stack><Card size="sm" inset bordered={false}><CardMeta avatar={<Laptop size={22} color={theme.color.primary.text} />} title="MacBook Pro" description="İstanbul · Şu an aktif" /></Card><Card size="sm" inset bordered={false}><CardMeta avatar={<Smartphone size={22} color={theme.color.accent.text} />} title="iPhone 16" description="İstanbul · 2 saat önce" /></Card></Stack>
  </Card></Stack>;
}

const projects = [
  { name: "Mobil uygulama v3", Icon: Smartphone, progress: 72, due: "12 Eki", status: "Yolunda", color: "success" as const, team: "DK · AY · EC" },
  { name: "Tasarım sistemi göçü", Icon: Laptop, progress: 45, due: "30 Eki", status: "Risk", color: "warning" as const, team: "AY · MY" },
  { name: "E-ticaret yenilemesi", Icon: ShoppingBag, progress: 28, due: "8 Kas", status: "Başlangıç", color: "info" as const, team: "EC · DK" },
];

export const ProjectCards: Story = {
  name: "Proje Takibi",
  ...storyDoc("Proje listesinde ilerleme, teslim tarihi, ekip ve satır başına düzenle/paylaş eylemleri. İşlemler kartı açmaktan bağımsız kalır."),
  render: () => <ProjectExample />,
};
function ProjectExample() {
  const theme = useTheme();
  const [notice, setNotice] = useState("");
  return <Stack>{projects.map(({ name, Icon, progress, due, status, color, team }) => <Card key={name} title={name} extra={<Text style={{ color: theme.color[color].text, fontSize: 12, fontWeight: "600" }}>{status}</Text>} actions={[
    <Button key="edit" size="sm" variant="ghost" color="neutral" icon={<Pencil size={16} />} accessibilityLabel={`${name} düzenle`} onPress={() => setNotice(`${name} düzenleme için açıldı`)} />,
    <Button key="share" size="sm" variant="ghost" color="neutral" icon={<Share2 size={16} />} accessibilityLabel={`${name} paylaş`} onPress={() => setNotice(`${name} paylaşım bağlantısı hazır`)} />,
  ]}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}><Icon size={18} color={theme.color.canvas.muted} /><Text style={{ flex: 1, color: theme.color.canvas.muted }}>İlerleme</Text><Text style={{ color: theme.color.canvas.foreground, fontWeight: "600" }}>%{progress}</Text></View>
    <View accessibilityRole="progressbar" accessibilityLabel={`${name} ilerlemesi`} accessibilityValue={{ min: 0, max: 100, now: progress }} style={{ height: 6, borderRadius: 3, marginTop: 8, overflow: "hidden", backgroundColor: theme.color.canvas.surfaceAlt }}><View style={{ width: `${progress}%`, height: 6, backgroundColor: theme.color.primary.solid }} /></View>
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}><Text style={{ color: theme.color.canvas.muted, fontSize: 12 }}>Ekip  {team}</Text><Text style={{ color: theme.color.canvas.muted, fontSize: 12 }}>Teslim · {due}</Text></View>
  </Card>)}{notice ? <Text accessibilityRole="status" style={{ color: theme.color.canvas.muted }}>{notice}</Text> : null}</Stack>;
}
function OrderExample() {
  const [message, setMessage] = useState("Tahmini teslimat: 6 Ekim");
  return <Stack><Card title="Sipariş #4821" extra="3 Eki" footer={message} actions={[
    <Button key="track" size="sm" variant="ghost" onPress={() => setMessage("Kargonuz dağıtım merkezinde")}>Takip</Button>,
    <Button key="help" size="sm" variant="ghost" onPress={() => setMessage("Destek talebi açıldı")}>Destek</Button>,
  ]}>2 ürün · ₺1.284,50 · Kargoda</Card></Stack>;
}

export const Profile: Story = {
  name: "Profil ve Kapak",
  ...storyDoc("CardMeta ve ölçülü kapak; başlık uzunsa ek alanı itmez.", `<Card cover={<View style={{ height: 120 }} />}><CardMeta avatar={<Text>DK</Text>} title="Deniz Kaya" description="Ürün tasarımcısı" /></Card>`),
  render: () => <ProfileExample />,
};
function ProfileExample() {
  const theme = useTheme();
  return <Stack><Card cover={<View style={{ height: 120, backgroundColor: theme.color.primary.subtle }} />} title="Tasarım ekibinin paylaşılan çalışma alanı" extra="3 kişi">
    <CardMeta avatar={<View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: theme.color.primary.subtle }}><Text style={{ color: theme.color.primary.subtleContrast }}>DK</Text></View>} title="Deniz Kaya" description="Ürün tasarımcısı · Mobil deneyimler ve erişilebilir arayüzler." />
  </Card></Stack>;
}

export const Pressable: Story = {
  name: "Dokunulabilir",
  ...storyDoc("onPress tek başına çalışır; hoverable=false yalnız geri bildirimi kapatır. Devre dışı kart tetiklenmez.", `<Card onPress={openProfile} accessibilityLabel="Profil ayarlarını aç" title="Profil">Ad ve e-posta</Card>`),
  render: () => <PressExample />,
};
function PressExample() {
  const [count, setCount] = useState(0);
  return <Stack>
    <Card onPress={() => setCount((value) => value + 1)} title="Profil ayarları" accessibilityLabel="Profil ayarlarını aç" accessibilityHint="Profil bilgilerini düzenler">{`Dokunma sayısı: ${count}`}</Card>
    <Card hoverable={false} onPress={() => setCount((value) => value + 1)} title="Geri bildirimsiz">Dokunma çalışır, yüzey değişmez.</Card>
    <Card disabled onPress={() => setCount((value) => value + 1)} title="Devre dışı">Bu kart işlem yapmaz.</Card>
  </Stack>;
}

export const Sizes: Story = {
  name: "Boyutlar ve Gömülü",
  ...storyDoc("Web'den bağımsız native ölçek: 12/16/20 dolgu ve 14/16/17 yazı. Gömülü yüzey temadan gelir.", `<Card size="sm" title="Bildirimler">Kompakt</Card>\n<Card size="md" inset title="Tercihler">Varsayılan</Card>`),
  render: () => <Stack>{(["sm", "md", "lg"] as const).map((size) => <Card key={size} size={size} title={`${size} · Bildirimler`} extra="Açık" footer="Tercihlerinizi istediğiniz zaman değiştirebilirsiniz.">Siparişler ve hesap güvenliği hakkında bildirim alın.</Card>)}<Card inset bordered={false} title="Gömülü kart">Kenarlık ve tonlu zemin korunur.</Card></Stack>,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Card skeleton={isLoading} title="Sipariş" cover={<Cover />} actions={[<Button>Detay</Button>]}><CardMeta title="Ürün" description="Açıklama" /></Card>`),
  render: () => <SkeletonDemo>{(skeleton) => <Stack>
    <Card skeleton={skeleton} title="Sipariş #4821" extra="3 Eki" footer="Tahmini teslimat: 6 Ekim" cover={<View style={{ height: 96 }} />} actions={[<Button key="detail" size="sm" variant="ghost">Detay</Button>, <Button key="help" size="sm" variant="ghost">Destek</Button>]}>
      <CardMeta title="Günlük kullanım çantası" description="Uzun açıklama ve çok satırlı içerik yüklenirken de aynı alanı kaplar. İskelet ile yüklü hal arasında kart yüksekliği değişmez." />
    </Card>
    <Card skeleton={skeleton} onPress={() => undefined} title="Dokunulabilir iskelet">Yüklenirken kart erişilebilirlik ağacından ve dokunmadan çıkar.</Card>
  </Stack>}</SkeletonDemo>,
};
