import type { Meta, StoryObj } from "@storybook/react";
import { User2Icon } from "lucide-react";
import { baseSizeArgType, colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { SkeletonDemo } from "../lib/SkeletonDemo";
import { Avatar, AvatarGroup } from "./Avatar";
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
            "baş harfleri (\"Aykut Yılmaz\" → AY). Görsel yüklenemezse (veya `src` boş string ise) otomatik olarak yedek gösterime düşer. " +
            "Birden çok kişi için `AvatarGroup`.",
          whenToUse: [
            "Bir kullanıcıyı/varlığı bir liste satırında, üstbilgide veya yorum bloğunda temsil ederken.",
            "Fotoğraf henüz yoksa/yüklenemiyorsa baş harf veya ikon yedeğiyle tutarlı bir görünüm korumak için.",
          ],
          a11y:
            "`alt` hem erişilebilirlik metni hem de baş harf yedeğinin kaynağıdır — her zaman verin. Görsel yokken kutu " +
            "`role=\"img\"` + `aria-label={alt}` taşır: ekran okuyucu \"A Y\" değil adı okur. `AvatarGroup`'un \"+N\" avatarı " +
            "\"N kişi daha\" diye okunur. `useState` kullanır — client component'tir.",
        }),
      },
    },
  },
  argTypes: {
    alt: { control: "text", description: "Erişilebilirlik metni; görsel yoksa baş harfi bundan türetilir." },
    shape: { control: "select", options: ["circle", "square"], description: "Geometri." },
    size: baseSizeArgType,
    color: { ...colorArgType, description: "Görsel yokken zemin tonu (soft). Verilmezse nötr yüzey." },
    skeleton: { control: "boolean", description: "Veri yokken aynı boyutta iskelet.", table: { defaultValue: { summary: "false" } } },
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
    "Ne `src` ne `icon` verildiğinde `alt`'ın ilk ve son kelimesinin baş harfi gösterilir (Türkçe büyük harf: \"ilker\" → İ). " +
      "Font-size kutunun ~%40'ı (24→10, 32→14, 40→16px). `color` ile tonlanabilir."
  ),
  args: {
    alt: "Aykut Yılmaz",
    shape: "circle",
    size: "lg",
    src: "",
    color: "primary",
  },
};

const comments = [
  { name: "Aykut Yılmaz", time: "2 saat önce", text: "Harika görünüyor, elinize sağlık!", src: AVATAR_URL },
  { name: "Deniz Kaya", time: "5 saat önce", text: "Bir de mobilde nasıl davrandığına bakalım.", src: "" },
  { name: "Elif Şahin", time: "1 gün önce", text: "Kenar boşlukları biraz sıkışık, kontrol edelim mi?", src: "" },
] as const;

export const CommentList: StoryObj = {
  name: "Yorum Listesi",
  ...storyDoc(
    "Bir yorum akışında kullanıcı avatarı — fotoğrafı olmayanlar otomatik olarak baş harfe düşer. Avatar `shrink-0` — uzun yorumda ezilmez.",
    `<li className="flex gap-3">
  <Avatar alt="Deniz Kaya" src={user.photo} />
  <div className="min-w-0">
    <span className="font-semibold">Deniz Kaya</span>
    <p className="text-sm">Bir de mobilde nasıl davrandığına bakalım.</p>
  </div>
</li>`
  ),
  render: () => (
    <ul className="flex max-w-md flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.name} className="flex gap-3">
          <Avatar alt={comment.name} src={comment.src} />
          <div className="min-w-0">
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

export const Group: StoryObj = {
  name: "Grup (ekip)",
  ...storyDoc(
    "`AvatarGroup` avatarları üst üste bindirir ve yüzey renginde bir halkayla ayırır. `max`ı aşanlar tek bir \"+N\" avatarında toplanır. " +
      "`size`/`shape` gruptaki tüm avatarlara iletilir.",
    `<AvatarGroup max={4}>
  <Avatar alt="Aykut Yılmaz" src={url} />
  <Avatar alt="Deniz Kaya" color="accent" />
  <Avatar alt="Elif Şahin" color="success" />
  <Avatar alt="Mert Demir" color="warning" />
  <Avatar alt="Zeynep Arslan" />
</AvatarGroup>`
  ),
  render: () => (
    <div className="flex flex-col gap-5">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex items-center gap-4">
          <AvatarGroup max={4} size={size}>
            {team.map((name, i) => (
              <Avatar key={name} alt={name} src={i === 0 ? AVATAR_URL : ""} color={teamColors[i]} />
            ))}
          </AvatarGroup>
          <span className="text-sm text-mari-muted">7 kişi projede</span>
        </div>
      ))}
    </div>
  ),
};

function AvatarSkeleton() {
  return (
    <SkeletonDemo>
      {(skeleton) => (
        <div className="flex flex-col gap-4">
          <ul className="flex max-w-md flex-col gap-4">
            {comments.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <Avatar skeleton={skeleton} alt={c.name} src={c.src} />
                <span className="text-sm text-mari-foreground">{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SkeletonDemo>
  );
}

export const AllShapesAndSizes: StoryObj = {
  name: "Şekil ve Boyutlar",
  ...storyDoc(
    "İki geometri (`circle`/`square`) × üç boyut (`sm`/`md`/`lg` = 24/32/40px). Kare avatarın köşesi tema radius preset'ini izler. Daha büyük boyut için sayı verin (`size={64}`, px).",
    `<Avatar shape="circle" size="sm" alt="Ada" src={url} />
<Avatar shape="square" size="lg" alt="Ada" src={url} />
<Avatar size={64} alt="Ada" src={url} />`
  ),
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

const team = ["Aykut Yılmaz", "Deniz Kaya", "Elif Şahin", "Mert Demir", "Zeynep Arslan", "Can Öztürk", "İlker Aydın"];
const teamColors = ["primary", "accent", "success", "warning", "info", "error", "neutral"] as const;

export const Skeleton: StoryObj = {
  name: "İskelet",
  ...storyDoc(
    "`skeleton` — kullanıcı verisi gelene kadar aynı boyut ve şekilde yer tutucu (ekran okuyucudan gizli).",
    `<Avatar skeleton={isLoading} alt={user.name} src={user.photo} />`
  ),
  render: () => <AvatarSkeleton />,
};

