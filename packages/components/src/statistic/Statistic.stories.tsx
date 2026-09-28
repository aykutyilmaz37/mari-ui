/**
 * Faz 16.2: gerçek senaryolar — pano KPI satırı (trend anlamı `goodWhen`),
 * kampanya geri sayımı, dünya saatleri, görev kronometresi.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Clock, Countdown, Statistic, Stopwatch } from "./Statistic";

const meta: Meta<typeof Statistic> = {
  title: "Veri Gösterimi/Statistic",
  component: Statistic,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Sayısal göstergeler: `Statistic` (KPI — tr-TR biçimli değer, önek/sonek, trend), `Countdown` (hedef ana geri " +
            "sayım), `Clock` (canlı saat, saat dilimi), `Stopwatch` (Başlat/Duraklat/Sıfırla). Hepsi aynı düzende: soluk başlık, " +
            "büyük değer, altta trend/açıklama.",
          whenToUse: [
            "Panoda tek bakışta okunacak sayılar (gelir, sipariş, dönüşüm) ve değişimleri.",
            "Süreye bağlı bilgiler: kampanya bitişi, oturum/sınav süresi, ölçülen iş süresi.",
          ],
          whenNotToUse: [
            "Bir işin yüzde ilerlemesi — Progress.",
            "Zaman içinde değişimin kendisi — grafik.",
          ],
          a11y:
            "Trendin yönü ve ANLAMI ikon/renkle birlikte sözle de okunur (\"artış, olumlu\"); renk `goodWhen`e göre (maliyetin " +
            "düşmesi yeşil). Saniyede değişen değerler `role=\"timer\"` — ekran okuyucu her saniye konuşmaz; geri sayımda kalan " +
            "süre sözlü (`aria-label`), süre dolunca bir kez duyurulur; kronometre durdurulunca geçen süreyi okur. Saat, " +
            "sunucu/istemci farkı olmasın diye tarayıcıda takıldıktan sonra çizilir.",
        }),
      },
    },
  },
  argTypes: {
    value: { control: "number" },
    precision: { control: "number" },
    prefix: { control: "text" },
    suffix: { control: "text" },
    title: { control: "text" },
    description: { control: "text" },
    trend: { control: "object" },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Statistic>;

const card = "rounded-xl border border-mari-border bg-mari-surface p-4";

/* ─────────────────────────── 1. Pano ─────────────────────────── */

export const Dashboard: Story = {
  name: "Pano KPI Satırı",
  ...storyDoc(
    "Trendin rengi yönden değil anlamdan: iade oranının artması KÖTÜ (`goodWhen: \"down\"`), sepet ortalaması düşüşü kötü. " +
      "Veri gelene kadar `skeleton` (kutular aynı yerde).",
    `
<Statistic title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4 }} description="geçen aya göre" />
<Statistic title="İade oranı" value={3.8} precision={1} suffix="%" trend={{ value: 0.6, unit: "points", goodWhen: "down" }} />`
  ),
  render: () => {
    const [loading, setLoading] = useState(false);
    return (
      <div className="flex max-w-4xl flex-col gap-3">
        <button type="button" onClick={() => setLoading((l) => !l)} className="self-start text-sm text-mari-primary underline-offset-2 hover:underline">
          {loading ? "Veriyi göster" : "Yükleniyor durumunu göster"}
        </button>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className={card}>
            <Statistic skeleton={loading} title="Aylık gelir" value={1284500} prefix="₺" trend={{ value: 12.4 }} description="geçen aya göre" />
          </div>
          <div className={card}>
            <Statistic skeleton={loading} title="Sipariş" value={3842} trend={{ value: 0 }} description="geçen aya göre" />
          </div>
          <div className={card}>
            <Statistic skeleton={loading} title="Ortalama sepet" value={334.3} precision={2} prefix="₺" trend={{ value: -4.1 }} description="geçen aya göre" />
          </div>
          <div className={card}>
            <Statistic skeleton={loading} title="İade oranı" value={3.8} precision={1} suffix="%" trend={{ value: 0.6, unit: "points", goodWhen: "down" }} description="geçen aya göre" />
          </div>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Geri sayım ─────────────────────────── */

export const CampaignCountdown: Story = {
  name: "Kampanya Geri Sayımı",
  ...storyDoc(
    "Hedef an verilir; gün varsa \"2 gün 04:12:09\". Süre dolunca `finishedText` gösterilir ve bir kez duyurulur, " +
      "`onFinish` çağrılır. Kısa sayaç: 10 saniye.",
    `<Countdown title="Kasım indirimleri bitiyor" target={campaignEnd} onFinish={() => setEnded(true)} finishedText="Kampanya sona erdi" />`
  ),
  render: () => {
    const long = useMemo(() => Date.now() + 2 * 86_400_000 + 4 * 3_600_000 + 12 * 60_000, []);
    const [short, setShort] = useState(() => Date.now() + 10_000);
    const [ended, setEnded] = useState(false);
    return (
      <div className="grid max-w-2xl gap-3 sm:grid-cols-2">
        <div className={card}>
          <Countdown title="Kasım indirimleri bitiyor" target={long} size="lg" />
        </div>
        <div className={card}>
          <Countdown title="Sepetiniz ayrıldı" target={short} finishedText="Süre doldu" onFinish={() => setEnded(true)} description={ended ? "Ürünler tekrar satışta." : "Bu süre içinde ödeme yapın."} />
          {ended && (
            <button
              type="button"
              className="mt-2 text-sm text-mari-primary underline-offset-2 hover:underline"
              onClick={() => {
                setEnded(false);
                setShort(Date.now() + 10_000);
              }}
            >
              Yeniden ayır
            </button>
          )}
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Dünya saatleri ─────────────────────────── */

export const WorldClocks: Story = {
  name: "Dünya Saatleri",
  ...storyDoc("`timeZone` ile IANA saat dilimi; `showSeconds` saniyeleri de gösterir.", `<Clock title="New York" timeZone="America/New_York" />`),
  render: () => (
    <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
      {[
        { city: "İstanbul", tz: "Europe/Istanbul", seconds: true },
        { city: "Londra", tz: "Europe/London" },
        { city: "New York", tz: "America/New_York" },
      ].map((c) => (
        <div key={c.city} className={card}>
          <Clock title={c.city} timeZone={c.tz} showSeconds={c.seconds} description={c.tz.split("/")[1]?.replace("_", " ")} />
        </div>
      ))}
    </div>
  ),
};

/* ─────────────────────────── 4. Kronometre ─────────────────────────── */

export const TaskStopwatch: Story = {
  name: "Görev Kronometresi",
  ...storyDoc(
    "Başlat / Duraklat / Devam et / Sıfırla. Salise görünür ama duyurulmaz; durdurunca geçen süre okunur ve `onStop` ile " +
      "kaydedilebilir.",
    `<Stopwatch title="Ödeme sayfası tasarımı" onStop={(ms) => saveTimeEntry(ms)} />`
  ),
  render: () => {
    const [log, setLog] = useState<number[]>([]);
    return (
      <div className={`${card} max-w-sm`}>
        <Stopwatch title="Ödeme sayfası tasarımı" size="lg" onStop={(ms) => ms > 0 && setLog((l) => [ms, ...l].slice(0, 3))} />
        {log.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-mari-border pt-3 text-sm text-mari-muted">
            {log.map((ms, i) => (
              <li key={i}>Kayıt: {Math.round(ms / 1000)} sn</li>
            ))}
          </ul>
        )}
      </div>
    );
  },
};

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: { title: "Aylık gelir", value: 1284500, prefix: "₺", trend: { value: 12.4, goodWhen: "up" }, description: "geçen aya göre", size: "md", skeleton: false },
  render: (args) => (
    <div className={`${card} max-w-xs`}>
      <Statistic {...args} />
    </div>
  ),
};
