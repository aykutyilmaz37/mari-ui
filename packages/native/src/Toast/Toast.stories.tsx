import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider, useToast, type ToastOptions } from "./ToastProvider";
import { Button } from "../Button";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { Row, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";

/**
 * Story'de sağlayıcı sabit yükseklikte bir "ekran" içinde: gerçek uygulamada
 * `ToastProvider` kökte `flex: 1` ile ekranı doldurur; kaydırılan story
 * alanında `flex: 1` sınırsız büyürdü (bkz. Card flexGrow dersi).
 */
function withToasts(Story: () => React.ReactElement) {
  return <ToastScreen><Story /></ToastScreen>;
}

function ToastScreen({ children }: Readonly<{ children: React.ReactNode }>) {
  const theme = useTheme();
  return (
    <View style={{ height: 360, alignSelf: "stretch", borderRadius: 16, borderWidth: 1, borderColor: theme.color.canvas.border, overflow: "hidden" }}>
      <ToastProvider insets={{ top: 12, bottom: 12 }}>
        <View style={{ padding: 16, gap: 12 }}>{children}</View>
      </ToastProvider>
    </View>
  );
}

const meta: Meta = {
  title: "Native/Geri Bildirim/Toast",
  tags: ["autodocs"],
  decorators: [withToasts, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Kısa süreli bildirim: bir işlemin sonucu, isteğe bağlı tek eylem (\"Geri al\"). `ToastProvider` + `useToast()`.",
    whenToUse: ["Kaydedildi, kopyalandı, silindi + Geri al.", "Arka planda olan bir şeyin sonucu (bağlantı koptu)."],
    whenNotToUse: ["Kullanıcının karar vermesi gereken durum — Dialog.", "Ekranda kalması gereken bilgi — Alert."],
    vsWeb: "API aynı (`showToast` / `dismiss` / `update`; `action.onClick` → `onPress`). Telefonda konum `top` / `bottom` (web köşe değerleri en yakın kenara eşlenir), varsayılan alt. Parmak üstündeyken sayaç durur (web: üzerine gelince); yana kaydırınca kapanır. Ekran okuyucu açıkken eylemli Toast kendiliğinden kapanmaz; iOS'ta `announceForAccessibility` ile duyurulur. RN `Modal` değil — açık bir pencerenin altında kalır. Kenar başına en fazla 3.",
  }) } } },
};
export default meta;
type Story = StoryObj;

function Show({ label, options, variant }: Readonly<{ label: string; options: ToastOptions; variant?: "outline" | "solid" }>) {
  const { showToast } = useToast();
  return <Button size="sm" variant={variant ?? "outline"} onPress={() => showToast(options)}>{label}</Button>;
}

export const Playground: Story = {
  ...storyDoc("Tip, konum ve eylemli Toast'u deneyin.", `const { showToast } = useToast();
showToast({ type: "success", title: "Değişiklikler kaydedildi" });`),
  render: () => (
    <Row>
      <Show variant="solid" label="Göster" options={{ type: "success", title: "Değişiklikler kaydedildi", description: "Ekip güncel sürümü görüyor." }} />
      <Show label="Üstte" options={{ type: "info", title: "Yeni sürüm hazır", position: "top" }} />
    </Row>
  ),
};

function UndoDemo() {
  const { showToast } = useToast();
  const [files, setFiles] = useState(12);
  return (
    <Stack>
      <Text>{`Klasörde ${files} dosya`}</Text>
      <Button
        size="sm"
        disabled={files < 3}
        onPress={() => {
          setFiles((n) => n - 3);
          showToast({ title: "3 dosya çöp kutusuna taşındı", action: { label: "Geri al", onPress: () => setFiles((n) => n + 3) } });
        }}
      >
        3 dosyayı sil
      </Button>
    </Stack>
  );
}

export const Undo: Story = {
  name: "Silme + Geri Al",
  ...storyDoc("Eylemli Toast 8 sn kalır (ekran okuyucu açıkken kapanmaz); \"Geri al\" işlemi geri çevirir.", `showToast({
  title: "3 dosya çöp kutusuna taşındı",
  action: { label: "Geri al", onPress: restore },
});`),
  render: () => <UndoDemo />,
};

export const Scenarios: Story = {
  name: "Durum Senaryoları",
  ...storyDoc("Başarı, hata (hemen duyurulur), kalıcı uyarı (`duration: 0`).", `showToast({ type: "error", title: "Ödeme reddedildi", description: "Kartınızın limiti yetersiz." });
showToast({ type: "warning", title: "Bağlantı koptu", duration: 0 });`),
  render: () => (
    <Row>
      <Show label="Kaydedildi" options={{ type: "success", title: "Adres kaydedildi" }} />
      <Show label="Hata" options={{ type: "error", title: "Ödeme reddedildi", description: "Kartınızın limiti yetersiz." }} />
      <Show label="Kalıcı uyarı" options={{ type: "warning", title: "Bağlantı koptu", description: "Değişiklikler çevrimiçi olunca eşitlenecek.", duration: 0 }} />
    </Row>
  ),
};

function SkeletonUpdateDemo() {
  const { showToast, update } = useToast();
  return (
    <Button
      size="sm"
      variant="outline"
      onPress={() => {
        const id = showToast({ type: "info", title: "Dışa aktarma hazırlanıyor", description: "rapor-eylul.csv", skeleton: true, duration: 0 });
        setTimeout(() => update(id, { skeleton: false, title: "Dışa aktarma hazır", description: "rapor-eylul.csv · 1,2 MB", duration: 5000 }), 1500);
      }}
    >
      Dışa aktar
    </Button>
  );
}

export const SkeletonUpdate: Story = {
  name: "İskeletten Veriye (update)",
  ...storyDoc("İskeletle gösterilir, veri gelince `update` ile dolar; o anda duyurulur ve sayaç başlar. (Toast ortak İskelet geçişinden muaf — hali zamanla değişir.)", `const id = showToast({ title: "Hazırlanıyor", skeleton: true, duration: 0 });
update(id, { skeleton: false, title: "Dışa aktarma hazır", duration: 5000 });`),
  render: () => <SkeletonUpdateDemo />,
};
