import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Loading } from "./Loading";
import { Button } from "../Button";
import { Card } from "../Card";
import { Text, Title } from "../Typography";
import { Row, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

const meta: Meta<typeof Loading> = {
  title: "Native/Geri Bildirim/Loading",
  component: Loading,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Süresi belirsiz bekleme göstergesi: satır içi, içeriği sarmalayan ya da tam ekran.",
    whenToUse: ["Bölüm yenilenirken içeriği yerinde tutmak (sarmalama).", "Tüm ekranı engelleyen kısa işlem (tam ekran)."],
    whenNotToUse: ["İçerik henüz hiç yokken — bileşenin `skeleton`'ı.", "Yüzdesi bilinen ilerleme — Progress (ya da `percent`)."],
    vsWeb: "Prop'lar aynı. Belirsiz gösterge platformun kendisi (`ActivityIndicator` — iOS/Android görünümü, HIG). Tam ekran RN `Modal` ile karartmalı katman. Sarmalamada içerik soluklaşır, dokunmaya ve ekran okuyucuya kapanır. İskelet yok (web'de de yok).",
  }) } } },
  argTypes: {
    spinning: { control: "boolean" },
    size: { control: "select", options: ["sm", "md", "lg"] },
    tip: { control: "text" },
    percent: { control: "number" },
    delay: { control: "number" },
  },
  args: { spinning: true, size: "md", tip: "Yükleniyor" },
};
export default meta;
type Story = StoryObj<typeof Loading>;

export const Playground: Story = {
  ...storyDoc("Boyut, açıklama ve yüzdeyi deneyin."),
  render: (args) => <Loading {...args} />,
};

function RefreshCard() {
  const [busy, setBusy] = useState(false);
  const refresh = () => {
    setBusy(true);
    setTimeout(() => setBusy(false), 1500);
  };
  return (
    <View style={{ alignSelf: "stretch", gap: 12 }}>
      <Loading spinning={busy} tip="Güncelleniyor">
        <Card title="Bugünkü satışlar">
          <Title level={2}>₺12.480</Title>
          <Text muted>Dünden %8 fazla</Text>
        </Card>
      </Loading>
      <Button variant="outline" size="sm" onPress={refresh} disabled={busy}>Yenile</Button>
    </View>
  );
}

export const Wrap: Story = {
  name: "Kart Yenileme (Sarmalama)",
  ...storyDoc("İçerik yerinde kalır (düzen kaymaz), soluklaşır; gösterge üstünde.", `<Loading spinning={refreshing} tip="Güncelleniyor">
  <Card title="Bugünkü satışlar">…</Card>
</Loading>`),
  render: () => <RefreshCard />,
};

function FullscreenDemo() {
  const [busy, setBusy] = useState(false);
  return (
    <>
      <Button onPress={() => { setBusy(true); setTimeout(() => setBusy(false), 2000); }}>Hesabı oluştur</Button>
      <Loading fullscreen spinning={busy} size="lg" tip="Hesabınız hazırlanıyor" />
    </>
  );
}

export const Fullscreen: Story = {
  name: "Tam Ekran (Hesap Hazırlanıyor)",
  ...storyDoc("Ekranı kısa süre engelleyen işlem; karartmalı katman.", `<Loading fullscreen spinning={creating} size="lg" tip="Hesabınız hazırlanıyor" />`),
  render: () => <FullscreenDemo />,
};

export const Inline: Story = {
  name: "Satır İçi (Otomatik Kayıt)",
  ...storyDoc("Küçük gösterge + metin, satır içinde.", `<Loading size="sm" tip="Kaydediliyor…" />`),
  render: () => (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", alignSelf: "stretch" }}>
      <Text weight="medium">Taslak</Text>
      <Loading size="sm" tip="Kaydediliyor…" />
    </View>
  ),
};

function DelayDemo() {
  const [busy, setBusy] = useState(false);
  const run = (ms: number) => {
    setBusy(true);
    setTimeout(() => setBusy(false), ms);
  };
  return (
    <View style={{ gap: 12 }}>
      <Row>
        <Button size="sm" variant="outline" onPress={() => run(200)}>Hızlı istek (200 ms)</Button>
        <Button size="sm" variant="outline" onPress={() => run(1500)}>Yavaş istek (1,5 sn)</Button>
      </Row>
      <View style={{ height: 24 }}>
        <Loading spinning={busy} delay={400} size="sm" tip="Yükleniyor" />
      </View>
    </View>
  );
}

export const Delay: Story = {
  name: "Gecikme (Yanıp Sönme Yok)",
  ...storyDoc("`delay={400}`: 400 ms'den kısa işlemlerde gösterge hiç görünmez.", `<Loading spinning={busy} delay={400} size="sm" tip="Yükleniyor" />`),
  render: () => <DelayDemo />,
};

export const Variants: Story = {
  name: "Boyutlar ve Yüzde",
  ...storyDoc("sm/md/lg; `percent` ile dolan halka; renk.", `<Loading size="lg" />
<Loading percent={64} tip="İndiriliyor" color="success" />`),
  render: () => (
    <Stack>
      <Row>
        <Loading size="sm" />
        <Loading />
        <Loading size="lg" />
      </Row>
      <Loading percent={64} tip="İndiriliyor" color="success" />
    </Stack>
  ),
};
