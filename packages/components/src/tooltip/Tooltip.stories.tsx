import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Bold, Info, Italic, Underline } from "lucide-react";
import { Button } from "../button";
import { colorArgType, placementArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Tooltip } from "./Tooltip";

const meta: Meta<typeof Tooltip> = {
  title: "Veri Gösterimi/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary: "Bir elemanın üzerine gelindiğinde veya odaklanıldığında kısa bir açıklama gösteren balon.",
          whenToUse: ["Bir ikon-only butonun/kontrolün ne işe yaradığını kısaca açıklamak için."],
          whenNotToUse: ["Kritik bilgi taşıyorsa — tooltip'ler dokunmatik cihazlarda güvenilir açılmaz, önemli bilgiyi görünür metinde tutun."],
          a11y:
            "Fare (`hover`, `openDelay` sonra) kadar klavye/odak (`focus`, anında) ile de açılır; balon `role=\"tooltip\"` taşır ve trigger'a " +
            "`aria-describedby` ile bağlanır; `Escape` kapatır. Balonun **üzerine gelinebilir** (WCAG 1.4.13) — fare tetikleyiciden balona geçerken kapanmaz. " +
            "Tetikleyici odaklanabilir olmalı (buton/link); çıplak bir ikon klavyeyle hiç açılamaz. Konum 12 yönlüdür, yer yoksa karşı yöne döner ve " +
            "balon her zaman ekran içinde kalır (mobilde en fazla ekran genişliği).",
        }),
      },
    },
  },
  argTypes: {
    content: { control: "text", description: "Balon içinde gösterilecek içerik." },
    trigger: { control: false, description: "Üzerine gelindiğinde/odaklanıldığında tooltip'i tetikleyecek eleman." },
    placement: placementArgType,
    color: { ...colorArgType, description: "Balonun rengi. Varsayılan: `neutral` (koyu tooltip)." },
    variant: {
      control: "select",
      options: ["solid", "soft"],
      description: "`solid` (varsayılan) dolu/koyu balon. `soft` daha az göze batan, tonlanmış bir arka plan kullanır.",
    },
    alwaysVisible: { control: "boolean", description: "Hover/focus beklemeden her zaman görünür yapar." },
    disabled: { control: "boolean", description: "Tooltip'i tamamen devre dışı bırakır (hiç render edilmez)." },
    openOn: { control: "inline-radio", options: ["hover", "click"], description: "`click`: tıklayınca açılır/kapanır; dışarı tıklama ve Escape kapatır.", table: { defaultValue: { summary: "hover" } } },
    openDelay: { control: "number", description: "Fareyle açılma gecikmesi (ms).", table: { defaultValue: { summary: "100" } } },
    skeleton: { control: "boolean", description: "İçerik yüklenirken balonda yer tutucu çizgiler (`aria-busy`).", table: { defaultValue: { summary: "false" } } },
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Tooltip tetikleyiciye `aria-describedby` ekler — özel bir bileşen bunu
// gerçek DOM öğesine İLETMELİ (`...rest`), yoksa açıklama ekran okuyucuya ulaşmaz.
const InfoButton = ({ label, ...rest }: { label: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    type="button"
    aria-label={label}
    className="rounded-full p-1 text-mari-muted hover:text-mari-foreground focus-visible:outline-2 focus-visible:outline-mari-ring"
    {...rest}
  >
    <Info size={18} />
  </button>
);

export const Playground: Story = {
  ...storyDoc("Fareyle üzerine gelin veya Tab'layarak odaklanın — ikisi de tooltip'i açar. Fareyi balona taşıyın: kapanmaz."),
  args: { content: "Bu bir tooltip", placement: "top", color: "neutral", trigger: <Button variant="soft">Üzerine gel / Tab&apos;la</Button> },
  // Balon üste açıldığı için üstte boşluk — Storybook araç çubuğuyla çakışmasın.
  decorators: [(Story) => <div className="pt-16">{Story()}</div>],
};

const PLACEMENTS = [
  ["top-start", "top", "top-end"],
  ["left-start", "left", "left-end"],
  ["right-start", "right", "right-end"],
  ["bottom-start", "bottom", "bottom-end"],
] as const;

export const EdgeOfScreen: Story = {
  name: "Uzun İçerik (solda, sağa açılır)",
  ...storyDoc(
    "Solda duran bir tetikleyici, balon sağa açılır (`placement=\"right\"`); uzun içerik 20rem'de kırılır. Sağda yer kalmazsa (dar ekran) balon sola, o da yoksa üste/alta döner ve her zaman ekran içinde, tetikleyicisine bağlı kalır.",
    `<Tooltip placement="right" content="Bu kampanya yalnızca uygulama üzerinden verilen ve 500 TL üzeri siparişlerde geçerlidir." trigger={<InfoButton label="Kampanya koşulları" />} />`
  ),
  render: () => (
    <div className="flex justify-start py-10">
      <Tooltip
        placement="right"
        alwaysVisible
        content="Bu kampanya yalnızca uygulama üzerinden verilen ve 500 TL üzeri siparişlerde geçerlidir. Diğer indirimlerle birleştirilemez."
        trigger={<InfoButton label="Kampanya koşulları" />}
      />
    </div>
  ),
};

export const ClickToToggle: Story = {
  name: "Tıklayınca Aç/Kapat",
  ...storyDoc(
    "`openOn=\"click\"` — üzerine gelmek açmaz; tetikleyiciye tıklamak açar, tekrar tıklamak, dışarı tıklamak ya da Escape kapatır. Dokunmatik ekranlarda ve " +
      "okunması zaman alan açıklamalarda (form alanı yardımı) uygundur. Tetikleyici `aria-expanded` ile açık/kapalı durumunu duyurur.",
    `<Tooltip
  openOn="click"
  placement="right"
  content="Kart üzerindeki 3 haneli güvenlik kodu, imza alanının yanındadır."
  trigger={<InfoButton label="CVV nedir?" />}
/>`
  ),
  render: () => (
    <div className="flex max-w-sm flex-col gap-1.5 py-6">
      <span className="flex items-center gap-1 text-sm font-medium text-mari-foreground">
        CVV
        <Tooltip
          openOn="click"
          placement="right"
          content="Kart üzerindeki 3 haneli güvenlik kodu, imza alanının yanındadır."
          trigger={<InfoButton label="CVV nedir?" />}
        />
      </span>
      <input aria-label="CVV" className="h-8 w-24 rounded-md border border-mari-input bg-mari-surface px-3 text-sm" inputMode="numeric" maxLength={3} />
    </div>
  ),
};

export const IconToolbar: Story = {
  name: "İkon Araç Çubuğu",
  ...storyDoc(
    "İkon-only butonların görünür bir etiketi yok — tooltip görsel ipucu, `aria-label` ekran okuyucu adı. Araç çubuğunda gezinirken tooltip'ler 100ms gecikmeyle açılır, titremez.",
    `<Tooltip content="Kalın" trigger={<Button variant="ghost" size="sm" aria-label="Kalın" icon={<Bold size={16} />} />} />`
  ),
  render: () => (
    <div className="pt-12">
      <div className="flex w-fit items-center gap-1 rounded-lg border border-mari-border p-1">
        <Tooltip content="Kalın (Ctrl+B)" trigger={<Button variant="ghost" size="sm" aria-label="Kalın" icon={<Bold size={16} />} />} />
        <Tooltip content="İtalik (Ctrl+I)" trigger={<Button variant="ghost" size="sm" aria-label="İtalik" icon={<Italic size={16} />} />} />
        <Tooltip content="Altı çizili (Ctrl+U)" trigger={<Button variant="ghost" size="sm" aria-label="Altı Çizili" icon={<Underline size={16} />} />} />
      </div>
    </div>
  ),
};

function UserPreview({ skeleton }: { skeleton: boolean }) {
  return (
    <div className="pt-20">
      <Tooltip
        placement="top-start"
        skeleton={skeleton}
        alwaysVisible
        content={
          <span className="flex flex-col">
            <span className="font-medium">Aykut Yılmaz</span>
            {/* Soluklaştırma yok: koyu balonda opacity-80 kontrastı 4.27:1'e düşürüyordu (axe). Hiyerarşi text-xs'ten. */}
            <span className="text-xs">Ürün tasarımcısı · İstanbul</span>
          </span>
        }
        trigger={
          <button type="button" className="font-medium text-mari-primary underline">
            @aykut
          </button>
        }
      />
    </div>
  );
}

export const AllPlacements: Story = {
  name: "Tüm Konumlar (12)",
  ...storyDoc(
    "12 yerleşim: ana yön + hiza (`-start`/`-end` balonu tetikleyicinin o kenarına yaslar). Ok her zaman tetikleyicinin ortasını gösterir. Tab ile gezinin.",
    `<Tooltip placement="bottom-start" content="Dışa aktar" trigger={<Button>…</Button>} />`
  ),
  render: () => (
    <div className="grid w-fit grid-cols-3 gap-x-10 gap-y-12 px-24 py-16">
      {PLACEMENTS.flat().map((placement) => (
        <Tooltip key={placement} placement={placement} content={placement} trigger={<Button size="sm" variant="outline" color="neutral">{placement}</Button>} />
      ))}
    </div>
  ),
};

export const AllVariants: Story = {
  name: "Tüm Varyantlar",
  ...storyDoc(
    "`solid` (varsayılan, dolu koyu balon) ve `soft` (tonlanmış, daha az göze batan) — her renk rolüyle kullanılabilir.",
    `<Tooltip variant="soft" color="info" content="Bilgi" trigger={<InfoButton />} />`
  ),
  render: () => (
    <div className="flex flex-wrap gap-x-24 gap-y-6 p-4">
      {(["solid", "soft"] as const).map((variant) => (
        <div key={variant} className="flex flex-col gap-4">
          <span className="text-sm font-medium text-mari-muted">{variant}</span>
          {(["primary", "accent", "success", "warning", "error", "info", "neutral"] as const).map((color) => (
            <Tooltip key={color} content={color} color={color} variant={variant} alwaysVisible placement="right" trigger={<InfoButton label={`${variant} ${color}`} />} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — balon içeriği sunucudan geliyorsa (kullanıcı önizlemesi gibi) önce yer tutucu çizgiler, sonra içerik. Balon `aria-busy`.",
    `<Tooltip skeleton={!user} content={<UserCard user={user} />} trigger={<a href="/u/aykut">@aykut</a>} />`
  ),
  render: () => <SkeletonDemo>{(skeleton) => <UserPreview skeleton={skeleton} />}</SkeletonDemo>,
};
