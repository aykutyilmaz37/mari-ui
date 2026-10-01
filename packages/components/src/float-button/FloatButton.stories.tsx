/**
 * Faz 16.6: gerçek senaryolar — destek sohbeti (rozetli tekli düğme), hızlı
 * işlemler menüsü, yardım + başa dön (kare grup), uzun makalede başa dön.
 * `position: fixed` düğmeler belge sayfasına yayılmasın diye her örnek
 * `transform`lu bir çerçevede (fixed öğe ona göre konumlanır).
 */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { FilePlusIcon, HeadsetIcon, MessageCircleIcon, MessageSquareTextIcon, PlusIcon, SquareCheckIcon, UploadIcon } from "lucide-react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { BackTop } from "./BackTop";
import { FloatButton } from "./FloatButton";
import { FloatButtonGroup } from "./FloatButtonGroup";

/** Uygulama ekranı çerçevesi: `transform` fixed konumlamayı içine hapseder. */
function Frame({ children, scrollRef, title = "Sipariş #48213" }: { children: React.ReactNode; scrollRef?: React.Ref<HTMLDivElement>; title?: string }) {
  return (
    <div className="relative h-96 overflow-hidden rounded-xl border border-mari-border bg-mari-surface-alt [transform:translateZ(0)]">
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- kaydırılan örnek içerik klavyeyle de kaydırılabilsin */}
      <div ref={scrollRef} role="region" aria-label="Sayfa içeriği" tabIndex={0} className="h-full overflow-y-auto p-4 pb-24 outline-none focus-visible:ring-2 focus-visible:ring-mari-ring focus-visible:ring-inset">
        <h1 className="mb-2 text-lg font-semibold">{title}</h1>
        {Array.from({ length: 8 }, (_, i) => (
          // Konumsal örnek içerik.
          <p key={i} className="mb-3 max-w-prose text-sm text-mari-muted">
            Kargo durumu güncellendi: paket aktarma merkezinden çıktı ve yarın teslim edilmesi bekleniyor. Teslimat adresini değiştirmek
            için sipariş ayrıntılarına gidin.
          </p>
        ))}
      </div>
      {children}
    </div>
  );
}

const meta: Meta<typeof FloatButton> = {
  title: "Genel/FloatButton",
  component: FloatButton,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Ekranın köşesinde sabit duran, içerikten bağımsız eylem düğmesi: destek sohbeti, hızlı oluşturma, başa dön. Tekli, " +
            "`FloatButtonGroup` (hep açık sütun ya da `trigger` ile açılır menü) ve `BackTop`. Kare şekilde ikonun altına kısa açıklama; " +
            "rozet, ipucu, bağlantı. Çentikli telefonlarda güvenli alan payı eklenir.",
          whenToUse: ["Her ekranda erişilmesi gereken tek bir genel eylem (yardım, sohbet).", "Uzun sayfada başa dönüş."],
          whenNotToUse: [
            "Sayfaya özgü birincil eylem — formun/başlığın yanında normal Button daha bulunabilir.",
            "Birden çok eşit önemde eylem — araç çubuğu ya da menü; yüzen düğme içeriği örter.",
          ],
          a11y:
            "Gerçek `<button>`/`<a>`; ikon-yalnız düğmede ad `aria-label` (ya da düz metin `tooltip`). Menü grubunda ana düğme " +
            "`aria-expanded`/`aria-controls`; kapalıyken alt düğmeler DOM'da yok, Escape kapatıp odağı ana düğmeye verir. BackTop başa " +
            "dönünce odağı sayfa başlığına taşır (düğme gizlenince odak kaybolmasın). Dokunmatikte 44px hedef.",
        }),
      },
    },
  },
  argTypes: {
    icon: { control: false },
    badge: { control: false },
    onClick: { table: { category: "Olaylar" } },
    shape: { control: "inline-radio", options: ["circle", "square"] },
    placement: { control: "inline-radio", options: ["bottom-right", "bottom-left", "top-right", "top-left"] },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet." },
  },
};

export default meta;

/** Kendi çerçevesini çizmeyen story'ler için. */
const inFrame = [(Story: () => React.ReactNode) => <Frame>{Story()}</Frame>];
type Story = StoryObj<typeof FloatButton>;

export const Playground: Story = { args: { icon: <HeadsetIcon />, tooltip: "Destek", color: "primary" }, decorators: inFrame };

export const SupportChat: Story = {
  name: "Destek Sohbeti",
  ...storyDoc(
    "Tek, rozetli düğme: okunmamış yanıt sayısı. `color=\"primary\"` ana eylem; ipucu düz metin olduğu için ad da odur.",
    `<FloatButton icon={<MessageCircleIcon />} color="primary" tooltip="Destek ekibine yazın" badge={{ count: 2 }} onClick={openChat} />`
  ),
  decorators: inFrame,
  render: () => <FloatButton icon={<MessageCircleIcon />} color="primary" tooltip="Destek ekibine yazın" badge={{ count: 2 }} />,
};

export const QuickActions: Story = {
  name: "Hızlı İşlemler (Menü)",
  ...storyDoc(
    "`trigger=\"click\"`: ana düğme yukarı doğru açılan bir menü; açıkken ikon × olur. Escape ya da dışarı tıklama kapatır.",
    `<FloatButtonGroup trigger="click" icon={<PlusIcon />} aria-label="Oluştur">
  <FloatButton icon={<SquareCheckIcon />} tooltip="Yeni görev" />
  <FloatButton icon={<FilePlusIcon />} tooltip="Yeni belge" />
  <FloatButton icon={<UploadIcon />} tooltip="Dosya yükle" />
</FloatButtonGroup>`
  ),
  decorators: inFrame,
  render: () => (
    <FloatButtonGroup trigger="click" icon={<PlusIcon />} aria-label="Oluştur">
      <FloatButton icon={<SquareCheckIcon />} tooltip="Yeni görev" />
      <FloatButton icon={<FilePlusIcon />} tooltip="Yeni belge" />
      <FloatButton icon={<UploadIcon />} tooltip="Dosya yükle" />
    </FloatButtonGroup>
  ),
};

export const HelpGroup: Story = {
  name: "Yardım + Başa Dön (Kare Grup)",
  ...storyDoc(
    "Kare grup tek bir kart gibi birleşik; kısa açıklamalar ikonun altında. BackTop grubun bir parçası olabilir (`target` kaydırılan kutu).",
    `<FloatButtonGroup shape="square">
  <FloatButton icon={<HeadsetIcon />} description="Destek" />
  <FloatButton icon={<MessageSquareTextIcon />} description="Görüş" />
  <BackTop target={() => scrollRef.current} visibilityHeight={100} />
</FloatButtonGroup>`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <Frame scrollRef={ref} title="Yardım merkezi">
        <FloatButtonGroup shape="square">
          <FloatButton icon={<HeadsetIcon />} description="Destek" />
          <FloatButton icon={<MessageSquareTextIcon />} description="Görüş" />
          <BackTop target={() => ref.current} visibilityHeight={100} />
        </FloatButtonGroup>
      </Frame>
    );
  },
};

export const BackToTop: Story = {
  name: "Başa Dön",
  ...storyDoc(
    "Kutu 100px kaydırılınca belirir; tıklayınca başa döner ve odak sayfa başlığına geçer (klavye kullanıcısı baştan devam eder).",
    `<BackTop target={() => scrollRef.current} visibilityHeight={100} tooltip="Başa dön" />`
  ),
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    return (
      <Frame scrollRef={ref} title="Kargo geçmişi">
        <BackTop target={() => ref.current} visibilityHeight={100} tooltip="Başa dön" />
      </Frame>
    );
  },
};
