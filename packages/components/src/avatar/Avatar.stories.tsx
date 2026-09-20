import type { Meta, StoryObj } from "@storybook/react";
import { User2Icon } from "lucide-react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Avatar } from "./Avatar";
import type { AvatarProps } from "./types";

/**
 * Kendi çizdiğimiz, sadece bu design sistemin blue-grey paletini (accent-subtle
 * `#BDDDFC` + accent `#6A89A7`) kullanan basit bir yer tutucu — dışarıdan alınmış,
 * bize ait olmayan bir stok görsel DEĞİL (bkz. `apps/docs/public/images/
 * avatar-placeholder.svg`).
 */
const AVATAR_URL = "/images/avatar-placeholder.svg";

const meta: Meta<typeof Avatar> = {
  title: "Veri Gösterimi/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Bir kullanıcıyı/varlığı temsil eden görsel — fotoğraf, özel ikon veya (ikisi de yoksa) `alt` metninin " +
            "baş harfi. Görsel yüklenemezse (veya `src` boş string ise) otomatik olarak yedek gösterime düşer.",
          whenToUse: [
            "Bir kullanıcıyı/varlığı bir liste satırında, üstbilgide veya yorum bloğunda temsil ederken.",
            "Fotoğraf henüz yoksa/yüklenemiyorsa baş harf veya ikon yedeğiyle tutarlı bir görünüm korumak için.",
          ],
          a11y:
            "`alt` hem erişilebilirlik metni hem de baş harf yedeğinin kaynağıdır — her zaman verin. `useState` " +
            "kullanır (resim yükleme hatasını takip eder) — bu yüzden client component'tir.",
        }),
      },
    },
  },
  argTypes: {
    alt: { control: "text", description: "Erişilebilirlik metni; görsel yoksa baş harfi bundan türetilir." },
    shape: { control: "select", options: ["circle", "square"], description: "Geometri." },
    size: baseSizeArgType,
    src: { control: false, description: "Görsel URL'i veya doğrudan bir React node." },
    icon: { control: false, description: "Görsel olmadığında/yüklenemediğinde gösterilecek ikon." },
    onError: { action: "onError", description: "Görsel yüklenemediğinde çağrılır. `false` dönerse yedek gösterime düşülmez." },
  },
};

export default meta;

export const Playground: StoryObj<AvatarProps> = {
  ...storyDoc("Tüm props'ları canlı deneyin."),
  args: {
    alt: "Kullanıcı",
    shape: "circle",
    size: "md",
    src: AVATAR_URL,
  },
};

export const WithIconFallback: StoryObj<AvatarProps> = {
  name: "İkon Yedekli",
  ...storyDoc("`src` verilmediğinde/boşken ve `icon` verildiğinde gösterilecek özel ikon yedeği."),
  args: {
    alt: "Yedekli Kullanıcı",
    shape: "circle",
    size: "lg",
    src: "",
    icon: <User2Icon size={24} />,
  },
};

export const InitialFallback: StoryObj<AvatarProps> = {
  name: "Baş Harf Yedekli",
  ...storyDoc(
    "Ne `src` ne `icon` verildiğinde `alt`'ın baş harfi gösterilir. Baş harfin font-size'ı boyutla orantılı büyür " +
      "(ant.design'ın gerçek Avatar'ıyla `getComputedStyle` kıyaslaması: 24px kutu→14px, 32px→18px, 40px→24px)."
  ),
  args: {
    alt: "Aykut Yılmaz",
    shape: "circle",
    size: "lg",
    src: "",
  },
};

const comments = [
  { name: "Aykut Yılmaz", time: "2 saat önce", text: "Harika görünüyor, elinize sağlık!", src: AVATAR_URL },
  { name: "Deniz Kaya", time: "5 saat önce", text: "Bir de mobilde nasıl davrandığına bakalım.", src: "" },
  { name: "Elif Şahin", time: "1 gün önce", text: "Kenar boşlukları biraz sıkışık, kontrol edelim mi?", src: "" },
] as const;

export const CommentList: StoryObj = {
  name: "Yorum Listesi",
  ...storyDoc("Bir yorum akışında kullanıcı avatarı — fotoğrafı olmayanlar otomatik olarak baş harfe düşer."),
  render: () => (
    <ul className="flex max-w-md flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.name} className="flex gap-3">
          <Avatar alt={comment.name} src={comment.src} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-mari-foreground">{comment.name}</span>
              <span className="text-xs text-mari-muted">{comment.time}</span>
            </div>
            <p className="text-sm text-mari-foreground">{comment.text}</p>
          </div>
        </li>
      ))}
    </ul>
  ),
};

export const AllShapesAndSizes: StoryObj = {
  name: "Şekil ve Boyutlar",
  ...storyDoc("İki geometri (`circle`/`square`) × üç boyut (`sm`/`md`/`lg` — ant.design'ın small/default/large'ıyla piksel piksel aynı: 24/32/40px)."),
  render: () => {
    const shapes = ["circle", "square"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {shapes.map((shape) => (
          <div key={shape} className="space-y-2">
            <h3 className="font-semibold capitalize">{shape === "circle" ? "Daire" : "Kare"}</h3>
            <div className="flex gap-4 items-center">
              {sizes.map((size) => (
                <Avatar key={`${shape}-${size}`} shape={shape} size={size} alt={`Avatar ${shape} ${size}`} src={AVATAR_URL} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};
