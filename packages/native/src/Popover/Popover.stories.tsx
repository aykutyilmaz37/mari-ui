import React, { useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Info, Share2, SlidersHorizontal } from "lucide-react-native";
import { Popover } from "./Popover";
import { Avatar } from "../Avatar";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { Input } from "../Input";
import { Tag } from "../Tag";
import { Text } from "../Typography";
import { useTheme } from "../theme/useTheme";
import { SKELETON_STORY_DOC, SkeletonDemo, Row, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Popover> = {
  title: "Native/Geri Bildirim/Popover",
  component: Popover,
  tags: ["autodocs"],
  decorators: [withStretch, withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Bir öğeye bağlı yüzen panel: başlık + etkileşimli olabilen içerik + ok. Tetikleyiciye dokununca (`click`) ya da basılı tutunca (`longPress`) açılır; dışarı dokunma, Android geri ve VoiceOver \"geri\" kapatır. Yer yoksa karşı yöne döner, ekrana kıstırılır ama tetikleyiciden kopmaz.",
    whenToUse: ["Bir öğe hakkında kısa bilgi / açıklama (\"bu ne?\" — native'de Tooltip yerine).", "Küçük, yerinde form ya da eylemler: bağlantı paylaşma, sütun filtresi."],
    whenNotToUse: ["Uzun içerik ya da tam form — BottomSheet.", "Eylem listesi — ActionSheet.", "Onay isteyen kritik karar — Dialog."],
    vsWeb: "API web Popover ile aynı (`title`, `content`, `placement`, `arrow`, `open`/`onOpenChange`, `role`). `trigger`: `click` / `longPress` (hover ve focus yok). `content` fonksiyon olabilir: `(close) => …` — içerikteki bir düğme paneli kapatsın. Tetikleyicinin kendi `onPress`i korunur. Konum açılış anında ölçülür (`measureInWindow`).",
  }) } } },
  argTypes: {
    placement: { control: "select", options: ["top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "right"] },
    trigger: { control: "select", options: ["click", "longPress"] },
    arrow: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { placement: "top", trigger: "click", arrow: true, skeleton: false },
};
export default meta;
type Story = StoryObj<typeof Popover>;

function MutedIcon({ Icon }: { Icon: typeof Info }) {
  const theme = useTheme();
  return <Icon size={18} color={theme.color.canvas.foreground} />;
}

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  render: (args) => (
    <View style={{ paddingVertical: 80, alignItems: "center" }}>
      <Popover {...args} title="Kargo süresi" content="Siparişler hafta içi 15:00'e kadar verilirse aynı gün kargoya verilir.">
        <Button variant="outline">Ayrıntı</Button>
      </Popover>
    </View>
  ),
};

function ShareDemo() {
  const [copied, setCopied] = useState(false);
  const url = "https://mari-ui.com/r/eylul-raporu";
  return (
    <View style={{ paddingTop: 140, alignItems: "flex-start" }}>
      <Popover
        title="Bağlantıyı paylaş"
        onOpenChange={(o) => !o && setCopied(false)}
        content={(close) => (
          <View style={{ gap: 10, width: 260 }}>
            <Input value={url} readOnly accessibilityLabel="Bağlantı" />
            <Row>
              <Button size="sm" onPress={() => setCopied(true)}>{copied ? "Kopyalandı" : "Kopyala"}</Button>
              <Button size="sm" variant="ghost" onPress={close}>Kapat</Button>
            </Row>
          </View>
        )}
      >
        <Button variant="outline" icon={<MutedIcon Icon={Share2} />}>Paylaş</Button>
      </Popover>
    </View>
  );
}

export const ShareLink: Story = {
  name: "Bağlantı Paylaş (dokun)",
  ...storyDoc("Etkileşimli içerik: `content={(close) => …}` — \"Kapat\" paneli kapatır. Üstte yer yoksa altta açılır.", `<Popover title="Bağlantıyı paylaş" content={(close) => <><Input value={url} readOnly /><Button onPress={close}>Kapat</Button></>}>
  <Button>Paylaş</Button>
</Popover>`),
  render: () => <ShareDemo />,
};

export const UserCard: Story = {
  name: "Kullanıcı Kartı (basılı tut)",
  ...storyDoc("`trigger=\"longPress\"`: basılı tutunca açılan bilgi balonu — dokunmak avatarın kendi işini yapar (profil).", `<Popover trigger="longPress" content={<UserCard />}><Avatar … /></Popover>`),
  render: () => (
    <View style={{ paddingTop: 140, alignItems: "flex-start" }}>
      <Popover
        trigger="longPress"
        placement="top-start"
        accessibilityLabel="Deniz Kaya"
        content={
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center", width: 240 }}>
            <Avatar alt="Deniz Kaya" color="primary" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text weight="semibold">Deniz Kaya</Text>
              <Text muted style={{ fontSize: 13 }}>Ürün Tasarımcısı · İstanbul</Text>
              <Tag color="success">Çevrimiçi</Tag>
            </View>
          </View>
        }
      >
        <Avatar alt="Deniz Kaya" color="primary" />
      </Popover>
      <Text muted style={{ marginTop: 8, fontSize: 13 }}>Avatarı basılı tutun.</Text>
    </View>
  ),
};

const COLUMNS = ["Sipariş no", "Müşteri", "Tutar", "Durum", "Tarih"];

function FilterDemo() {
  const [visible, setVisible] = useState<string[]>(["Sipariş no", "Müşteri", "Tutar"]);
  const toggle = (c: string) => setVisible((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));
  return (
    <View style={{ alignItems: "flex-end", paddingBottom: 260 }}>
      <Popover
        placement="bottom-end"
        title="Görünen sütunlar"
        content={(close) => (
          <View style={{ gap: 8, width: 220 }}>
            {COLUMNS.map((c) => (
              <Checkbox key={c} label={c} checked={visible.includes(c)} onChange={() => toggle(c)} />
            ))}
            <Button size="sm" onPress={close}>Uygula</Button>
          </View>
        )}
      >
        <Button variant="outline" icon={<MutedIcon Icon={SlidersHorizontal} />}>{`Sütunlar (${visible.length})`}</Button>
      </Popover>
    </View>
  );
}

export const ColumnFilter: Story = {
  name: "Tablo Sütun Filtresi (form)",
  ...storyDoc("`placement=\"bottom-end\"`: sağ kenara hizalı, aşağı açılır. İçerik küçük bir form.", `<Popover placement="bottom-end" title="Görünen sütunlar" content={(close) => <ColumnChecks onDone={close} />}>…</Popover>`),
  render: () => <FilterDemo />,
};

export const Placements: Story = {
  name: "Konumlar",
  ...storyDoc("`placement`: 12 değer (web ile aynı). Sığmazsa karşı yöne döner; ok tetikleyiciyi gösterir.", `<Popover placement="bottom-start" … />`),
  render: () => (
    <Stack>
      {(["top", "bottom", "left", "right"] as const).map((p) => (
        <View key={p} style={{ alignItems: "center", paddingVertical: 50 }}>
          <Popover placement={p} content={`placement="${p}"`}>
            <Button size="sm" variant="outline" icon={<MutedIcon Icon={Info} />}>{p}</Button>
          </Popover>
        </View>
      ))}
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC + " Panel açılınca içerik kendi şeklinde yer tutucu (ör. kart verisi yüklenirken).", `<Popover skeleton={isLoading} content={<UserCard />}>…</Popover>`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <View style={{ paddingTop: 120, alignItems: "flex-start" }}>
          <Popover skeleton={skeleton} title="Deniz Kaya" content="Ürün Tasarımcısı · İstanbul · 12 proje">
            <Button variant="outline">Kişi kartı</Button>
          </Popover>
        </View>
      )}
    </SkeletonDemo>
  ),
};
