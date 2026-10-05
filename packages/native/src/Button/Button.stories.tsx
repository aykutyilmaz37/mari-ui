/**
 * Web `Genel/Button` story'lerinin native karşılıkları — aynı adlar, aynı
 * senaryolar (web ↔ native ölçümü bu story çiftleri üzerinden yapılır).
 * "Link Olarak" yok: native'de `href` yok (navigasyon router'da).
 */
import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Download, Search, Sparkles, Trash2 } from "lucide-react-native";
import { Button } from "./Button";
import { Row, SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme } from "../stories/storyMeta";
import { useTheme } from "../theme/useTheme";

const COLORS = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
const VARIANTS = ["solid", "outline", "soft", "ghost", "link"] as const;

const meta: Meta<typeof Button> = {
  title: "Native/Genel/Button",
  component: Button,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Aksiyon tetikleyen temel öğe — web `Button` ile aynı renkler, varyantlar ve eksenler (boyutlar native ölçekte): `color`, `variant`, `size`, `shape`, " +
            "`loading` (gecikmeli dahil), `icon`, `block`, `skeleton`.",
          whenToUse: ["Bir eylemi başlatmak: kaydet, gönder, devam et.", "Formun ana eylemi (`block` ile tam genişlik)."],
          whenNotToUse: ["Sayfa geçişi — router'ınızın bağlantısı (expo-router `Link`)."],
          vsWeb:
            "`onClick` → `onPress` (+ `onLongPress`); `href` / `target` yok. Fare yok: basılınca web'in hover + active hali birlikte " +
            "(koyu ton / yumuşak zemin + %98 küçülme). İkona `size` / `color` verilmezse butonunki verilir. Küçük butonların " +
            "dokunma alanı görünüm değişmeden 44px'e tamamlanır (`hitSlop`).",
        }),
      },
    },
  },
  args: { children: "Buton", color: "primary", variant: "solid", size: "md", shape: "default", iconPosition: "start", loading: false, skeleton: false, block: false, disabled: false },
  argTypes: {
    color: { control: "select", options: COLORS },
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: ["xs", "sm", "md", "lg", "xl"] },
    shape: { control: "inline-radio", options: ["default", "pill", "circle", "square"] },
    iconPosition: { control: "inline-radio", options: ["start", "end"] },
    icon: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin. Diğer örnekler tekil senaryoları sabitler."),
};

/** Formun alt çubuğu — mobilde (native'in tek düzeni) web'in dar ekran hali: tam genişlik, birincil en altta. */
function FormActionsDemo() {
  const theme = useTheme();
  return (
    <View style={{ alignSelf: "stretch", flexDirection: "column-reverse", gap: 8, borderTopWidth: 1, borderColor: theme.color.canvas.border, paddingTop: 16 }}>
      <Button variant="ghost" color="error" icon={<Trash2 />} block>
        Taslağı sil
      </Button>
      <Button variant="outline" color="neutral" block>
        Vazgeç
      </Button>
      <Button block>Yayınla</Button>
    </View>
  );
}

export const FormActions: Story = {
  name: "Form Aksiyonları (responsive)",
  ...storyDoc(
    "Bir formun alt çubuğu: tek bir birincil eylem (`solid`), ikincil (`outline`) ve yıkıcı eylem (`ghost` + `error`). Mobilde " +
      "butonlar tam genişliğe yayılır ve birincil eylem başparmağa en yakın yere — en alta — iner (web'in dar ekran hali).",
    `<View style={{ flexDirection: "column-reverse", gap: 8 }}>
  <Button variant="ghost" color="error" icon={<Trash2 />} block>Taslağı sil</Button>
  <Button variant="outline" color="neutral" block>Vazgeç</Button>
  <Button block>Yayınla</Button>
</View>`
  ),
  render: () => <FormActionsDemo />,
};

function DelayedLoadingDemo() {
  const [busy, setBusy] = useState<"fast" | "slow" | null>(null);
  const run = (kind: "fast" | "slow") => {
    setBusy(kind);
    setTimeout(() => setBusy(null), kind === "fast" ? 200 : 2000);
  };
  return (
    <Row>
      <Button loading={busy === "fast" ? { delay: 300 } : false} onPress={() => run("fast")}>
        Hızlı işlem (200ms)
      </Button>
      <Button loading={busy === "slow" ? { delay: 300 } : false} onPress={() => run("slow")} icon={<Download />}>
        Yavaş işlem (2sn)
      </Button>
    </Row>
  );
}

export const DelayedLoading: Story = {
  name: "Gecikmeli Yükleme",
  ...storyDoc(
    "`loading={{ delay: 300 }}`: buton basıldığı an devre dışı olur ama gösterge ancak 300ms sonra belirir. Hızlı işlemde hiç " +
      "gösterge titremez; yavaş işlemde gösterge sonradan gelir. Gösterge gecikme boyunca yerinde ama görünmez — genişlik zıplamaz.",
    `<Button loading={saving ? { delay: 300 } : false} onPress={save}>Kaydet</Button>`
  ),
  render: () => <DelayedLoadingDemo />,
};

export const LongLabel: Story = {
  name: "Uzun Etiket (dar alan)",
  ...storyDoc(
    "Etiket tek satırda kalır; kapsayıcıdan geniş olursa `…` ile kısalır — sabit yükseklikli buton iki satıra taşmaz.",
    `<View style={{ width: 192 }}>
  <Button block>Tüm bildirimleri okundu olarak işaretle</Button>
</View>`
  ),
  render: () => <LongLabelDemo />,
};

/** Web ile aynı kapsayıcı: 192px, kesikli kenarlık, 8px iç boşluk. */
function LongLabelDemo() {
  const theme = useTheme();
  return (
    <View style={{ width: 192, padding: 8, borderWidth: 1, borderStyle: "dashed", borderColor: theme.color.canvas.border, borderRadius: 12 }}>
      <Button block>Tüm bildirimleri okundu olarak işaretle</Button>
    </View>
  );
}

export const AllVariants: Story = {
  name: "Tüm Renk × Varyant Kombinasyonları",
  ...storyDoc(
    "7 renk rolü × 5 varyant. Renkler tema ile değişir.",
    `<Button color="primary" variant="solid">Kaydet</Button>
<Button color="neutral" variant="outline">Vazgeç</Button>
<Button color="error" variant="soft">Sil</Button>
<Button color="primary" variant="ghost">Detay</Button>
<Button color="primary" variant="link">Daha fazla</Button>`
  ),
  render: () => (
    <Stack>
      {COLORS.map((color) => (
        <Row key={color}>
          {VARIANTS.map((variant) => (
            <Button key={variant} color={color} variant={variant}>
              {`${color} ${variant}`}
            </Button>
          ))}
        </Row>
      ))}
    </Stack>
  ),
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc(
    "`xs`–`xl` — native ölçek 32/36/44/50/56 (Apple HIG + Material 3; web 20–48). Varsayılan `md` 44: Apple'ın önerdiği kontrol yüksekliği. `xs`/`sm` görünüm değişmeden 44px dokunma alanı alır.",
    `<Button size="xs">xs</Button>
<Button size="sm">sm</Button>
<Button size="md">md</Button>
<Button size="lg">lg</Button>
<Button size="xl">xl</Button>`
  ),
  render: () => (
    <Row>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </Row>
  ),
};

export const Shapes: Story = {
  name: "Şekiller",
  ...storyDoc(
    "`default` / `pill` / `square` / `circle`. `circle` ikon-only butonlar içindir ve `accessibilityLabel` ister.",
    `<Button shape="default">Varsayılan</Button>
<Button shape="pill">Hap</Button>
<Button shape="square">Kare</Button>
<Button shape="circle" icon={<Sparkles />} accessibilityLabel="Yıldız" />`
  ),
  render: () => (
    <Row>
      <Button shape="default">Varsayılan</Button>
      <Button shape="pill">Hap</Button>
      <Button shape="square">Kare</Button>
      <Button shape="circle" icon={<Sparkles />} accessibilityLabel="Yıldız" />
    </Row>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc(
    "Normal, `disabled`, `loading` ve ikonlu. `loading` durumunda daima bir dönen gösterge çıkar ve buton otomatik devre dışı olur.",
    `<Button>Normal</Button>
<Button disabled>Devre dışı</Button>
<Button loading>Yükleniyor</Button>
<Button loading variant="outline">Kaydediliyor</Button>
<Button icon={<Sparkles />}>İkonlu</Button>`
  ),
  render: () => (
    <Row>
      <Button>Normal</Button>
      <Button disabled>Devre dışı</Button>
      <Button loading>Yükleniyor</Button>
      <Button loading variant="outline">
        Kaydediliyor
      </Button>
      <Button icon={<Sparkles />}>İkonlu</Button>
    </Row>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    SKELETON_STORY_DOC,
    `<Button skeleton={isLoading}>Ara</Button>
<Button skeleton={isLoading} size="lg">Sepete ekle</Button>`
  ),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Row>
          <Button skeleton={skeleton} icon={<Search />}>
            Ara
          </Button>
          <Button skeleton={skeleton} variant="outline" color="neutral">
            Filtreleri temizle
          </Button>
          <Button skeleton={skeleton} size="lg">
            Sepete ekle
          </Button>
          <Button skeleton={skeleton} shape="circle" icon={<Sparkles />} accessibilityLabel="Öne çıkar" />
        </Row>
      )}
    </SkeletonDemo>
  ),
};
