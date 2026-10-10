import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Bell, CreditCard, MessageSquare, Plug, Shield, Star, User } from "lucide-react-native";
import { Tabs, TabsContent, TabsList, TabsTrigger, type TabsProps } from "./Tabs";
import { Button } from "../Button";
import { Field } from "../Field";
import { Input } from "../Input";
import { Rate } from "../Rate";
import { Switch } from "../Switch";
import { Tag } from "../Tag";
import { Text, Title } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Tabs> = {
  title: "Native/Navigasyon/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  // İlk dekoratör en içte: story tam genişlik, tema onun dışında.
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Aynı bağlamdaki içerik bölümleri arasında geçiş. `Tabs` + `TabsList` + `TabsTrigger` + `TabsContent`; üç görünüm (`line`, `card`, `pills`), ikon, sayı rozeti, `extra`, `fill`, dikey.",
    whenToUse: ["Bir kaydın farklı yüzleri (Profil / Bildirimler / Güvenlik).", "Ürün detayında Açıklama / Özellikler / Yorumlar."],
    whenNotToUse: ["Uygulamanın ana gezinmesi — alt sekme çubuğu (expo-router / React Navigation).", "Sıralı adımlar — Steps.", "2–5 kısa seçenekle görünüm değiştirmek — Segmented."],
    vsWeb: "API aynı (`className` → `style`, `aria-label` → `accessibilityLabel`). Taşan sekmeler yatay kayar, aktif sekme görünür alana kaydırılır. Gösterge kayarak geçer (hareket azaltmada anlık). Dikey Tabs `responsive` (640) altında yataya döner — telefonda hep; dikey görmek için `responsive={false}`. Ok tuşu yok → `activationMode` yok sayılır. `icon` fonksiyon olabilir: `({ active, color }) => <User color={color} />` (RN'de `currentColor` yok). Ölçüler `nativeConfig.tabs`.",
  }) } } },
  argTypes: {
    variant: { control: "select", options: ["line", "card", "pills"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    color: { control: "select", options: ["primary", "accent", "success", "error", "warning", "info", "neutral"] },
    fill: { control: "boolean" },
    align: { control: "select", options: ["start", "center"] },
    keepMounted: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { defaultActiveTab: "aciklama", variant: "line", size: "md", color: "primary", fill: false, align: "start", keepMounted: false, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Tabs>;

function ProductTabs(props: Omit<TabsProps, "children">) {
  return (
    <Tabs {...props}>
      <TabsList accessibilityLabel="Ürün bilgileri">
        <TabsTrigger value="aciklama">Açıklama</TabsTrigger>
        <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
        <TabsTrigger value="yorumlar" count={128}>Yorumlar</TabsTrigger>
      </TabsList>
      <TabsContent value="aciklama">Hibrit aktif gürültü engelleme ve 32 saat pil ömrüyle gün boyu kesintisiz müzik.</TabsContent>
      <TabsContent value="ozellikler">40 mm dinamik sürücü · Bluetooth 5.3 · 254 g</TabsContent>
      <TabsContent value="yorumlar">Ortalama 4,6 / 5 (128 değerlendirme)</TabsContent>
    </Tabs>
  );
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args) => <ProductTabs {...args} />,
};

const icon = (Icon: typeof User) => ({ color }: { color: string }) => <Icon size={16} color={color} />;

function SettingRow({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text weight="medium">{title}</Text>
        <Text muted style={{ fontSize: 13, lineHeight: 18 }}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

function AccountDemo() {
  const [prefs, setPrefs] = useState({ comments: true, mentions: true, weekly: false });
  const toggle = (key: keyof typeof prefs) => (value: boolean) => setPrefs((p) => ({ ...p, [key]: value }));
  return (
    <View style={{ gap: 16 }}>
      <Tabs defaultActiveTab="profile" keepMounted>
        <TabsList accessibilityLabel="Hesap ayarları">
          <TabsTrigger value="profile" icon={icon(User)}>Profil</TabsTrigger>
          <TabsTrigger value="notifications" icon={icon(Bell)}>Bildirimler</TabsTrigger>
          <TabsTrigger value="security" icon={icon(Shield)}>Güvenlik</TabsTrigger>
          <TabsTrigger value="billing" icon={icon(CreditCard)}>Faturalama</TabsTrigger>
          <TabsTrigger value="integrations" icon={icon(Plug)}>Entegrasyonlar</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <View style={{ gap: 12 }}>
            <Field label="Ad">
              <Input defaultValue="Deniz" />
            </Field>
            <Field label="E-posta" hint="Değiştirirseniz doğrulama e-postası gönderilir.">
              <Input type="email" defaultValue="deniz@mari-ui.com" />
            </Field>
          </View>
        </TabsContent>
        <TabsContent value="notifications">
          <SettingRow title="Yorumlar" description="Görevlerinize yorum yapıldığında bildir.">
            <Switch checked={prefs.comments} onChange={toggle("comments")} accessibilityLabel="Yorum bildirimleri" />
          </SettingRow>
          <SettingRow title="Bahsedilmeler" description="Biri sizi @ ile andığında.">
            <Switch checked={prefs.mentions} onChange={toggle("mentions")} accessibilityLabel="Bahsedilme bildirimleri" />
          </SettingRow>
          <SettingRow title="Haftalık özet" description="Her pazartesi ekibin ilerlemesi.">
            <Switch checked={prefs.weekly} onChange={toggle("weekly")} accessibilityLabel="Haftalık özet" />
          </SettingRow>
        </TabsContent>
        <TabsContent value="security">
          <View style={{ gap: 12 }}>
            <Field label="Yeni şifre" hint="En az 12 karakter.">
              <Input type="password" />
            </Field>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text weight="medium">İki adımlı doğrulama</Text>
              <Tag color="success">Açık</Tag>
            </View>
          </View>
        </TabsContent>
        <TabsContent value="billing">Ekip planı · aylık · sonraki fatura 1 Ekim · 1.192,00 ₺</TabsContent>
        <TabsContent value="integrations">Henüz bağlı bir entegrasyon yok.</TabsContent>
      </Tabs>
      <Button block>Kaydet</Button>
    </View>
  );
}

export const AccountSettings: Story = {
  name: "Hesap Ayarları",
  ...storyDoc(
    "İkonlu çizgili sekmeler ve `keepMounted` — sekmeler arasında gezinince yazdıklarınız kaybolmaz. Telefonda beş sekme sığmaz: şerit yatay kayar, aktif sekme görünür alana kaydırılır. Kaydet düğmesi şeritte değil, formun altında.",
    `<Tabs defaultActiveTab="profile" keepMounted>
  <TabsList accessibilityLabel="Hesap ayarları">
    <TabsTrigger value="profile" icon={({ color }) => <User size={16} color={color} />}>Profil</TabsTrigger>
    <TabsTrigger value="notifications" icon={({ color }) => <Bell size={16} color={color} />}>Bildirimler</TabsTrigger>
    …
  </TabsList>
  <TabsContent value="profile">…</TabsContent>
  …
</Tabs>`
  ),
  render: () => <AccountDemo />,
};

const REVIEWS = [
  { name: "Selin A.", rating: 5, text: "Gürültü engelleme metroda bile çok başarılı." },
  { name: "Mert Y.", rating: 4, text: "Ses çok iyi, kılıf biraz daha küçük olabilirdi." },
];

export const ProductDetail: Story = {
  name: "Ürün Detayı",
  ...storyDoc("`count` sekmenin yanında sayı rozeti; panel içeriği istediğiniz şey olabilir.", `<TabsTrigger value="yorumlar" count={128} icon={({ color }) => <MessageSquare size={16} color={color} />}>Yorumlar</TabsTrigger>`),
  render: () => (
    <Tabs defaultActiveTab="yorumlar">
      <TabsList accessibilityLabel="Ürün bilgileri">
        <TabsTrigger value="aciklama">Açıklama</TabsTrigger>
        <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
        <TabsTrigger value="yorumlar" count={128} icon={icon(MessageSquare)}>Yorumlar</TabsTrigger>
      </TabsList>
      <TabsContent value="aciklama">Hibrit aktif gürültü engelleme ve 32 saat pil ömrü.</TabsContent>
      <TabsContent value="ozellikler">40 mm dinamik sürücü · Bluetooth 5.3 · 254 g</TabsContent>
      <TabsContent value="yorumlar">
        <View style={{ gap: 12 }}>
          {REVIEWS.map((r) => (
            <View key={r.name} style={{ gap: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text weight="medium">{r.name}</Text>
                <Rate readOnly value={r.rating} characterSize={14} accessibilityLabel="Puan" />
              </View>
              <Text muted>{r.text}</Text>
            </View>
          ))}
        </View>
      </TabsContent>
    </Tabs>
  ),
};

function TasksDemo() {
  const [tab, setTab] = useState("todo");
  return (
    <Tabs activeTab={tab} onChange={setTab} variant="pills" fill>
      <TabsList accessibilityLabel="Görev durumu">
        <TabsTrigger value="todo" count={5}>Yapılacak</TabsTrigger>
        <TabsTrigger value="doing" count={2}>Sürüyor</TabsTrigger>
        <TabsTrigger value="done">Bitti</TabsTrigger>
      </TabsList>
      <TabsContent value="todo">Sprint planlaması · Ödeme ekranı metinleri · Bildirim izni akışı · …</TabsContent>
      <TabsContent value="doing">Tema yapıcı dışa aktarma · Native Tabs</TabsContent>
      <TabsContent value="done">Toast · BottomSheet · Steps</TabsContent>
    </Tabs>
  );
}

export const Pills: Story = {
  name: "Görev Takibi (Pills)",
  ...storyDoc("`pills` + `fill`: telefonda segmented kontrol gibi tam genişlik; zemin seçilene kayar.", `<Tabs activeTab={tab} onChange={setTab} variant="pills" fill>
  <TabsList accessibilityLabel="Görev durumu">
    <TabsTrigger value="todo" count={5}>Yapılacak</TabsTrigger>
    …
  </TabsList>
</Tabs>`),
  render: () => <TasksDemo />,
};

export const CardTabs: Story = {
  name: "Kod Paneli (Card)",
  ...storyDoc("`card`: aktif sekme içerik yüzeyiyle birleşir.", `<Tabs variant="card" defaultActiveTab="tsx">…</Tabs>`),
  render: () => (
    <Tabs variant="card" defaultActiveTab="tsx">
      <TabsList accessibilityLabel="Kod dili">
        <TabsTrigger value="tsx">React</TabsTrigger>
        <TabsTrigger value="native">React Native</TabsTrigger>
        <TabsTrigger value="cli">CLI</TabsTrigger>
      </TabsList>
      <TabsContent value="tsx">{`import { Button } from "@mari-ui/components";`}</TabsContent>
      <TabsContent value="native">{`import { Button } from "@mari-ui/native";`}</TabsContent>
      <TabsContent value="cli">npx mari-ui init</TabsContent>
    </Tabs>
  ),
};

export const Vertical: Story = {
  name: "Dikey (Ekip Ayarları)",
  ...storyDoc(
    "`orientation=\"vertical\"`: sekmeler solda. Varsayılan `responsive={640}` telefonda yataya çevirir (üstteki); `responsive={false}` dikeyde tutar (alttaki — dar ekranda yalnız kısa etiketlerle).",
    `<Tabs orientation="vertical" defaultActiveTab="members">…</Tabs>
<Tabs orientation="vertical" responsive={false} defaultActiveTab="members">…</Tabs>`
  ),
  render: () => (
    <View style={{ gap: 32 }}>
      {[640, false as const].map((responsive) => (
        <Tabs key={String(responsive)} orientation="vertical" responsive={responsive} defaultActiveTab="members">
          <TabsList accessibilityLabel="Ekip ayarları">
            <TabsTrigger value="members">Üyeler</TabsTrigger>
            <TabsTrigger value="roles">Roller</TabsTrigger>
            <TabsTrigger value="audit">Kayıtlar</TabsTrigger>
          </TabsList>
          <TabsContent value="members">Deniz Kaya · Aykut Yılmaz · Elif Can</TabsContent>
          <TabsContent value="roles">Yönetici · Geliştirici · Tasarımcı</TabsContent>
          <TabsContent value="audit">Son 30 günde 12 değişiklik.</TabsContent>
        </Tabs>
      ))}
    </View>
  ),
};

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];

export const Overflow: Story = {
  name: "Taşan Sekmeler",
  ...storyDoc("Sığmayan sekmeler yatay kayar; seçilen sekme görünür alana kaydırılır.", `<TabsList>{months.map((m) => <TabsTrigger key={m} value={m}>{m}</TabsTrigger>)}</TabsList>`),
  render: () => (
    <Tabs defaultActiveTab="Ekim">
      <TabsList accessibilityLabel="Ay">
        {MONTHS.map((m) => (
          <TabsTrigger key={m} value={m}>{m}</TabsTrigger>
        ))}
      </TabsList>
      {MONTHS.map((m) => (
        <TabsContent key={m} value={m}>{`${m} raporu`}</TabsContent>
      ))}
    </Tabs>
  ),
};

export const FillAndCenter: Story = {
  name: "Tam Genişlik ve Ortalı",
  ...storyDoc("`fill`: sekmeler genişliği eşit paylaşır. `align=\"center\"`: ortalı.", `<Tabs fill …>…</Tabs>
<Tabs align="center" …>…</Tabs>`),
  render: () => (
    <View style={{ gap: 24 }}>
      <ProductTabs fill defaultActiveTab="aciklama" />
      <ProductTabs align="center" defaultActiveTab="ozellikler" />
    </View>
  ),
};

export const Variants: Story = {
  name: "Görünüm: line / card / pills",
  ...storyDoc("Üç görünüm aynı içerikle.", `<Tabs variant="line" />  <Tabs variant="card" />  <Tabs variant="pills" />`),
  render: () => (
    <View style={{ gap: 24 }}>
      {(["line", "card", "pills"] as const).map((variant) => (
        <ProductTabs key={variant} variant={variant} defaultActiveTab="ozellikler" />
      ))}
    </View>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc("Sekme yüksekliği sm 36 · md 44 · lg 48.", `<Tabs size="sm" />  <Tabs size="lg" />`),
  render: () => (
    <View style={{ gap: 24 }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <ProductTabs key={size} size={size} defaultActiveTab="aciklama" />
      ))}
    </View>
  ),
};

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("`color`: aktif sekme metni ve göstergesi.", `<Tabs color="success" />`),
  render: () => (
    <View style={{ gap: 20 }}>
      {(["primary", "accent", "success", "info", "neutral"] as const).map((color) => (
        <Tabs key={color} color={color} defaultActiveTab="b">
          <TabsList accessibilityLabel={color}>
            <TabsTrigger value="a">Genel</TabsTrigger>
            <TabsTrigger value="b" icon={icon(Star)}>{color}</TabsTrigger>
            <TabsTrigger value="c">Arşiv</TabsTrigger>
          </TabsList>
        </Tabs>
      ))}
    </View>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Sekme etiketleri kendi metin kutularında, aktif panel kendi şeklinde; gösterge gizli, sekmeler dokunulamaz.", `<Tabs skeleton={isLoading} defaultActiveTab="aciklama">…</Tabs>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ gap: 8 }}>
          <Title level={5}>Kablosuz Kulaklık Pro</Title>
          <ProductTabs skeleton={skeleton} defaultActiveTab="aciklama" />
        </View>
      )}
    </SkeletonDemo>
  ),
};
