import React, { useEffect, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { QRCode, type QRStatus } from "./QRCode";
import { Button } from "../Button";
import { Segmented } from "../Segmented";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Row, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof QRCode> = {
  title: "Native/Veri Gösterimi/QRCode",
  component: QRCode,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "QR kod: bağlantı, Wi-Fi, bilet, ödeme. Nokta stilleri, köşe şekilleri, gradyan, ortada logo; durum katmanı (hazırlanıyor / süresi doldu + Yenile / tarandı). Türkçe içerik UTF-8 doğru kodlanır.",
    whenToUse: ["Bilet, rezervasyon, ödeme ya da giriş kodu göstermek.", "Bir bağlantıyı / Wi-Fi bilgisini başka cihaza aktarmak."],
    whenNotToUse: ["QR okutmak (kamera) — native-modules / ScannerOverlay.", "İçeriği yalnız görsel olarak vermek — görme engelli kullanıcı için metnini de yazın."],
    vsWeb: "Model ve çizim web QRCode ile aynı (`qrcode-generator` + aynı SVG yolları), çizim `react-native-svg`. `size` sayı (pt, varsayılan 160); `icon` URL ya da `require(...)`; `aria-label` → `accessibilityLabel`. Varsayılan renkler her temada koyu-üstü-açık (bazı okuyucular ters QR'ı çözemez). İndirme yok — paylaşmak için uygulamada `react-native-view-shot` kullanın.",
  }) } } },
  argTypes: {
    value: { control: "text" },
    size: { control: "number" },
    errorLevel: { control: "select", options: ["L", "M", "Q", "H"] },
    dotType: { control: "select", options: ["square", "rounded", "dots", "extra-rounded"] },
    cornerSquareType: { control: "select", options: ["square", "extra-rounded", "dot"] },
    cornerDotType: { control: "select", options: ["square", "dot", "heart"] },
    status: { control: "select", options: ["active", "loading", "expired", "scanned"] },
    bordered: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { value: "https://mari-ui.com", size: 160, dotType: "square", cornerSquareType: "square", cornerDotType: "square", status: "active", bordered: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof QRCode>;

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args) => <QRCode {...args} />,
};

export const Ticket: Story = {
  name: "Etkinlik Bileti",
  ...storyDoc("Bilet ekranı: kod büyük, altında içeriği metin olarak (görme engelli kullanıcı ve okutulamazsa elle giriş için).", `<QRCode value={ticket.code} size={220} accessibilityLabel="Bilet kodu" />
<Text>{ticket.code}</Text>`),
  render: () => (
    <View style={{ alignItems: "center", gap: 10 }}>
      <Text weight="semibold">mari-ui Konferansı · 24 Ekim</Text>
      <QRCode value="MARI-24-B12-48213" size={220} accessibilityLabel="Bilet kodu MARI-24-B12-48213" />
      <Text muted style={{ fontVariant: ["tabular-nums"] }}>MARI-24-B12-48213 · Salon B · Koltuk 12</Text>
    </View>
  ),
};

function LoginDemo() {
  const [status, setStatus] = useState<QRStatus>("loading");
  // Hazırlanıyor → aktif → (10 sn) süresi doldu; Yenile baştan başlatır.
  useEffect(() => {
    if (status === "loading") {
      const t = setTimeout(() => setStatus("active"), 1200);
      return () => clearTimeout(t);
    }
    if (status === "active") {
      const t = setTimeout(() => setStatus("expired"), 10000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [status]);
  return (
    <Stack>
      <Text muted>Bilgisayardaki mari-ui'ya giriş için kodu telefonunuzla okutun.</Text>
      <QRCode value={`https://mari-ui.com/login?token=${status}`} status={status} onRefresh={() => setStatus("loading")} accessibilityLabel="Giriş kodu" />
      <Row>
        <Button size="sm" variant="outline" onPress={() => setStatus("scanned")} disabled={status !== "active"}>Tarandı say</Button>
        <Button size="sm" variant="ghost" onPress={() => setStatus("loading")}>Baştan</Button>
      </Row>
    </Stack>
  );
}

export const Login: Story = {
  name: "QR ile Giriş (status)",
  ...storyDoc("`status`: hazırlanıyor → aktif → süresi doldu (\"Yenile\" → `onRefresh`) ya da tarandı (telefondan onay bekleniyor). Katman ekran okuyucuya duyurulur.", `<QRCode value={loginUrl} status={status} onRefresh={renewToken} />`),
  render: () => <LoginDemo />,
};

export const Wifi: Story = {
  name: "Wi-Fi Paylaşımı (Türkçe karakter)",
  ...storyDoc("Wi-Fi biçimi: `WIFI:T:WPA;S:<ağ>;P:<şifre>;;`. \"Çalışma Odası\" gibi Türkçe adlar UTF-8 doğru kodlanır (kütüphanenin varsayılanı \"ş\"yi bozuyordu).", `<QRCode value="WIFI:T:WPA;S:Çalışma Odası;P:güvenli-şifre;;" />`),
  render: () => (
    <View style={{ alignItems: "flex-start", gap: 8 }}>
      <QRCode value="WIFI:T:WPA;S:Çalışma Odası;P:güvenli-şifre;;" dotType="rounded" cornerSquareType="extra-rounded" accessibilityLabel="Wi-Fi: Çalışma Odası" />
      <Text muted>Ağ: Çalışma Odası · Şifre: güvenli-şifre</Text>
    </View>
  ),
};

const STYLES = [
  { value: "rounded", label: "Yuvarlak" },
  { value: "dots", label: "Nokta" },
  { value: "gradient", label: "Gradyan" },
  { value: "logo", label: "Logo" },
] as const;

function StylesDemo() {
  const [style, setStyle] = useState<(typeof STYLES)[number]["value"]>("rounded");
  return (
    <Stack>
      <Segmented size="sm" accessibilityLabel="QR stili" options={STYLES.map((s) => ({ value: s.value, label: s.label }))} value={style} onChange={(v) => setStyle(v as typeof style)} />
      {style === "rounded" ? <QRCode value="https://mari-ui.com" dotType="rounded" cornerSquareType="extra-rounded" cornerDotType="dot" /> : null}
      {style === "dots" ? <QRCode value="https://mari-ui.com" dotType="dots" cornerSquareType="dot" cornerDotType="dot" /> : null}
      {style === "gradient" ? <QRCode value="https://mari-ui.com" dotType="extra-rounded" color="#2f66a3" colorEnd="#6951ce" cornerSquareType="extra-rounded" cornerDotType="heart" /> : null}
      {style === "logo" ? <QRCode value="https://mari-ui.com" icon="https://picsum.photos/seed/mari-logo/96/96" dotType="rounded" /> : null}
    </Stack>
  );
}

export const Styles: Story = {
  name: "Stiller (nokta, köşe, gradyan, logo)",
  ...storyDoc("`dotType`, `cornerSquareType`, `cornerDotType`, `color` + `colorEnd` (gradyan), `icon` (logo → hata düzeyi kendiliğinden H). Okunabilirlik web'de jsQR ile doğrulanmış stillerle sınırlı.", `<QRCode value={url} dotType="dots" cornerSquareType="dot" />
<QRCode value={url} color="#2f66a3" colorEnd="#6951ce" />
<QRCode value={url} icon={logoUrl} />`),
  render: () => <StylesDemo />,
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Kod kendi boyutunda kare yer tutucu.", `<QRCode skeleton={isLoading} value={code} />`),
  render: () => <SkeletonDemo>{(skeleton) => <QRCode skeleton={skeleton} value="https://mari-ui.com" />}</SkeletonDemo>,
};
