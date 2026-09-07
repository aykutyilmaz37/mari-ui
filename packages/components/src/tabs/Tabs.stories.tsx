import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";
import { TabsList } from "./_components/TabsList";
import { TabsTrigger } from "./_components/TabsTrigger";
import { TabsContent } from "./_components/TabsContent";

/** Not: bu dosya eskiden legacy CSF2 formatındaydı (default export objesi,
 * bare fonksiyon export'ları, Meta/StoryObj tipi yok) — tek istisnaydı,
 * diğer 33 story dosyası CSF3 kullanıyordu. Faz 4'ün tam standardizasyonu
 * beklemeden burada CSF3'e taşındı. */
const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultActiveTab="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Sekme 1</TabsTrigger>
        <TabsTrigger value="tab2">Sekme 2</TabsTrigger>
        <TabsTrigger value="tab3">Sekme 3</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Sekme 1 içeriği</TabsContent>
      <TabsContent value="tab2">Sekme 2 içeriği</TabsContent>
      <TabsContent value="tab3">Sekme 3 içeriği</TabsContent>
    </Tabs>
  ),
};

export const CardTabs: Story = {
  render: () => (
    <Tabs defaultActiveTab="tab1" color="accent">
      <TabsList cardTabs>
        <TabsTrigger value="tab1" cardTabs>
          Sekme 1
        </TabsTrigger>
        <TabsTrigger value="tab2" cardTabs>
          Sekme 2
        </TabsTrigger>
        <TabsTrigger value="tab3" cardTabs>
          Sekme 3
        </TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Sekme 1 içeriği</TabsContent>
      <TabsContent value="tab2">Sekme 2 içeriği</TabsContent>
      <TabsContent value="tab3">Sekme 3 içeriği</TabsContent>
    </Tabs>
  ),
};
