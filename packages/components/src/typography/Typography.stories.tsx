import type { Meta, StoryObj } from "@storybook/react";
import { colorArgType } from "../lib/storybookArgTypes";
import { Paragraph, Text, Title } from "./Typography";

/**
 * Not: `Title`/`Text`/`Paragraph` üç ayrı component ama tek bir aile —
 * bu yüzden `meta.component` tek bir component'e bağlanmıyor, autodocs
 * bu dosya için sınırlı çalışır (prop tablosu yerine örnekler üzerinden
 * anlatım tercih edildi).
 */
const meta: Meta = {
  title: "Components/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Metin öğeleri için üç bileşen: `Title` (h1-h6 başlık), `Text` (satır içi/inline metin), `Paragraph` (`<p>`). " +
          "Üçü de hook kullanmaz, sunucu bileşeni olarak render edilebilir. Eskiden hiçbir varsayılan stili yoktu " +
          "(font boyutu/ağırlık/satır yüksekliği tanımsızdı); artık minimal ama tutarlı bir tip skalasına bağlı.",
      },
    },
  },
};

export default meta;

export const TitleLevels: StoryObj = {
  name: "Başlık Seviyeleri",
  render: () => (
    <>
      <Title>h1. Başlık</Title>
      <Title level={2}>h2. Başlık</Title>
      <Title level={3}>h3. Başlık</Title>
      <Title level={4}>h4. Başlık</Title>
      <Title level={5}>h5. Başlık</Title>
      <Title level={6}>h6. Başlık</Title>
    </>
  ),
};

export const TitleColors: StoryObj = {
  name: "Başlık Renkleri",
  argTypes: { color: colorArgType },
  args: { color: "primary" },
  render: (args) => <Title {...args}>Renkli Başlık</Title>,
};

export const TextExample: StoryObj = {
  name: "Metin (inline)",
  render: () => (
    <Text>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet commodi corporis, cumque delectus et
      exercitationem, illum ipsa iste, iusto molestiae necessitatibus odio perferendis quasi quis quod similique sunt
      veritatis.
    </Text>
  ),
};

export const TextMuted: StoryObj = {
  name: "Metin (soluk/ikincil)",
  render: () => <Text muted>Bu ikincil, daha soluk bir metindir — açıklama/yardımcı metin için kullanılır.</Text>,
};

export const ParagraphExample: StoryObj = {
  name: "Paragraf",
  render: () => (
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet commodi corporis, cumque delectus et
      exercitationem, illum ipsa iste, iusto molestiae necessitatibus odio perferendis quasi quis quod similique sunt
      veritatis.
    </Paragraph>
  ),
};
