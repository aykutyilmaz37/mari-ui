/**
 * Faz 16.8: gerçek senaryolar — ayarlar çekmecesi, kalıcılık (localStorage),
 * sayfa içi ayarlar bölümü. Story'ler temayı `target` ile önizleme kutusuna
 * uygular (docs sayfasında tüm story'ler aynı `<html>`i paylaşır); gerçek
 * kullanımda `target` verilmez → `<html>`. "Show code" `storyDoc`'un 2. argümanı.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { SettingsIcon } from "lucide-react";
import { componentDoc, jsxProps, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { loadTheme, saveTheme } from "@mari-ui/tokens";
import type { ThemeSettings } from "@mari-ui/tokens";
import { Button } from "../button";
import { Drawer } from "../drawer";
import { Input } from "../input";
import { Switch } from "../switch";
import { Tag } from "../tag";

const meta: Meta<typeof ThemeCustomizer> = {
  title: "Genel/ThemeCustomizer",
  component: ThemeCustomizer,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Son kullanıcının uygulamanın görünümünü kişiselleştirdiği panel: mod (Açık/Koyu/Sistem), vurgu rengi ve boşluk yoğunluğu. " +
            "Seçim `applyTheme` ile anında uygulanır — provider yok. Seçilen renk zeminde görünür olacak kadar otomatik koyulaştırılır " +
            "(koyu temada açılır); kullanıcı okunmaz bir tema üretemez. Kalıcılık için `saveTheme`/`loadTheme`, açılışta tema yanıp sönmesini " +
            "(FOUC) önlemek için `<head>`e `getThemeScript()` — framework'ten bağımsız. Geliştiricinin derleme zamanı teması (`mari-ui.config.json`, Tema Stüdyosu) ayrı bir şey.",
          whenToUse: [
            "Ayarlar sayfası, profil menüsü ya da ayarlar çekmecesinde kullanıcıya görünüm tercihi sunmak.",
            "Yalnız koyu mod anahtarı gerekiyorsa da: `sections={[\"mode\"]}`.",
          ],
          whenNotToUse: [
            "Marka temasını tasarlamak (font, tüm renk rolleri, radius) — geliştirici aracı Tema Stüdyosu (`apps/studio`).",
            "Tek bir bileşenin rengini seçtirmek — ColorPicker.",
          ],
          a11y:
            "Her bölüm adlandırılmış bir `radiogroup` (gerçek radyo düğmeleri: Tab tek durak, ok tuşları seçer). Renk örnekleri yalnız " +
            "renkten ibaret olduğu için her biri adlıdır (\"Mavi\"); seçili örnekte onay işareti var, renk tek ipucu değil. Vurgu rengi " +
            "dolgu üstü metin ≥4.5:1, dolgunun zemine karşıtlığı ≥3:1 olacak şekilde düzeltilir. Sıkı yoğunluk dokunmatik cihazlarda " +
            "uygulanmaz (44px dokunma hedefi korunur).",
        }),
      },
    },
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    target: { control: false },
    colors: { control: false },
    onChange: { table: { category: "Olaylar" } },
    apply: { control: "boolean", description: "Seçimi anında uygular. `false`: yalnız `onChange`." },
    sections: { control: "check", options: ["mode", "color", "spacing"] },
    allowCustom: { control: "boolean", description: "Hazır renklerin yanında serbest renk seçici." },
    disabled: { control: "boolean" },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;
type Story = StoryObj<typeof ThemeCustomizer>;

/** Temanın uygulandığı örnek uygulama yüzeyi — mod, renk ve yoğunluk burada görünür. */
const PreviewSurface = React.forwardRef<HTMLDivElement, { className?: string }>(function PreviewSurface({ className }, ref) {
  return (
    <div ref={ref} className={`rounded-xl border border-mari-border bg-mari-surface p-5 text-mari-foreground ${className ?? ""}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Siparişler</h3>
        <Tag color="primary" variant="soft">
          12 yeni
        </Tag>
      </div>
      <div className="flex flex-col gap-3">
        <Input aria-label="Sipariş ara" placeholder="Sipariş ara" />
        <Switch label="Yalnız bekleyenler" defaultChecked />
        <div className="flex flex-wrap gap-2">
          <Button>Kaydet</Button>
          <Button variant="outline">Vazgeç</Button>
          <Button variant="ghost">Daha fazla</Button>
        </div>
      </div>
    </div>
  );
});

export const Playground: Story = {
  ...storyDoc(
    "Tüm props'ları canlı deneyin. Tema sağdaki önizleme yüzeyine uygulanır.",
    (args) => `
const preview = useRef<HTMLDivElement>(null);

<ThemeCustomizer ${jsxProps(args)} target={preview} />
<main ref={preview} className="rounded-xl border border-mari-border bg-mari-surface p-5 text-mari-foreground">
  <Button>Kaydet</Button>
</main>`
  ),
  args: { apply: true, sections: ["mode", "color", "spacing"], allowCustom: true, disabled: false, skeleton: false },
  render: (args) => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <ThemeCustomizer {...args} target={ref} />
        <PreviewSurface ref={ref} />
      </div>
    );
  },
};

/* ─────────────────────────── 1. Ayarlar çekmecesi ─────────────────────────── */

export const SettingsDrawer: Story = {
  name: "Ayarlar Çekmecesi",
  ...storyDoc(
    "Üst çubuktaki düğme çekmeceyi açar; seçim anında uygulanır, çekmece kapanınca tema korunur (geri alınmaz). Çekmece " +
      "kapalıyken bileşen yoktur, değer bu yüzden üstte tutulur.",
    `
const [theme, setTheme] = useState<ThemeSettings>(defaultThemeSettings);
const [open, setOpen] = useState(false);

<Button variant="ghost" icon={<SettingsIcon />} aria-label="Görünüm ayarları" onClick={() => setOpen(true)} />
<Drawer open={open} onClose={() => setOpen(false)} title="Görünüm" size="sm">
  <ThemeCustomizer value={theme} onChange={setTheme} />
</Drawer>`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const [theme, setTheme] = useState<ThemeSettings>({ mode: "light", spacing: "normal" });
    const [open, setOpen] = useState(false);
    return (
      <div className="max-w-2xl">
        <div ref={ref} className="overflow-hidden rounded-xl border border-mari-border bg-mari-surface text-mari-foreground">
          <div className="flex items-center justify-between border-b border-mari-border px-4 py-2">
            <span className="text-sm font-semibold">Mağaza Paneli</span>
            <Button variant="ghost" icon={<SettingsIcon />} aria-label="Görünüm ayarları" onClick={() => setOpen(true)} />
          </div>
          <div className="p-4">
            <PreviewSurface className="border-0 p-0" />
          </div>
        </div>
        <Drawer open={open} onClose={() => setOpen(false)} title="Görünüm" size="sm">
          <ThemeCustomizer value={theme} onChange={setTheme} target={ref} allowCustom />
        </Drawer>
      </div>
    );
  },
};

/* ─────────────────────────── 2. Kalıcılık ─────────────────────────── */

const STORAGE_KEY = "mari-story-theme";

export const Persistence: Story = {
  name: "Kalıcılık (localStorage)",
  ...storyDoc(
    "Seçim `onChange`te `saveTheme` ile kaydedilir; sayfa yenilenince aynı tema gelir. Yenilemede eski temanın bir an " +
      "görünmemesi (FOUC) için `getThemeScript()` çıktısını `<head>`e satır içi script olarak koyun — sayfa çizilmeden önce " +
      "çalışır, framework'ten bağımsızdır.",
    `
// <head> içinde, stylesheet'ten sonra — framework fark etmez:
//   React (SSR/SPA): <script dangerouslySetInnerHTML={{ __html: getThemeScript() }} />
//   Düz HTML/Vite  : getThemeScript() çıktısını build ya da sunucu şablonunda <script> içine yazın

// Uygulama açılışı (bir kez, istemcide):
applyTheme(loadTheme());

// Ayarlar ekranı:
<ThemeCustomizer defaultValue={loadTheme()} onChange={(next) => saveTheme(next)} />`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const [saved] = useState(() => loadTheme(STORAGE_KEY));
    return (
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <ThemeCustomizer defaultValue={saved} target={ref} onChange={(next) => saveTheme(next, STORAGE_KEY)} />
          <p className="text-xs text-mari-muted">Bir seçim yapıp sayfayı yenileyin.</p>
        </div>
        <PreviewSurface ref={ref} />
      </div>
    );
  },
};

/* ─────────────────────────── 3. Yalnız koyu mod ─────────────────────────── */

export const ModeOnly: Story = {
  name: "Yalnız Mod",
  ...storyDoc(
    "`sections` ile bölüm seçilir — profil menüsünde yalnız Açık/Koyu/Sistem.",
    `<ThemeCustomizer sections={["mode"]} />`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="max-w-xs">
          <ThemeCustomizer sections={["mode"]} target={ref} />
        </div>
        <PreviewSurface ref={ref} />
      </div>
    );
  },
};

/* ─────────────────────────── 4. Kendi paletiniz ─────────────────────────── */

export const CustomPalette: Story = {
  name: "Kendi Paletiniz",
  ...storyDoc(
    "`colors` hazır renkleri değiştirir (\"Varsayılan\" hep ilk sırada). Her renge erişilebilir bir ad verin.",
    `
<ThemeCustomizer
  sections={["color"]}
  colors={[
    { value: "#0f766e", label: "Okyanus" },
    { value: "#7c3aed", label: "Lavanta" },
    { value: "#be123c", label: "Nar" },
  ]}
/>`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <ThemeCustomizer
          sections={["color"]}
          target={ref}
          colors={[
            { value: "#0f766e", label: "Okyanus" },
            { value: "#7c3aed", label: "Lavanta" },
            { value: "#be123c", label: "Nar" },
          ]}
        />
        <PreviewSurface ref={ref} />
      </div>
    );
  },
};

/* ─────────────────────────── 5. İskelet ─────────────────────────── */

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<ThemeCustomizer skeleton />`),
  render: () => (
    <SkeletonDemo className="w-full max-w-sm">{(skeleton) => <ThemeCustomizer skeleton={skeleton} apply={false} allowCustom />}</SkeletonDemo>
  ),
};
