/**
 * Faz 16.2: gerçek senaryolar — ödeme hatası (eylemli), deneme süresi şeridi
 * (banner), kaydetme sonrası başarı (kapatılabilir), bakım duyurusu.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { Alert } from "./Alert";
import { Button } from "../button";

const meta: Meta<typeof Alert> = {
  title: "Geri Bildirim/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Sayfanın ya da bir bölümün içinde KALICI duran bir mesaj: hata, uyarı, başarı, bilgi. Başlık + açıklama, durum " +
            "ikonu, sağda eylem (dar ekranda altta), `closable` ile kapatılabilir. `banner`: sayfa/kart üstünde tam genişlik " +
            "şerit.",
          whenToUse: [
            "Kullanıcının okuması ve belki bir şey yapması gereken, bağlama bağlı mesaj (form üstünde hata özeti, ödeme hatası).",
            "Sayfa genelinde süren bir durum (deneme süresi, bakım) — `banner`.",
          ],
          whenNotToUse: [
            "Bir işlemin anlık, kendiliğinden kaybolan sonucu (\"Kaydedildi\") — Toast.",
            "Kullanıcıyı durdurup karar isteyen onay — Modal.",
          ],
          a11y:
            "`error`/`warning` `role=\"alert\"` (hemen duyurulur), diğerleri `role=\"status\"`; sayfa açılışında zaten duran bir " +
            "mesajda `role=\"none\"`. Renk tek başına anlam taşımaz — başlık ve metin durumu söyler, ikon görseldir. Metin gövde " +
            "renginde (renkli uzun metin okunmaz). Kapat düğmesi adlandırılmış, dokunmatikte 44px.",
        }),
      },
    },
  },
  argTypes: {
    title: { control: "text" },
    description: { control: "text" },
    color: { ...colorArgType, description: "Varsayılan: `info`." },
    icon: { control: "boolean" },
    action: { control: false },
    closable: { control: "boolean" },
    onClose: { table: { category: "Olaylar" } },
    banner: { control: "boolean" },
    role: { control: "inline-radio", options: [undefined, "alert", "status", "none"] },
    skeleton: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

/* ─────────────────────────── 1. Ödeme hatası ─────────────────────────── */

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    title: "Senkronizasyon başarısız",
    description: "Son 2 saatteki değişiklikler eşitlenmedi.",
    color: "error",
    icon: true,
    closable: true,
    banner: false,
    skeleton: false,
  },
  render: (args) => (
    <div className="max-w-xl">
      <Alert {...args} />
    </div>
  ),
};

export const PaymentFailed: Story = {
  name: "Ödeme Hatası (Eylemli)",
  ...storyDoc(
    "Hata ne olduğunu VE ne yapılacağını söyler; eylem sağda, dar ekranda metnin altına iner. `role=\"alert\"`: " +
      "ekran okuyucu hemen okur.",
    `
<Alert
  color="error"
  title="Ödeme alınamadı"
  description="Bankanız işlemi reddetti (yetersiz limit). Başka bir kartla deneyin ya da bankanızla görüşün."
  action={<Button size="sm" color="error" variant="outline">Başka kart</Button>}
/>`
  ),
  render: () => (
    <div className="max-w-xl">
      <Alert
        color="error"
        title="Ödeme alınamadı"
        description="Bankanız işlemi reddetti (yetersiz limit). Başka bir kartla deneyin ya da bankanızla görüşün."
        action={
          <Button size="sm" color="error" variant="outline">
            Başka kart
          </Button>
        }
      />
    </div>
  ),
};

/* ─────────────────────────── 2. Banner ─────────────────────────── */

export const TrialBanner: Story = {
  name: "Deneme Süresi Şeridi (banner)",
  ...storyDoc(
    "`banner`: kartın/sayfanın üstünde köşesiz şerit. Sayfa açılışında zaten duruyor — duyuru gerekmez: `role=\"none\"`.",
    `<Alert banner color="warning" role="none" description="Deneme sürenizin bitmesine 3 gün kaldı." action={<Button size="sm">Planı yükselt</Button>} />`
  ),
  render: () => (
    <div className="max-w-2xl overflow-hidden rounded-xl border border-mari-border bg-mari-surface">
      <Alert
        banner
        color="warning"
        role="none"
        description={
          <>
            Deneme sürenizin bitmesine <strong>3 gün</strong> kaldı. Verileriniz silinmez.
          </>
        }
        action={<Button size="sm">Planı yükselt</Button>}
      />
      <div className="p-5 text-sm text-mari-muted">Pano içeriği…</div>
    </div>
  ),
};

/* ─────────────────────────── 3. Kaydetme sonrası ─────────────────────────── */

export const SavedClosable: Story = {
  name: "Kaydetme Sonrası (Kapatılabilir)",
  ...storyDoc(
    "Kaydedince formun üstünde başarı mesajı; kullanıcı kapatabilir (`closable`, `onClose`). Kısa ve kendiliğinden " +
      "kaybolacaksa Toast daha uygun — burada ayrıntı (hangi cihazlar) okunması gereken bir bilgi.",
    `{saved && <Alert color="success" closable onClose={() => setSaved(false)} title="Bildirim ayarları kaydedildi" description="…" />}`
  ),
  render: () => {
    const [saved, setSaved] = useState(false);
    return (
      <div className="flex max-w-xl flex-col gap-4">
        {saved && (
          <Alert
            color="success"
            closable
            onClose={() => setSaved(false)}
            title="Bildirim ayarları kaydedildi"
            description="Değişiklikler 2 cihazınızda da (iPhone, MacBook) bir dakika içinde geçerli olur."
          />
        )}
        <Button className="self-start" onClick={() => setSaved(true)}>
          Kaydet
        </Button>
      </div>
    );
  },
};

/* ─────────────────────────── 4. Tüm renkler ─────────────────────────── */

export const Colors: Story = {
  name: "Renkler",
  ...storyDoc("Dört durum + başlıksız kısa mesaj.", `<Alert color="info" title="…" description="…" />`),
  render: () => (
    <div className="flex max-w-xl flex-col gap-3">
      <Alert color="info" title="Planlı bakım" description="Cumartesi 02:00–04:00 arasında raporlar güncellenmeyecek." />
      <Alert color="success" title="Alan adı doğrulandı" description="mari-ui.com artık e-posta gönderebilir." />
      <Alert color="warning" title="Depolamanın %90'ı dolu" description="Eski dosyaları silin ya da planınızı yükseltin." />
      <Alert color="error" title="Senkronizasyon başarısız" description="Son 2 saatteki değişiklikler eşitlenmedi." />
      <Alert color="neutral" description="Bu proje arşivlendi; yalnız görüntüleyebilirsiniz." />
    </div>
  ),
};

/* ─────────────────────────── İskelet ─────────────────────────── */

export const SkeletonState: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Alert color="info" title="Planlı bakım" description="…" skeleton />`),
  render: () => <SkeletonDemo>{(skeleton) => <Alert color="info" title="Planlı bakım" description="Cumartesi 02:00–04:00 arasında raporlar güncellenmeyecek." skeleton={skeleton} />}</SkeletonDemo>,
};
