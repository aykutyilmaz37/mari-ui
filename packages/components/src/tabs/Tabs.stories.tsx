/**
 * Storybook CSF3'te `render` obje property'si Storybook tarafından gerçek
 * bir React function component GİBİ çağrılır (hook kuralları geçerlidir) —
 * ama `eslint-plugin-react-hooks`ın adlandırma sezgisi obje property'lerini
 * component olarak TANIMIYOR, yanlış pozitif üretiyor. `render`i ayrı, büyük
 * harfli bir component'e çıkarmak yerine (bkz. Faz 13.5 kullanıcı bulgusu:
 * Storybook'un "Show code" paneli o zaman `<HelperComponent />` gibi anlamsız
 * bir referans gösteriyordu, gerçek kullanım kodunu değil) bilinçli olarak
 * devre dışı bırakılıyor.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { BellIcon, CreditCardIcon, ShieldIcon, UserIcon } from "lucide-react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Tabs } from "./Tabs";
import { TabsList } from "./_components/TabsList";
import { TabsTrigger } from "./_components/TabsTrigger";
import { TabsContent } from "./_components/TabsContent";
import { Switch } from "../switch";
import { Input } from "../input";

/** Not: bu dosya eskiden legacy CSF2 formatındaydı (default export objesi,
 * bare fonksiyon export'ları, Meta/StoryObj tipi yok) — tek istisnaydı,
 * diğer 33 story dosyası CSF3 kullanıyordu. Faz 4'ün tam standardizasyonu
 * beklemeden burada CSF3'e taşındı. */
const meta: Meta<typeof Tabs> = {
  title: "Navigasyon/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Compound-component deseninde sekmeli gezinme: `<Tabs><TabsList><TabsTrigger/></TabsList>" +
            "<TabsContent/></Tabs>`. `TabsList`/`TabsTrigger`'a `cardTabs` verilirse kart görünümlü (arka planlı, " +
            "birbirinden ayrık) sekmeler render edilir; verilmezse klasik alt-çizgili sekme görünümü kullanılır.",
          whenToUse: ["Aynı sayfa/panel içinde birbirini dışlayan birkaç görünüm arasında geçiş yapmak için (örn. ayarlar sayfası bölümleri, ürün detayı sekmeleri)."],
          a11y:
            "`TabsList` `role=\"tablist\"`, her `TabsTrigger` `role=\"tab\"` + `aria-selected` taşır ve karşılık gelen " +
            "`TabsContent` `role=\"tabpanel\"` ile `aria-labelledby` üzerinden eşlenir (Faz 13.5'te eklendi — eskiden " +
            "hiçbir ARIA sekme semantiği yoktu, ekran okuyucu için düz bir düğme listesi gibi görünüyordu). Her " +
            "tetikleyici gerçek bir `<button>` olduğundan Tab ile tek tek erişilebilir.",
        }),
      },
    },
  },
  argTypes: {
    color: colorArgType,
    defaultActiveTab: { control: "text", description: "Uncontrolled başlangıçta aktif olacak sekmenin `value`'su." },
  },
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  name: "Varsayılan",
  ...storyDoc("Klasik alt-çizgili sekme görünümü."),
  render: () => (
    <Tabs defaultActiveTab="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Sekme 1</TabsTrigger>
        <TabsTrigger value="tab2">Sekme 2</TabsTrigger>
        <TabsTrigger value="tab3">Sekme 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Sekme 1 içeriği</TabsContent>
      <TabsContent value="tab2">Sekme 2 içeriği</TabsContent>
      <TabsContent value="tab3">Sekme 3 içeriği</TabsContent>
    </Tabs>
  ),
};

export const CardTabs: Story = {
  name: "Kart Görünümlü",
  ...storyDoc("`cardTabs` ile arka planlı, birbirinden ayrık sekmeler."),
  render: () => (
    <Tabs defaultActiveTab="tab1" color="accent">
      <TabsList cardTabs>
        <TabsTrigger value="tab1" cardTabs>
          Sekme 1
        </TabsTrigger>
        <TabsTrigger value="tab2" cardTabs>
          Sekme 2
        </TabsTrigger>
        <TabsTrigger value="tab3" cardTabs>
          Sekme 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Sekme 1 içeriği</TabsContent>
      <TabsContent value="tab2">Sekme 2 içeriği</TabsContent>
      <TabsContent value="tab3">Sekme 3 içeriği</TabsContent>
    </Tabs>
  ),
};

export const SettingsPage: Story = {
  name: "Gerçek Kullanım (Ayarlar Sayfası)",
  ...storyDoc("Gerçek bir kullanım örneği: her sekmede gerçek form içeriği olan bir ayarlar sayfası."),
  render: () => {
    const [notifyEmail, setNotifyEmail] = useState(true);
    const [notifySms, setNotifySms] = useState(false);
    return (
      <div className="w-full max-w-lg rounded-xl border border-mari-border p-6">
        <Tabs defaultActiveTab="profile">
          <TabsList>
            <TabsTrigger value="profile">
              <UserIcon size={16} /> Profil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <BellIcon size={16} /> Bildirimler
            </TabsTrigger>
            <TabsTrigger value="security">
              <ShieldIcon size={16} /> Güvenlik
            </TabsTrigger>
            <TabsTrigger value="billing">
              <CreditCardIcon size={16} /> Faturalama
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor="settings-name">Ad Soyad</label>
                <Input id="settings-name" defaultValue="Aykut Yılmaz" />
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor="settings-email">E-posta</label>
                <Input id="settings-email" defaultValue="aykut@example.com" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="flex flex-col gap-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">E-posta bildirimleri</span>
                <Switch checked={notifyEmail} onChange={setNotifyEmail} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SMS bildirimleri</span>
                <Switch checked={notifySms} onChange={setNotifySms} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor="settings-current-password">Mevcut Şifre</label>
                <Input id="settings-current-password" type="password" />
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <label htmlFor="settings-new-password">Yeni Şifre</label>
                <Input id="settings-new-password" type="password" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing">
            <p className="pt-4 text-sm text-mari-muted">Kayıtlı ödeme yöntemi bulunmuyor.</p>
          </TabsContent>
        </Tabs>
      </div>
    );
  },
};
