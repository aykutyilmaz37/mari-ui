/**
 * Faz 13.6: üç mod (satır içi / sarmalama / tam ekran) ve gerçek senaryolar.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kodu
 * gösterir. Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { CheckIcon, RefreshCwIcon } from "lucide-react";
import { baseSizeArgType, colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Loading } from "./Loading";
import { Button } from "../button";
import { Input } from "../input";

const meta: Meta<typeof Loading> = {
  title: "Geri Bildirim/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Süren bir işlemi gösteren gösterge (ant.design Spin). Üç mod: **satır içi** (varsayılan), **sarmalama** " +
            "(`children` verilir — içerik yerinde kalır, soluklaşır ve etkileşime kapanır; düzen kaymaz) ve **tam " +
            "ekran** (`fullscreen`). `delay` hızlı biten isteklerde yanıp sönmeyi önler, `percent` belirli ilerlemeyi " +
            "halka + yüzde olarak gösterir.",
          whenToUse: [
            "Var olan içerik güncellenirken (yenile, filtrele) — sarmalama modu, içerik kaybolmadan.",
            "Süresi belirsiz kısa işlemler: kaydediliyor, daha fazla yükleniyor.",
          ],
          whenNotToUse: [
            "İçerik İLK KEZ yükleniyorsa — `Skeleton` kullanın; iskelet sayfanın şeklini önceden gösterir.",
            "Bir düğmenin kendi işlemi için — `Button loading` yeterli.",
          ],
          a11y:
            "Satır içi/tam ekran: `role=\"status\"` + `aria-live=\"polite\"`, ad `tip`'ten (yoksa \"Yükleniyor\"). " +
            "Sarmalama: kapsayıcı `aria-busy`, içerik `inert` (odak/tıklama yok), canlı bölge hep DOM'da kalır ve " +
            "sadece metni değişir — ekran okuyucu yükleme başlangıcını kaçırmaz. `percent` → `role=\"progressbar\"`. " +
            "Hareket azaltma tercihinde spinner durmaz (durum taşıyor) ama yavaşlar.",
        }),
      },
    },
  },
  argTypes: {
    spinning: { control: "boolean", description: "Varsayılan: `true`." },
    size: { ...baseSizeArgType, description: "16 / 24 / 40px. Varsayılan: `md`." },
    tip: { control: "text", description: "Açıklama — ekran okuyucuya da duyurulur." },
    delay: { control: "number", description: "Spinner'ı bu kadar ms sonra göster." },
    percent: { control: { type: "range", min: 0, max: 100 }, description: "Belirli ilerleme (0-100)." },
    fullscreen: { control: "boolean", description: "Tüm ekranı kaplayan örtü." },
    color: { ...colorArgType, description: "Dönen yay rengi. Varsayılan: `primary`." },
    trackColor: { table: { disable: true } },
    indicator: { control: false },
    children: { control: false, description: "Verilirse sarmalama modu." },
  },
};

export default meta;
type Story = StoryObj<typeof Loading>;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ─────────────────────────── 1. Kart yenileme (sarmalama) ─────────────────────────── */

const series = [
  [42, 55, 38, 61, 70, 66, 74],
  [50, 47, 58, 63, 59, 72, 80],
  [35, 44, 52, 49, 60, 68, 71],
];
const days = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

export const RefreshCard: Story = {
  name: "Kart Yenileme (Sarmalama)",
  ...storyDoc(
    "Var olan içerik güncellenirken: grafik yerinde kalır (düzen kaymaz, CLS yok), soluklaşır, üstünde spinner. " +
      "`delay={200}` — istek hızlı dönerse spinner hiç görünmez.",
    `
<Loading spinning={isFetching} delay={200} tip="Güncelleniyor…">
  <WeeklyChart data={data} />
</Loading>`
  ),
  render: () => {
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const data = series[index] ?? [];
    const max = Math.max(...data);
    const refresh = async () => {
      setLoading(true);
      await wait(1400);
      setIndex((i) => (i + 1) % series.length);
      setLoading(false);
    };
    return (
      <div className="max-w-md rounded-xl border border-mari-border bg-mari-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-mari-muted">Haftalık ziyaretçi</p>
            <p className="text-2xl font-semibold tabular-nums text-mari-foreground">{data.reduce((a, b) => a + b, 0) * 12}</p>
          </div>
          <Button size="sm" variant="outline" color="neutral" icon={<RefreshCwIcon size={14} aria-hidden />} onClick={refresh} disabled={loading}>
            Yenile
          </Button>
        </div>
        <Loading spinning={loading} delay={200} tip="Güncelleniyor…">
          <div className="flex h-36 items-end gap-2" role="img" aria-label="Haftalık ziyaretçi grafiği">
            {data.map((v, i) => (
              <div key={days[i]} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="flex w-full flex-1 items-end">
                  <div className="w-full rounded-t-md bg-mari-primary-solid/80 transition-[height] duration-500" style={{ height: `${(v / max) * 100}%` }} />
                </div>
                <span className="text-[11px] text-mari-muted">{days[i]}</span>
              </div>
            ))}
          </div>
        </Loading>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Form gönderimi ─────────────────────────── */

export const FormSubmit: Story = {
  name: "Form Gönderimi",
  ...storyDoc(
    "Sarmalama modu içeriği `inert` yapar: kaydedilirken alanlar düzenlenemez, düğmeye ikinci kez basılamaz " +
      "(çift gönderim yok). Bittiğinde her şey yeniden etkileşime açılır.",
    `
<Loading spinning={saving} tip="Kaydediliyor…">
  <form onSubmit={save}>…</form>
</Loading>`
  ),
  render: () => {
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    return (
      <div className="max-w-md rounded-xl border border-mari-border bg-mari-surface p-6">
        <Loading spinning={saving} tip="Kaydediliyor…">
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setSaved(false);
              setSaving(true);
              await wait(1500);
              setSaving(false);
              setSaved(true);
            }}
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loading-demo-name" className="text-sm font-medium text-mari-foreground">
                Görünen ad
              </label>
              <Input id="loading-demo-name" defaultValue="Deniz Kaya" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loading-demo-bio" className="text-sm font-medium text-mari-foreground">
                Biyografi
              </label>
              <Input id="loading-demo-bio" defaultValue="Ürün Yöneticisi · İstanbul" />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              {saved && (
                <span className="inline-flex items-center gap-1 text-sm text-mari-success">
                  <CheckIcon size={16} aria-hidden /> Kaydedildi
                </span>
              )}
              <Button htmlType="submit">Kaydet</Button>
            </div>
          </form>
        </Loading>
      </div>
    );
  },
};

/* ─────────────────────────── 3. Tam ekran ─────────────────────────── */

const phases = ["Çalışma alanı oluşturuluyor", "Örnek veriler yükleniyor", "Tema uygulanıyor", "Hazır!"];

export const FullscreenSetup: Story = {
  name: "Tam Ekran (Hesap Hazırlanıyor)",
  ...storyDoc(
    "`fullscreen` + `percent` — belirli ilerlemede dönen yay yerine dolan halka ve yüzde; `tip` o anki aşamayı " +
      "söyler ve ekran okuyucuya da okunur. Örtü alttaki sayfayla etkileşimi engeller.",
    `
<Loading fullscreen size="lg" percent={progress} tip="Örnek veriler yükleniyor" />`
  ),
  render: () => {
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    useEffect(() => {
      if (!running) return;
      if (progress >= 100) {
        const done = setTimeout(() => setRunning(false), 600);
        return () => clearTimeout(done);
      }
      const t = setTimeout(() => setProgress((p) => Math.min(100, p + 4)), 90);
      return () => clearTimeout(t);
    }, [running, progress]);
    const phase = phases[Math.min(phases.length - 1, Math.floor(progress / 34))];
    return (
      <>
        <div className="max-w-md rounded-xl border border-mari-border bg-mari-surface p-6">
          <p className="mb-1 font-semibold text-mari-foreground">Kuzey Yazılım</p>
          <p className="mb-4 text-sm text-mari-muted">Çalışma alanınız birkaç saniye içinde hazır olacak.</p>
          <Button
            onClick={() => {
              setProgress(0);
              setRunning(true);
            }}
          >
            Hesabı oluştur
          </Button>
        </div>
        <Loading fullscreen spinning={running} size="lg" percent={progress} tip={phase} />
      </>
    );
  },
};

/* ─────────────────────────── 4. Satır içi ─────────────────────────── */

export const Inline: Story = {
  name: "Satır İçi (Otomatik Kayıt, Daha Fazla)",
  ...storyDoc(
    "`size=\"sm\"` yatay düzen: editör başlığında otomatik kayıt durumu; listenin sonunda \"daha fazla yükleniyor\".",
    `
{saving ? <Loading size="sm" tip="Kaydediliyor…" /> : <span>Kaydedildi</span>}`
  ),
  render: () => {
    const [text, setText] = useState("Sprint 42 notları");
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState(4);
    const [loadingMore, setLoadingMore] = useState(false);
    useEffect(() => {
      setSaving(true);
      const t = setTimeout(() => setSaving(false), 900);
      return () => clearTimeout(t);
    }, [text]);
    return (
      <div className="flex max-w-md flex-col gap-6">
        <div className="rounded-xl border border-mari-border bg-mari-surface p-4">
          <div className="mb-3 flex h-5 items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-mari-muted">Belge</span>
            {saving ? (
              <Loading size="sm" tip="Kaydediliyor…" />
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-mari-muted">
                <CheckIcon size={14} aria-hidden /> Kaydedildi
              </span>
            )}
          </div>
          <Input value={text} onChange={(e) => setText(e.target.value)} aria-label="Belge başlığı" />
        </div>

        <div className="rounded-xl border border-mari-border bg-mari-surface">
          <ul className="divide-y divide-mari-border">
            {Array.from({ length: items }, (_, i) => (
              <li key={i} className="px-4 py-3 text-sm text-mari-foreground">
                Sipariş #TR-{48213 - i}
              </li>
            ))}
          </ul>
          <div className="flex h-12 items-center justify-center border-t border-mari-border">
            {loadingMore ? (
              <Loading size="sm" tip="Yükleniyor…" />
            ) : (
              <Button
                variant="ghost"
                color="neutral"
                size="sm"
                onClick={async () => {
                  setLoadingMore(true);
                  await wait(1000);
                  setItems((n) => n + 3);
                  setLoadingMore(false);
                }}
              >
                Daha fazla göster
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── 5. Gecikme ─────────────────────────── */

export const Delay: Story = {
  name: "Gecikme (Yanıp Sönme Yok)",
  ...storyDoc(
    "Aynı iki istek: 150 ms'de dönen hızlı istekte `delay={300}` spinner'ı HİÇ göstermez (göz kırpması yok); " +
      "`delay` olmayanda spinner bir an belirip kaybolur.",
    `<Loading spinning={loading} delay={300}>…</Loading>`
  ),
  render: () => {
    const [a, setA] = useState(false);
    const [b, setB] = useState(false);
    const run = async (set: (v: boolean) => void) => {
      set(true);
      await wait(150);
      set(false);
    };
    return (
      <div className="grid max-w-xl gap-4 sm:grid-cols-2">
        {[
          { label: "delay yok", spinning: a, delay: 0, onClick: () => run(setA) },
          { label: "delay={300}", spinning: b, delay: 300, onClick: () => run(setB) },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-mari-border bg-mari-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <code className="text-xs text-mari-muted">{c.label}</code>
              <Button size="sm" variant="outline" color="neutral" onClick={c.onClick}>
                Hızlı istek (150 ms)
              </Button>
            </div>
            <Loading spinning={c.spinning} delay={c.delay}>
              <div className="flex h-24 items-center justify-center rounded-lg bg-mari-surface-alt text-sm text-mari-muted">Sonuçlar</div>
            </Loading>
          </div>
        ))}
      </div>
    );
  },
};

/* ─────────────────────────── Temel seçenekler ─────────────────────────── */

export const SizesAndColors: Story = {
  name: "Boyutlar ve Renkler",
  ...storyDoc("`sm` 16 / `md` 24 / `lg` 40px; `color` dönen yay.", `<Loading size="lg" color="success" />`),
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex items-end gap-10">
        {(["sm", "md", "lg"] as const).map((size) => (
          <Loading key={size} size={size} tip={size} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-8">
        {(["primary", "accent", "success", "warning", "error", "neutral"] as const).map((color) => (
          <Loading key={color} color={color} />
        ))}
      </div>
      <div className="flex items-end gap-10">
        {[25, 60, 100].map((p) => (
          <Loading key={p} size="lg" percent={p} />
        ))}
      </div>
    </div>
  ),
};

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin (tam ekranı açarsanız kapatmak için `spinning`'i kapatın)."),
  args: { spinning: true, size: "md", tip: "Yükleniyor…", delay: 0, color: "primary", fullscreen: false },
};
