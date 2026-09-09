import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { Carousel } from "./Carousel";

const meta: Meta<typeof Carousel> = {
  title: "Veri Gösterimi/Carousel",
  component: Carousel,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "[Embla Carousel](https://www.embla-carousel.com/) üzerine kurulu slayt gösterici. `embla-carousel-" +
          "react`/`embla-carousel-autoplay` opsiyonel peer bağımlılıktır — sadece bu component'i kullanan " +
          "tüketiciler kurar. **Not:** eskiden `slick-carousel`'den kalma `infinite`/`autoplaySpeed` prop " +
          "isimleri kullanılıyordu; Embla'ya geçişte `loop`/`autoplayDelay` olarak yeniden adlandırıldı.",
      },
    },
  },
  argTypes: {
    arrows: { control: "boolean", description: "Önceki/sonraki ok butonlarını gösterir." },
    autoplay: { control: "boolean", description: "Otomatik ilerlemeyi açar." },
    autoplayDelay: { control: "number", description: "Otomatik ilerleme aralığı (ms). Eskiden `autoplaySpeed`." },
    loop: { control: "boolean", description: "Sona gelince başa döner. Eskiden `infinite`." },
    draggable: { control: "boolean", description: "Fare/dokunma ile sürükleyerek gezinmeyi açar." },
    slidesToShow: { control: "number", description: "Aynı anda görünecek slayt sayısı." },
    slidesToScroll: { control: "number", description: "Her adımda kaydırılacak slayt sayısı." },
    dotPosition: { control: "select", options: ["top", "bottom", "left", "right"], description: "Sayfa noktalarının (dots) konumu." },
  },
};
export default meta;

type Story = StoryObj<typeof Carousel>;

const basicChildren = [
  <div
    key="slide-1"
    className="flex h-40 items-center justify-center bg-red-300"
  >
    Slide 1
  </div>,
  <div
    key="slide-2"
    className="flex h-40 items-center justify-center bg-green-300"
  >
    Slide 2
  </div>,
  <div
    key="slide-3"
    className="flex h-40 items-center justify-center bg-blue-300"
  >
    Slide 3
  </div>,
];

export const Basic: Story = {
  name: "Temel",
  args: {
    children: basicChildren,
  },
};

export const WithArrows: Story = {
  name: "Ok Butonlu",
  args: {
    arrows: true,
    children: basicChildren,
  },
};

export const Autoplay: Story = {
  name: "Otomatik Oynatma",
  args: {
    autoplay: true,
    autoplayDelay: 2000, // eskiden autoplaySpeed
    children: basicChildren,
  },
};

export const SlidesToShow: Story = {
  name: "Aynı Anda Görünen Slayt Sayısı",
  args: {
    slidesToShow: 3,
    children: basicChildren,
    arrows: true,
  },
};

export const SlidesToScroll: Story = {
  name: "Adım Başına Kaydırma",
  args: {
    slidesToShow: 4,
    slidesToScroll: 2,
    arrows: true,
    loop: true,
    children: [
      ...basicChildren,
      <div
        key="slide-4"
        className="flex h-40 items-center justify-center bg-purple-300"
      >
        Slide 4
      </div>,
      <div
        key="slide-5"
        className="flex h-40 items-center justify-center bg-pink-300"
      >
        Slide 5
      </div>,
    ],
  },
};

export const DotPositions: Story = {
  name: "Nokta Konumları",
  render: () => (
    <div className="flex flex-col gap-6">
      {(["top", "bottom", "left", "right"] as const).map((position) => (
        <div key={`dots-${position}`} className="w-[640px]">
          <p className="mb-2 font-medium">Dots: {position}</p>
          <Carousel dotPosition={position} arrows>
            {basicChildren}
          </Carousel>
        </div>
      ))}
    </div>
  ),
};

const adaptiveChildren = [
  <div key="short" className="bg-yellow-100 p-6">
    Short Slide
  </div>,
  <div key="tall" className="bg-yellow-200 p-20">
    Tall Slide
  </div>,
  <div key="medium" className="bg-yellow-300 p-10">
    Medium Slide
  </div>,
];

export const AdaptiveHeight: Story = {
  name: "Değişken Yükseklik",
  args: {
    // Embla tarafında yükseklik sabit; içerikte farklı yükseklikleri görmek için container’ı auto bırakıyoruz.
    // Eğer dışarıdan height kontrolü istersen, slide içinde min-h veya aspect kullan.
    children: adaptiveChildren,
    arrows: true,
  },
};

export const LoopingAutoplay: Story = {
  name: "Döngülü Otomatik Oynatma",
  args: {
    loop: true, // eskiden infinite
    arrows: true,
    autoplay: true,
    autoplayDelay: 1500, // eskiden autoplaySpeed
    beforeChange: (current, next) =>
      // Embla'da beforeChange public event değil; burada örnek amaçlı log bırakıldı
      console.log("Before change (approx):", current, "→", next),
    afterChange: (index: number) => console.log("After change:", index),
    children: basicChildren,
  },
};

export const Draggable: Story = {
  name: "Sürüklenebilir",
  args: {
    draggable: true,
    arrows: true,
    children: basicChildren,
  },
};

export const Responsive: Story = {
  name: "Duyarlı (Responsive)",
  args: {
    slidesToShow: 4,
    slidesToScroll: 4,
    responsive: [
      { breakpoint: 1024, slidesToShow: 3, slidesToScroll: 3 },
      { breakpoint: 768, slidesToShow: 2, slidesToScroll: 2 },
      { breakpoint: 480, slidesToShow: 1, slidesToScroll: 1 },
    ],
    arrows: true,
    loop: true,
    children: [
      ...basicChildren,
      <div
        key="slide-4"
        className="flex h-40 items-center justify-center bg-purple-300"
      >
        Slide 4
      </div>,
      <div
        key="slide-5"
        className="flex h-40 items-center justify-center bg-pink-300"
      >
        Slide 5
      </div>,
      <div
        key="slide-6"
        className="flex h-40 items-center justify-center bg-orange-300"
      >
        Slide 6
      </div>,
    ],
  },
};
