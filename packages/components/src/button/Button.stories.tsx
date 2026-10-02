import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Download, Search, Sparkles, Trash2 } from "lucide-react";
import { colorArgType, disabledArgType, sizeArgType, variantArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Button } from "./Button";
import type { ButtonProps } from "./types";

const meta: Meta<ButtonProps> = {
  title: "Genel/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir aksiyonu tetiklemek için temel etkileşim öğesi. `href` verilirse `<a>`, verilmezse `<button>` render eder — " +
            "link ve buton davranışını tek bir API'de birleştirir. Hook kullanmaz, sunucu bileşeni olarak render edilebilir " +
            "(`onClick` verildiğinde React etkileşimi otomatik olarak client boundary'sine taşır).",
          whenToUse: [
            "Bir formu göndermek, bir diyalog açmak veya bir işlemi başlatmak gibi tekil bir aksiyon için.",
            "Bir sayfadaki birincil eylemi (`variant=\"solid\"`) ve ona eşlik eden ikincil eylemleri (`outline`/`soft`/`ghost`) ayırmak için.",
            "Başka bir sayfaya götüren ama buton gibi görünmesi gereken bir bağlantı için (`href`).",
          ],
          whenNotToUse: [
            "Sırf metin içi gezinme bağlantısı için — düz bir `<a>` yeterli.",
            "Aç/kapa durumu için — `Switch` veya `Checkbox` kullanın.",
          ],
          a11y:
            "`aria-label` dahil tüm native attribute'ları geçirir — **sadece ikon içeren** butonlarda mutlaka `aria-label` verin. " +
            "Metinsiz bir butonda `aria-label` unutulursa geliştirme modunda konsola uyarı düşer. " +
            "Odak halkası `focus-visible` ile `--mari-color-ring` renginde çizilir. `disabled`/`loading` iken native `disabled` kullanılır (imleç `not-allowed` gösterir).",
        }),
      },
    },
  },
  argTypes: {
    children: { control: "text", description: "Buton etiketi." },
    color: colorArgType,
    variant: variantArgType,
    size: sizeArgType,
    shape: { control: "select", options: ["default", "pill", "circle", "square"], description: "Geometri — `circle` ikon-only butonlar içindir.", table: { defaultValue: { summary: "default" } } },
    icon: {
      control: "select",
      options: ["yok", "Sparkles", "Download"],
      mapping: { yok: undefined, Sparkles: <Sparkles className="w-4 h-4" />, Download: <Download className="w-4 h-4" /> },
      description: "Etiketle birlikte gösterilecek ikon.",
    },
    iconPosition: { control: "select", options: ["start", "end"], description: "İkonun etikete göre konumu.", table: { defaultValue: { summary: "start" } } },
    loading: { control: "boolean", description: "Bir EYLEM sürüyor. `true` verilince dönen bir gösterge çıkar ve buton **daima devre dışı** olur (çift gönderim engellenir). `{ icon, iconPosition, delay }` ile özelleştirilir — `delay` (ms) kısa işlemlerde göstergenin titremesini önler.", table: { defaultValue: { summary: "false" } } },
    skeleton: { control: "boolean", description: "VERİ henüz yok — buton yerine aynı boyutta iskelet çizer (yüklenince kutu zıplamaz).", table: { defaultValue: { summary: "false" } } },
    block: { control: "boolean", description: "Tam genişlik kaplar." },
    disabled: disabledArgType,
    href: { control: "text", description: "Verilirse `<a>` olarak render edilir." },
  },
};
export default meta;

type Story = StoryObj<ButtonProps>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin. Diğer örnekler tekil senaryoları sabitler."),
  args: {
    children: "Buton",
    color: "primary",
    variant: "solid",
    size: "md",
    shape: "default",
    iconPosition: "start",
    loading: false,
    skeleton: false,
    block: false,
    disabled: false,
  },
};

export const AsLink: Story = {
  name: "Link Olarak",
  ...storyDoc("`href` verilince `<a>` render edilir; görünüm aynı kalır, `disabled` iken tekrar `<button>`'a düşer."),
  args: { href: "https://example.com", target: "_blank", children: "Dış Bağlantı" },
};

export const FormActions: Story = {
  name: "Form Aksiyonları (responsive)",
  ...storyDoc(
    "Bir formun alt çubuğu: tek bir birincil eylem (`solid`), yanında ikincil (`outline`) ve yıkıcı eylem (`ghost` + `error`) en solda. " +
      "Mobilde butonlar tam genişliğe yayılır ve birincil eylem başparmağa en yakın yere — en alta — iner.",
    `<div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
  <Button variant="ghost" color="error" icon={<Trash2 className="w-4 h-4" />} className="w-full sm:mr-auto sm:w-auto">
    Taslağı sil
  </Button>
  <Button variant="outline" color="neutral" className="w-full sm:w-auto">Vazgeç</Button>
  <Button className="w-full sm:w-auto">Yayınla</Button>
</div>`
  ),
  render: () => (
    <div className="flex max-w-2xl flex-col-reverse gap-2 border-t border-mari-border pt-4 sm:flex-row sm:items-center">
      <Button variant="ghost" color="error" icon={<Trash2 className="w-4 h-4" />} className="w-full sm:mr-auto sm:w-auto">
        Taslağı sil
      </Button>
      <Button variant="outline" color="neutral" className="w-full sm:w-auto">
        Vazgeç
      </Button>
      <Button className="w-full sm:w-auto">Yayınla</Button>
    </div>
  ),
};

function DelayedLoadingDemo() {
  const [busy, setBusy] = useState<"fast" | "slow" | null>(null);
  const run = (kind: "fast" | "slow") => {
    setBusy(kind);
    setTimeout(() => setBusy(null), kind === "fast" ? 200 : 2000);
  };
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button loading={busy === "fast" ? { delay: 300 } : false} onClick={() => run("fast")}>
        Hızlı işlem (200ms)
      </Button>
      <Button loading={busy === "slow" ? { delay: 300 } : false} onClick={() => run("slow")} icon={<Download className="w-4 h-4" />}>
        Yavaş işlem (2sn)
      </Button>
    </div>
  );
}

export const DelayedLoading: Story = {
  name: "Gecikmeli Yükleme",
  ...storyDoc(
    "`loading={{ delay: 300 }}`: buton tıklandığı an devre dışı olur ama gösterge ancak 300ms sonra belirir. " +
      "Hızlı işlemde hiç spinner titremez; yavaş işlemde gösterge yumuşakça gelir.",
    `const [saving, setSaving] = useState(false);

<Button loading={saving ? { delay: 300 } : false} onClick={save}>
  Kaydet
</Button>`
  ),
  render: () => <DelayedLoadingDemo />,
};

function ButtonSkeleton() {
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button skeleton={skeleton} icon={<Search className="w-4 h-4" />}>Ara</Button>
            <Button skeleton={skeleton} variant="outline" color="neutral">Filtreleri temizle</Button>
            <Button skeleton={skeleton} size="lg">Sepete ekle</Button>
            <Button skeleton={skeleton} shape="circle" icon={<Sparkles className="w-4 h-4" />} aria-label="Öne çıkar" />
          </div>
        </div>
      )}
    </SkeletonDemo>
  );
}

export const LongLabel: Story = {
  name: "Uzun Etiket (dar alan)",
  ...storyDoc(
    "Etiket tek satırda kalır; kapsayıcıdan geniş olursa `…` ile kısalır — sabit yükseklikli buton iki satıra taşmaz.",
    `<div className="w-48">
  <Button block>Tüm bildirimleri okundu olarak işaretle</Button>
</div>`
  ),
  render: () => (
    <div className="w-48 rounded-lg border border-dashed border-mari-border p-2">
      <Button block>Tüm bildirimleri okundu olarak işaretle</Button>
    </div>
  ),
};


export const AllVariants: Story = {
  name: "Tüm Renk × Varyant Kombinasyonları",
  ...storyDoc(
    "7 renk rolü (`primary`/`accent`/`success`/`error`/`warning`/`info`/`neutral`) × 5 varyant. Renkler tema stüdyosunda çalışma zamanında değişebilir.",
    `<Button color="primary" variant="solid">Kaydet</Button>
<Button color="neutral" variant="outline">Vazgeç</Button>
<Button color="error" variant="soft">Sil</Button>
<Button color="primary" variant="ghost">Detay</Button>
<Button color="primary" variant="link">Daha fazla</Button>`
  ),
  render: () => {
    const colors = ["primary", "accent", "success", "error", "warning", "info", "neutral"] as const;
    const variants = ["solid", "outline", "soft", "ghost", "link"] as const;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {colors.map((color) =>
          variants.map((variant) => (
            <Button key={`${color}-${variant}`} color={color} variant={variant}>
              {color} {variant}
            </Button>
          ))
        )}
      </div>
    );
  },
};

export const Sizes: Story = {
  name: "Boyutlar",
  ...storyDoc(
    "`xs`–`xl` paylaşılan boyut ölçeğinden (`lib/sizeClasses`) — 20/24/32/40/48px yükseklik. Dokunmatik ekranda birincil eylemler için `lg`/`xl` tercih edin.",
    `<Button size="xs">xs</Button>
<Button size="sm">sm</Button>
<Button size="md">md</Button>
<Button size="lg">lg</Button>
<Button size="xl">xl</Button>`
  ),
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size={size}>
          {size}
        </Button>
      ))}
    </div>
  ),
};

export const Shapes: Story = {
  name: "Şekiller",
  ...storyDoc(
    "`default` / `pill` / `square` / `circle`. `default` köşesi tema radius preset'ini izler; `circle` ikon-only butonlar içindir ve `aria-label` ister.",
    `<Button shape="default">Varsayılan</Button>
<Button shape="pill">Hap</Button>
<Button shape="square">Kare</Button>
<Button shape="circle" icon={<Sparkles className="w-4 h-4" />} aria-label="Yıldız" />`
  ),
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button shape="default">Varsayılan</Button>
      <Button shape="pill">Hap</Button>
      <Button shape="square">Kare</Button>
      <Button shape="circle" icon={<Sparkles className="w-4 h-4" />} aria-label="Yıldız" />
    </div>
  ),
};

export const States: Story = {
  name: "Durumlar",
  ...storyDoc(
    "Normal, `disabled`, `loading` ve ikonlu. `loading` durumunda daima bir dönen gösterge çıkar ve buton otomatik olarak devre dışı olur — ayrıca `disabled` vermeye gerek yoktur.",
    `<Button>Normal</Button>
<Button disabled>Devre dışı</Button>
<Button loading>Yükleniyor</Button>
<Button loading variant="outline">Kaydediliyor</Button>
<Button icon={<Sparkles className="w-4 h-4" />}>İkonlu</Button>`
  ),
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Normal</Button>
      <Button disabled>Devre dışı</Button>
      <Button loading>Yükleniyor</Button>
      <Button loading variant="outline">
        Kaydediliyor
      </Button>
      <Button icon={<Sparkles className="w-4 h-4" />}>İkonlu</Button>
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — veri henüz gelmemişken buton yerine aynı boyutta (aynı genişlik, yükseklik, radius) bir yer tutucu. " +
      "`loading`'den farkı: `loading` bir eylemin sürdüğünü, `skeleton` verinin henüz olmadığını anlatır. Kutuyu işaretleyip kaldırın — satır zıplamaz.",
    `<Button skeleton={isLoading}>Ara</Button>
<Button skeleton={isLoading} size="lg">Sepete ekle</Button>`
  ),
  render: () => <ButtonSkeleton />,
};
