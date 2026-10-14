/**
 * Faz 13.6: gerçek senaryolar — kaydedildi, geri al, ödeme hatası, bağlantı
 * uyarısı, konumlar. Her story kendi `ToastProvider`'ını decorator ile alır.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Trash2Icon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Toast } from "./Toast";
import { ToastProvider, useToast } from "./useToast";
import type { ToastPosition } from "./types";
import { Button } from "../button";

const meta: Meta<typeof Toast> = {
  title: "Geri Bildirim/Toast",
  component: Toast,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      story: { inline: false, height: "420px" },
      description: {
        component: componentDoc({
          summary:
            "Akışı durdurmadan kısa bir geri bildirim. Uygulamayı bir kez `<ToastProvider>` ile sarın, her yerden " +
            "`const { showToast, dismiss, update } = useToast()` ile gösterin. `showToast` bir `id` döndürür; " +
            "`update(id, …)` açık toast'u değiştirir. Seçenekler: `type`, `description`, `action` (ör. \"Geri al\"), " +
            "`duration` (`0` = kalıcı), `position`, `onClose`, `skeleton`. " +
            "Konum başına en fazla 4 toast; mobilde kenardan kenara.",
          whenToUse: [
            "Bir işlemin sonucu: kaydedildi, gönderildi, silindi (\"Geri al\" ile).",
            "Arka planda olan bir şey: bağlantı koptu/geldi, dışa aktarma hazır.",
          ],
          whenNotToUse: [
            "Kullanıcının mutlaka görmesi ve karar vermesi gereken durumlar — Modal.",
            "Bir form alanının hatası — hatayı alanın yanında gösterin.",
          ],
          a11y:
            "Duyuru Provider'daki kalıcı canlı bölgelerden yapılır: normal toast'lar `role=\"status\"` (polite), " +
            "`type=\"error\"` `role=\"alert\"` (assertive). Kapat ve aksiyon gerçek düğmelerdir. Üzerine gelince ya da " +
            "içindeki bir düğme odaktayken sayaç durur (WCAG 2.2.1); aksiyonlu toast'lar varsayılan 8 sn kalır. Kritik " +
            "hatalar için `duration={0}`.",
        }),
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

function PlaygroundToast(props: Readonly<{ type: "info" | "success" | "warning" | "error"; title: string; description: string; duration: number; position: ToastPosition }>) {
  const { showToast } = useToast();
  return <Button onClick={() => showToast(props)}>Bildirim göster</Button>;
}

export const Playground: StoryObj<React.ComponentProps<typeof PlaygroundToast>> = {
  ...storyDoc("`showToast` seçenekleri: tip, başlık, açıklama, süre (0 = kapatılana kadar), konum.", `showToast({ type: "success", title: "Kaydedildi" })`),
  args: { type: "success", title: "Değişiklikler kaydedildi", description: "Ekip güncel sürümü görüyor.", duration: 5000, position: "topRight" },
  argTypes: {
    type: { control: "inline-radio", options: ["info", "success", "warning", "error"] },
    position: { control: "select", options: ["top", "topLeft", "topRight", "bottom", "bottomLeft", "bottomRight"] },
  },
  render: (args) => <PlaygroundToast {...args} />,
};

/* ─────────────────────────── Senaryolar ─────────────────────────── */

export const Scenarios: Story = {
  name: "Senaryolar",
  ...storyDoc(
    "Dört yaygın durum. \"Sil\" → `action` ile Geri al (8 sn, üzerine gelince durur). \"Ödeme hatası\" → " +
      "`type=\"error\"`, `duration={0}` — kullanıcı kapatana kadar kalır ve `role=\"alert\"` ile hemen okunur.",
    `
const { showToast } = useToast();

showToast({ type: "success", title: "Değişiklikler kaydedildi" });

showToast({
  title: "3 dosya çöp kutusuna taşındı",
  action: { label: "Geri al", onClick: restore },
});

showToast({
  type: "error",
  title: "Ödeme reddedildi",
  description: "Kartınız bankanız tarafından onaylanmadı. Başka bir kart deneyin.",
  duration: 0,
});`
  ),
  render: () => {
    const { showToast, dismiss } = useToast();
    const [files, setFiles] = useState(12);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        <p className="text-sm text-mari-muted">
          Klasörde <span className="font-medium tabular-nums text-mari-foreground">{files}</span> dosya var.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => showToast({ type: "success", title: "Değişiklikler kaydedildi", description: "Tüm ekip üyeleri güncel sürümü görüyor." })}>
            Kaydet
          </Button>
          <Button
            variant="outline"
            color="neutral"
            icon={<Trash2Icon size={16} aria-hidden />}
            onClick={() => {
              setFiles((n) => n - 3);
              showToast({ title: "3 dosya çöp kutusuna taşındı", action: { label: "Geri al", onClick: () => setFiles((n) => n + 3) } });
            }}
          >
            3 dosyayı sil
          </Button>
          <Button
            variant="outline"
            color="error"
            onClick={() =>
              showToast({
                type: "error",
                title: "Ödeme reddedildi",
                description: "Kartınız bankanız tarafından onaylanmadı. Başka bir kart deneyin.",
                duration: 0,
              })
            }
          >
            Ödeme hatası
          </Button>
          <Button
            variant="outline"
            color="neutral"
            onClick={() =>
              showToast({ type: "warning", title: "Bağlantı koptu", description: "Değişiklikleriniz çevrimiçi olunca eşitlenecek." })
            }
          >
            Bağlantı uyarısı
          </Button>
          <Button variant="ghost" color="neutral" onClick={() => dismiss()}>
            Hepsini kapat
          </Button>
        </div>
      </div>
    );
  },
};

/* ─────────────────────────── Konumlar ─────────────────────────── */

export const Positions: Story = {
  name: "Konumlar",
  ...storyDoc("`position` — altı konum. Aynı konumdakiler istiflenir (en fazla 4); mobilde kenardan kenara.", `showToast({ type: "info", title: "Dışa aktarma hazır", description: "rapor-eylul.csv · 1,2 MB", position: "topRight" })`),
  render: () => {
    const { showToast } = useToast();
    const positions: ToastPosition[] = ["topLeft", "top", "topRight", "bottomLeft", "bottom", "bottomRight"];
    return (
      <div className="grid max-w-md grid-cols-3 gap-2">
        {positions.map((position) => (
          <Button key={position} size="sm" variant="outline" color="neutral" onClick={() => showToast({ type: "info", title: "Dışa aktarma hazır", description: "rapor-eylul.csv · 1,2 MB", position })}>
            {position}
          </Button>
        ))}
      </div>
    );
  },
};

/* ─────────────────────────── Statik kart ─────────────────────────── */

export const Types: Story = {
  name: "Tipler (Statik)",
  ...storyDoc("`Toast` kartı tek başına — dört durum tipi ve `none`.", `<Toast type="success" title="Kaydedildi" />`),
  render: () => (
    <div className="flex flex-col gap-3">
      <Toast type="success" title="Değişiklikler kaydedildi" description="Tüm ekip üyeleri güncel sürümü görüyor." />
      <Toast type="info" title="Dışa aktarma hazır" description="rapor-eylul.csv · 1,2 MB" action={{ label: "İndir", onClick: () => {} }} />
      <Toast type="warning" title="Bağlantı koptu" description="Değişiklikleriniz çevrimiçi olunca eşitlenecek." />
      <Toast type="error" title="Ödeme reddedildi" description="Başka bir kart deneyin." />
      <Toast title="3 dosya çöp kutusuna taşındı" action={{ label: "Geri al", onClick: () => {} }} />
      <Toast skeleton type="info" title="Dışa aktarma hazır" description="rapor-eylul.csv · 1,2 MB" action={{ label: "İndir", onClick: () => {} }} />
    </div>
  ),
};

/* ─────────────────────────── İskelet → içerik ─────────────────────────── */

export const SkeletonUpdate: Story = {
  name: "İskelet",
  ...storyDoc(
    "Sonucu henüz belli olmayan bir arka plan işi: toast `skeleton` ile açılır (içeriğin kendi şeklinde iskelet, " +
      "Kapat çalışır, sayaç işlemez, ekran okuyucuya duyurulmaz), iş bitince `update(id, { skeleton: false, … })` " +
      "ile gerçek içeriğe döner — o anda duyurulur ve kapanma sayacı başlar. Aksiyonu (İndir) baştan verin: " +
      "iskelette tıklanamaz ama yerini tutar, yüklenince toast zıplamaz.",
    `
const { showToast, update } = useToast();
const id = showToast({
  skeleton: true,
  type: "info",
  title: "Dışa aktarma hazır",
  description: "rapor-eylul.csv · —",
  action: { label: "İndir", onClick: download },
});
const file = await exportReport();
update(id, { skeleton: false, description: \`\${file.name} · \${file.size}\` });`
  ),
  render: () => {
    const { showToast, update } = useToast();
    return (
      <Button
        onClick={() => {
          const id = showToast({
            skeleton: true,
            type: "info",
            title: "Dışa aktarma hazır",
            description: "rapor-eylul.csv · —",
            action: { label: "İndir", onClick: () => {} },
          });
          setTimeout(() => update(id, { skeleton: false, description: "rapor-eylul.csv · 1,2 MB" }), 1500);
        }}
      >
        Raporu dışa aktar
      </Button>
    );
  },
};
