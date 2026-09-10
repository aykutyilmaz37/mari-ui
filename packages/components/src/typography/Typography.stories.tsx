import type { Meta, StoryObj } from "@storybook/react";
import { colorArgType } from "../lib/storybookArgTypes";
import { componentDoc, storyDoc } from "../lib/storyMeta";
import { Paragraph, Text, Title } from "./Typography";

/**
 * Not: `Title`/`Text`/`Paragraph` üç ayrı component ama tek bir aile — bu
 * yüzden `meta.component` bağlanmıyor; autodocs prop tablosu yerine örnekler
 * üzerinden anlatım tercih edildi.
 */
const meta: Meta = {
  title: "Genel/Typography",
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: componentDoc({
          summary:
            "Metin öğeleri için üç bileşen: `Title` (h1–h6 başlık), `Text` (satır içi/inline metin), `Paragraph` (`<p>`). " +
            "Üçü de hook kullanmaz, sunucu bileşeni olarak render edilebilir. Minimal ama tutarlı bir tip skalasına bağlıdır — " +
            "font boyutu/ağırlık/satır yüksekliği tanımlıdır.",
          whenToUse: [
            "Bir başlık hiyerarşisi kurmak için (`Title level={1..6}`) — doğru `<h*>` etiketini otomatik seçer.",
            "Gövde metni ve yardımcı/ikincil (`muted`) açıklama metinleri için.",
            "Bir renk rolüyle vurgulanmış metin için (`color=\"primary\"` vb.).",
          ],
          whenNotToUse: [
            "Etkileşimli metin için — bağlantı `<a>`, buton `Button`.",
            "Uzun biçimli zengin içerik (CMS gövdesi) için — orada `prose` benzeri bir yapı daha uygun.",
          ],
          a11y:
            "`Title` her zaman `level` ile eşleşen gerçek `<h1>`–`<h6>` etiketini render eder — seviye atlamamaya dikkat edin " +
            "(görsel boyut için `className` kullanın, yanlış `level` değil). Renkler tema token'larından gelir, kontrast korunur.",
        }),
      },
    },
  },
};

export default meta;

export const TitleLevels: StoryObj = {
  name: "Başlık Seviyeleri",
  ...storyDoc("`level` 1–6 arası — her biri gerçek `<h1>`–`<h6>` etiketine ve azalan bir font ölçeğine karşılık gelir."),
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
  ...storyDoc("`color` bir renk rolüdür (`primary`/`accent`/...); verilmezse `--mari-color-foreground` kullanılır."),
  argTypes: { color: colorArgType },
  args: { color: "primary" },
  render: (args) => <Title {...args}>Renkli Başlık</Title>,
};

export const TextExample: StoryObj = {
  name: "Metin (inline)",
  ...storyDoc("`Text` bir `<span>` render eder — akış içinde kullanılır. `weight` ile ağırlığı ayarlanabilir."),
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
  ...storyDoc("`muted` metni `--mari-color-muted` rengine çeker — açıklama/yardımcı metin için."),
  render: () => <Text muted>Bu ikincil, daha soluk bir metindir — açıklama/yardımcı metin için kullanılır.</Text>,
};

export const ParagraphExample: StoryObj = {
  name: "Paragraf",
  ...storyDoc("`Paragraph` bir `<p>` render eder — `Text`'ten farkı blok seviyesi olması ve daha ferah satır yüksekliği."),
  render: () => (
    <Paragraph>
      Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus amet commodi corporis, cumque delectus et
      exercitationem, illum ipsa iste, iusto molestiae necessitatibus odio perferendis quasi quis quod similique sunt
      veritatis.
    </Paragraph>
  ),
};
