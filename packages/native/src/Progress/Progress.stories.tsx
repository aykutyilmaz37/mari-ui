import React, { useEffect, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./Progress";
import { Input } from "../Input";
import { Field } from "../Field";
import { Text, Title } from "../Typography";
import { Card } from "../Card";
import { Row, SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Progress> = {
  title: "Native/Geri Bildirim/Progress",
  component: Progress,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Belirli ilerleme: çizgi, adımlı çizgi ya da daire.",
    whenToUse: ["Dosya yükleme, kurulum adımları, kota kullanımı.", "Şifre gücü (`steps`)."],
    whenNotToUse: ["Süresi belirsiz bekleme — Loading."],
    vsWeb: "Prop'lar aynı (`aria-label` → `accessibilityLabel`). Çizgi kalınlığı 4/6/10 (4 = iOS/M3 varsayılanı), daire 48/80/120. Ekran okuyucu ilerleme değeri + durum (\"%100, tamamlandı\") okur. `active` dolgu nabız atar (hareket azaltmada durur).",
  }) } } },
  argTypes: {
    percent: { control: { type: "range", min: 0, max: 100 } },
    type: { control: "select", options: ["line", "circle"] },
    status: { control: "select", options: [undefined, "normal", "active", "success", "exception"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
    steps: { control: "number" },
    showInfo: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { percent: 45, type: "line", size: "md", showInfo: true, skeleton: false, accessibilityLabel: "Yükleme" },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Playground: Story = {
  ...storyDoc("Yüzde, tür, durum ve boyutu deneyin."),
  decorators: [withStretch],
  render: (args) => <Progress {...args} />,
};

function UploadList() {
  const [p, setP] = useState(20);
  useEffect(() => {
    const id = setInterval(() => setP((v) => (v >= 100 ? 20 : v + 10)), 700);
    return () => clearInterval(id);
  }, []);
  const files = [
    { name: "fatura-eylul.pdf", percent: 100 },
    { name: "urun-fotografi.jpg", percent: p, status: "active" as const },
    { name: "katalog.zip", percent: 62, status: "exception" as const, note: "Bağlantı koptu" },
  ];
  return (
    <View style={{ gap: 14 }}>
      {files.map((f) => (
        <View key={f.name} style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text>{f.name}</Text>
            {f.note ? <Text color="error">{f.note}</Text> : null}
          </View>
          <Progress size="sm" percent={f.percent} status={f.status} accessibilityLabel={f.name} />
        </View>
      ))}
    </View>
  );
}

export const Uploads: Story = {
  name: "Dosya Yükleme Listesi",
  ...storyDoc("Tamamlanan (✓), süren (`active`), hatalı (`exception`) dosyalar.", `<Progress size="sm" percent={percent} status="active" accessibilityLabel="urun-fotografi.jpg" />`),
  decorators: [withStretch],
  render: () => <UploadList />,
};

function strength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/\d/.test(pw)) score++;
  if (/[A-ZÇĞİÖŞÜ]/.test(pw)) score++;
  if (/[^\wçğıöşüÇĞİÖŞÜ]/.test(pw)) score++;
  return score;
}

function PasswordStrength() {
  const [pw, setPw] = useState("mari2026");
  const score = strength(pw);
  const labels = ["Çok zayıf", "Zayıf", "Orta", "İyi", "Güçlü"];
  const colors = ["error", "error", "warning", "info", "success"] as const;
  return (
    <Field label="Şifre" hint={`Güç: ${labels[score]}`}>
      <Input type="password" value={pw} onChangeText={setPw} />
      <Progress steps={4} percent={score * 25} color={colors[score]} showInfo={false} accessibilityLabel={`Şifre gücü: ${labels[score]}`} />
    </Field>
  );
}

export const Strength: Story = {
  name: "Şifre Gücü (steps)",
  ...storyDoc("Dört adımlı çizgi; renk güce göre.", `<Progress steps={4} percent={score * 25} color={color} showInfo={false} accessibilityLabel="Şifre gücü: Orta" />`),
  decorators: [withStretch],
  render: () => <PasswordStrength />,
};

export const Storage: Story = {
  name: "Depolama Kullanımı (daire)",
  ...storyDoc("Daire + `success` ile iki katman: kullanılan ve yedeklenen.", `<Progress type="circle" size="lg" percent={72} success={{ percent: 40 }} format={(p) => \`%\${p}\`} accessibilityLabel="Depolama" />`),
  // Card'ı diğer Card story'leri gibi tam genişlikte kullan: içerik genişliğine
  // daralan Card telefonda aşağı doğru uzuyordu (web'de görünmüyor).
  decorators: [withStretch],
  render: () => (
    <Card>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
        <Progress type="circle" size="lg" percent={72} success={{ percent: 40 }} accessibilityLabel="Depolama" />
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Title level={5}>72 GB / 100 GB</Title>
          <Text muted>40 GB yedeklendi</Text>
        </View>
      </View>
    </Card>
  ),
};

export const Sizes: Story = {
  name: "Boyut ve Durum",
  ...storyDoc("sm/md/lg; normal, success, exception; daire boyutları.", `<Progress size="lg" percent={100} />
<Progress type="circle" size="sm" percent={30} status="exception" />`),
  decorators: [withStretch],
  render: () => (
    <Stack>
      <Progress size="sm" percent={30} accessibilityLabel="sm" />
      <Progress percent={100} accessibilityLabel="md" />
      <Progress size="lg" percent={60} status="exception" accessibilityLabel="lg" />
      <Row>
        <Progress type="circle" size="sm" percent={30} accessibilityLabel="sm" />
        <Progress type="circle" percent={100} accessibilityLabel="md" />
        <Progress type="circle" size="lg" percent={60} status="exception" accessibilityLabel="lg" />
      </Row>
    </Stack>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Progress skeleton={isLoading} percent={usage} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Stack>
          <Progress skeleton={skeleton} percent={64} accessibilityLabel="Kota" />
          <Progress skeleton={skeleton} type="circle" percent={64} accessibilityLabel="Kota" />
        </Stack>
      )}
    </SkeletonDemo>
  ),
};
