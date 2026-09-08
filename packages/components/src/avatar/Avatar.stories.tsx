import type { Meta, StoryObj } from "@storybook/react";
import { User2Icon } from "lucide-react";
import { baseSizeArgType } from "../lib/storybookArgTypes";
import { Avatar } from "./Avatar";
import type { AvatarProps } from "./types";

const AVATAR_URL = "/images/avatar.png";

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bir kullanıcıyı/varlığı temsil eden görsel — fotoğraf, özel ikon veya (ikisi de yoksa) `alt` metninin " +
          "baş harfi. Görsel yüklenemezse otomatik olarak yedek gösterime düşer. `useState` kullanır (resim yükleme " +
          "hatasını takip eder) — bu yüzden client component'tir.",
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
  args: {
    alt: "Kullanıcı",
    shape: "circle",
    size: "md",
    src: AVATAR_URL,
  },
};

export const WithIconFallback: StoryObj<AvatarProps> = {
  name: "İkon Yedekli",
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
  args: {
    alt: "Aykut Yılmaz",
    shape: "circle",
    size: "lg",
    src: "",
  },
};

export const AllShapesAndSizes: StoryObj = {
  name: "Tüm Şekil ve Boyutlar",
  render: () => {
    const shapes = ["circle", "square"] as const;
    const sizes = ["sm", "md", "lg"] as const;

    return (
      <div className="flex flex-col gap-6 p-6">
        {shapes.map((shape) => (
          <div key={shape} className="space-y-2">
            <h3 className="font-semibold capitalize">{shape}</h3>
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
