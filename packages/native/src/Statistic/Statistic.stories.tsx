import React, { useMemo, useState } from "react";
import { View } from "react-native";
import type { Meta, StoryObj } from "@storybook/react";
import { Clock, Countdown, Statistic, Stopwatch } from "./Statistic";
import { Button } from "../Button";
import { Card } from "../Card";
import { Divider } from "../Divider";
import { Segmented } from "../Segmented";
import { Text } from "../Typography";
import { SKELETON_STORY_DOC, SkeletonDemo, Stack, componentDoc, storyDoc, withNativeTheme, withStretch } from "../stories/storyMeta";

const meta: Meta<typeof Statistic> = {
  title: "Native/Veri Gösterimi/Statistic",
  component: Statistic,
  tags: ["autodocs"],
  decorators: [withNativeTheme],
  parameters: { docs: { description: { component: componentDoc({
    summary: "Sayısal KPI: başlık, yerel biçimli değer, önek/sonek, trend. Aynı kabukla `Countdown`, `Clock`, `Stopwatch`.",
    whenToUse: ["Pano / özet ekranında öne çıkan sayı.", "Kampanya geri sayımı, dünya saati, antrenman kronometresi."],
    whenNotToUse: ["Bir sürecin ilerlemesi — Progress.", "Çok satırlı veri — List."],
    vsWeb: "Prop'lar aynı (`className` → `style`). Değer HIG ölçeğinde 22/28/34 (`nativeConfig.statistic`). Statistic ve Clock ekran okuyucuda TEK parça okunur (\"Aylık gelir, ₺1.284.500, %12,4 artış, olumlu, geçen aya göre\"); sayaçlar `timer` rolünde, her saniye konuşmaz — süre dolunca / durdurunca `announceForAccessibility`. Sayma animasyonu hareket azaltmada çalışmaz.",
  }) } } },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    valueAnimation: { control: "select", options: ["count", "typewriter"] },
    animated: { control: "boolean" },
    skeleton: { control: "boolean" },
  },
  args: { title: "Aylık gelir", value: 1284500, prefix: "₺", trend: { value: 12.4, goodWhen: "up" }, description: "geçen aya göre", size: "md", skeleton: false, animated: true, valueAnimation: "count" },
};
export default meta;
type Story = StoryObj<typeof Statistic>;

export const Playground: Story = {
  ...storyDoc("Tüm prop'ları canlı deneyin."),
  decorators: [withStretch],
  render: (args) => (
    <Card>
      <Statistic {...args} />
    </Card>
  ),
};

function DashboardDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <View style={{ gap: 12 }}>
      <Segmented
        size="sm"
        accessibilityLabel="Durum"
        value={loading ? "loading" : "data"}
        onChange={(v) => setLoading(v === "loading")}
        options={[
          { value: "data", label: "Veri" },
          { value: "loading", label: "Yükleniyor" },
        ]}
      />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {[
          <Statistic key="g" skeleton={loading} size="sm" title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4 }} description="geçen aya göre" />,
          <Statistic key="s" skeleton={loading} size="sm" title="Sipariş" value={3842} trend={{ value: 0 }} description="geçen aya göre" />,
          <Statistic key="o" skeleton={loading} size="sm" title="Ortalama sepet" value={334.3} precision={2} prefix="₺" trend={{ value: -4.1 }} description="geçen aya göre" />,
          <Statistic key="i" skeleton={loading} size="sm" title="İade oranı" value={3.8} precision={1} suffix="%" trend={{ value: 0.6, unit: "points", goodWhen: "down" }} description="geçen aya göre" />,
        ].map((stat, i) => (
          // İki sütun: telefonda kartlar yan yana ikişer.
          <Card key={i} size="sm" style={{ flexBasis: "45%", flexGrow: 1 }}>
            {stat}
          </Card>
        ))}
      </View>
    </View>
  );
}

export const Dashboard: Story = {
  name: "Pano KPI Satırı",
  ...storyDoc(
    "Trendin rengi yönden değil anlamdan: iade oranının artması KÖTÜ (`goodWhen: \"down\"`), sepet ortalaması düşüşü kötü. Veri gelene kadar `skeleton` (kutular aynı yerde).",
    `<Statistic title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4 }} description="geçen aya göre" />
<Statistic title="İade oranı" value={3.8} precision={1} suffix="%" trend={{ value: 0.6, unit: "points", goodWhen: "down" }} />`
  ),
  decorators: [withStretch],
  render: () => <DashboardDemo />,
};

function AnimationDemo() {
  const [run, setRun] = useState(0);
  return (
    <View style={{ gap: 12 }}>
      <Button size="sm" variant="outline" color="neutral" onPress={() => setRun((n) => n + 1)} style={{ alignSelf: "flex-start" }}>
        Yeniden oynat
      </Button>
      <Stack key={run}>
        <Card size="sm">
          <Statistic title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4 }} description="sayar" />
        </Card>
        <Card size="sm">
          <Statistic title="Aktif kullanıcı" value={48213} valueAnimation="typewriter" trend={{ value: -2.3 }} description="yazar" />
        </Card>
        <Card size="sm">
          <Statistic title="İade oranı" value={3.8} precision={1} suffix="%" trend={{ value: 0 }} description="değişmedi" />
        </Card>
      </Stack>
    </View>
  );
}

export const ValueAnimation: Story = {
  name: "Animasyon",
  ...storyDoc(
    "`animated` (varsayılan açık): değer ve trend canlanır, trend oku yönünde kayarak gelir. `valueAnimation`: `\"count\"` sayar, `\"typewriter\"` yazar. Genişlik zıplamaz; ekran okuyucu yalnız son değeri okur. Hareket azaltmada çalışmaz.",
    `<Statistic title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4 }} />
<Statistic title="Aktif kullanıcı" value={48213} valueAnimation="typewriter" trend={{ value: -2.3 }} />`
  ),
  decorators: [withStretch],
  render: () => <AnimationDemo />,
};

function CountdownDemo() {
  const long = useMemo(() => Date.now() + 2 * 86_400_000 + 4 * 3_600_000 + 12 * 60_000, []);
  const [short, setShort] = useState(() => Date.now() + 10_000);
  const [ended, setEnded] = useState(false);
  return (
    <Stack>
      <Card size="sm">
        <Countdown title="Kasım indirimleri bitiyor" target={long} size="lg" />
      </Card>
      <Card size="sm">
        <View style={{ gap: 8 }}>
          <Countdown title="Sepetiniz ayrıldı" target={short} finishedText="Süre doldu" onFinish={() => setEnded(true)} description={ended ? "Ürünler tekrar satışta." : "Bu süre içinde ödeme yapın."} />
          {ended ? (
            <Button
              size="sm"
              variant="ghost"
              style={{ alignSelf: "flex-start" }}
              onPress={() => {
                setEnded(false);
                setShort(Date.now() + 10_000);
              }}
            >
              Yeniden ayır
            </Button>
          ) : null}
        </View>
      </Card>
    </Stack>
  );
}

export const CampaignCountdown: Story = {
  name: "Kampanya Geri Sayımı",
  ...storyDoc(
    "Hedef an verilir; gün varsa \"2 gün 04:12:09\". Süre dolunca `finishedText` gösterilir ve bir kez duyurulur, `onFinish` çağrılır. Kısa sayaç: 10 saniye.",
    `<Countdown title="Kasım indirimleri bitiyor" target={campaignEnd} onFinish={() => setEnded(true)} finishedText="Kampanya sona erdi" />`
  ),
  decorators: [withStretch],
  render: () => <CountdownDemo />,
};

export const WorldClocks: Story = {
  name: "Dünya Saatleri",
  ...storyDoc("`timeZone` ile IANA saat dilimi; `showSeconds` saniyeleri de gösterir.", `<Clock title="New York" timeZone="America/New_York" />`),
  decorators: [withStretch],
  render: () => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
      {[
        { city: "İstanbul", tz: "Europe/Istanbul", seconds: true },
        { city: "Londra", tz: "Europe/London" },
        { city: "New York", tz: "America/New_York" },
      ].map((c) => (
        <Card key={c.city} size="sm" style={{ flexBasis: "45%", flexGrow: 1 }}>
          <Clock title={c.city} timeZone={c.tz} showSeconds={c.seconds} size="sm" description={c.tz.split("/")[1]?.replace("_", " ")} />
        </Card>
      ))}
    </View>
  ),
};

const TARGET_MS = 60_000;

function attemptNote(ms: number, isBest: boolean): string {
  const note = ms >= TARGET_MS ? "Hedef tamam" : `${Math.ceil((TARGET_MS - ms) / 1000)} sn eksik`;
  return isBest ? `${note} · en iyi` : note;
}

function PlankDemo() {
  const [attempts, setAttempts] = useState<number[]>([48_300, 55_120]);
  const best = Math.max(0, ...attempts);
  return (
    <Card>
      <View style={{ gap: 12 }}>
        <Stopwatch title="Plank" description="Hedef: 1 dakika" size="lg" onStop={(ms) => ms >= 1000 && setAttempts((a) => [ms, ...a].slice(0, 4))} />
        <Divider />
        <Text weight="medium">Son denemeler</Text>
        {attempts.map((ms, i) => (
          <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
            <Text style={{ fontVariant: ["tabular-nums"] }}>{`${(ms / 1000).toLocaleString("tr-TR", { maximumFractionDigits: 1 })} sn`}</Text>
            <Text color={ms >= TARGET_MS ? "success" : undefined} muted={ms < TARGET_MS}>
              {attemptNote(ms, ms === best && attempts.length > 1)}
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export const PlankStopwatch: Story = {
  name: "Antrenman Kronometresi (Plank)",
  ...storyDoc(
    "Başlat / Duraklat / Devam et / Sıfırla. Salise görünür ama duyurulmaz; durdurunca geçen süre okunur ve `onStop` ile kayda geçer.",
    `<Stopwatch title="Plank" description="Hedef: 1 dakika" onStop={(ms) => saveAttempt(ms)} />`
  ),
  decorators: [withStretch],
  render: () => <PlankDemo />,
};

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Statistic title="Aylık gelir" value={1284500} prefix="₺" skeleton={isLoading} />`),
  render: () => <SkeletonDemo>{(skeleton) => <Statistic title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4, goodWhen: "up" }} description="geçen aya göre" skeleton={skeleton} />}</SkeletonDemo>,
};
