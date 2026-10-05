/**
 * Gerçek senaryolar: landing başlığında dönen kelime, tek seferlik karşılama
 * cümlesi, yazılarak gelen asistan yanıtı (yer baştan ayrılır), iskelet.
 * "Show code" her story'de `storyDoc`'un 2. argümanıyla verilen kod.
 * Story seviyesinde `parameters` YAZMAYIN — `...storyDoc`'u ezer.
 */
import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SKELETON_STORY_DOC, SkeletonDemo } from "../lib/SkeletonDemo";
import { AnimationDemo } from "../lib/AnimationDemo";
import { Paragraph, Title } from "../typography";
import { Typewriter } from "./Typewriter";

const meta: Meta<typeof Typewriter> = {
  title: "Genel/Typewriter",
  component: Typewriter,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Daktilo efekti — metni karakter karakter yazar. Dizi verilirse her metni yazar, bekler, siler ve sıradakine geçer " +
            "(`loop` ile baştan). Varsayılan olarak öğe ekrana girince başlar. Başlıkta `Title`ın içine konur.",
          whenToUse: [
            "Landing/hero başlığında dönen anahtar kelime (\"… arayüzler: Hızlı / Erişilebilir / Tutarlı\").",
            "Tek seferlik karşılama ya da vurgu cümlesi.",
            "Asistan/sohbet yanıtının yazılarak gelmesi hissi.",
          ],
          whenNotToUse: [
            "Okunması zorunlu bilgi, hata ya da form metni — beklemeden tam görünmeli.",
            "Uzun gövde metni — okuyucuyu bekletir.",
            "Sayıların canlanması — `Statistic` (`valueAnimation`).",
          ],
          a11y:
            "Ekran okuyucu ara harfleri değil tam metni bir kez okur (dizide metinler virgülle). İmleç ve yazılan katman gizlidir. " +
            "Hareket azaltma tercihinde metin doğrudan tam görünür, imleç çizilmez.",
        }),
      },
    },
  },
  argTypes: {
    text: { control: "object" },
    trigger: { control: "inline-radio", options: ["visible", "mount"] },
    as: { control: "select", options: ["span", "p", "div", "h1", "h2", "h3"] },
  },
};

export default meta;
type Story = StoryObj<typeof Typewriter>;

export const Playground: Story = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    text: ["Hızlı", "Erişilebilir", "Tutarlı"],
    loop: true,
    typeSpeed: 50,
    deleteSpeed: 30,
    pauseMs: 1500,
    startDelay: 0,
    trigger: "visible",
    cursor: true,
    skeleton: false,
  },
  render: (args) => (
    <Title level={2}>
      Arayüzleriniz <Typewriter {...args} className="text-mari-primary" />
    </Title>
  ),
};

export const HeroRotatingWord: Story = {
  name: "Hero — Dönen Kelime",
  ...storyDoc(
    "Landing başlığında sabit cümle + dönen kelime: `loop` ile sonsuz. Genişlik kelimeyle değişir (cümle içinde doğal olan bu).",
    `<Title level={1}>
  Ürününüz için <Typewriter text={["hızlı", "erişilebilir", "tutarlı"]} loop className="text-mari-primary" /> arayüzler
</Title>`
  ),
  render: () => (
    <div className="flex max-w-2xl flex-col gap-3">
      <Title level={1}>
        Ürününüz için <Typewriter text={["hızlı", "erişilebilir", "tutarlı"]} loop className="text-mari-primary" /> arayüzler
      </Title>
      <Paragraph muted>Tek tasarım dili, tek token kaynağı: web, mobil ve tema stüdyosu aynı renkleri konuşur.</Paragraph>
    </div>
  ),
};

export const AssistantReply: Story = {
  name: "Asistan Yanıtı",
  ...storyDoc(
    "Tek metin: yer baştan tam metne göre ayrılır — yazılırken satırlar zıplamaz, altındaki içerik yerinde kalır. " +
      "`onComplete` yazım bitince (ör. kaynak bağlantılarını göstermek için).",
    `<Typewriter as="p" text={answer} typeSpeed={20} cursor={false} onComplete={() => setDone(true)} />`
  ),
  render: () => (
    <AnimationDemo className="max-w-xl">
      <div className="rounded-xl border border-mari-border bg-mari-surface p-4 text-sm leading-relaxed text-mari-foreground">
        <Typewriter
          as="p"
          trigger="mount"
          typeSpeed={20}
          cursor={false}
          text="Siparişiniz 3 Ekim'de kargoya verildi. Teslimat İstanbul içi olduğu için genellikle 1–2 iş günü sürer; kargo takip numaranızı Siparişlerim sayfasında görebilirsiniz."
        />
        <p className="mt-3 text-xs text-mari-muted">Bu satır yazım boyunca yerinde kalır.</p>
      </div>
    </AnimationDemo>
  ),
};

export const OneShot: Story = {
  name: "Tek Sefer (Dizi, Döngüsüz)",
  ...storyDoc(
    "Dizi + `loop` yok: metinler sırayla yazılıp silinir, SON metin yazılı kalır. `startDelay` ile sayfa açılışından biraz sonra başlar.",
    `<Typewriter text={["Merhaba", "Hoş geldiniz, Ayşe"]} startDelay={400} />`
  ),
  render: () => (
    <AnimationDemo>
      <Title level={3}>
        <Typewriter text={["Merhaba", "Hoş geldiniz, Ayşe"]} startDelay={400} trigger="mount" />
      </Title>
    </AnimationDemo>
  ),
};

export const Skeleton: Story = {
  name: "İskelet",
  ...storyDoc(SKELETON_STORY_DOC, `<Typewriter text={data?.headline ?? ""} skeleton={isLoading} />`),
  render: () => (
    <SkeletonDemo>
      {(skeleton) => (
        <Title level={2}>
          <Typewriter text="Ekim ayı satış özeti hazır" skeleton={skeleton} />
        </Title>
      )}
    </SkeletonDemo>
  ),
};
