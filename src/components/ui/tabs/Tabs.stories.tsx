import React from "react";
import { Tabs } from "./Tabs";
import { TabsList } from "./_components/TabsList";
import { TabsTrigger } from "./_components/TabsTrigger";
import { TabsContent } from "./_components/TabsContent";

export default {
  title: "Components/Tabs",
  component: Tabs,
};

export const Default = () => (
  <Tabs defaultActiveTab="tab1">
    <TabsList>
      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Tab 1 içeriği</TabsContent>
    <TabsContent value="tab2">Tab 2 içeriği</TabsContent>
    <TabsContent value="tab3">Tab 3 içeriği</TabsContent>
  </Tabs>
);

export const CardTabs = () => (
  <Tabs defaultActiveTab="tab1">
    <TabsList cardTabs={true}>
      <TabsTrigger value="tab1" cardTabs={true}>
        Tab 1
      </TabsTrigger>
      <TabsTrigger value="tab2" cardTabs={true}>
        Tab 2
      </TabsTrigger>
      <TabsTrigger value="tab3" cardTabs={true}>
        Tab 3
      </TabsTrigger>
    </TabsList>
    <TabsContent value="tab1">Tab 1 içeriği</TabsContent>
    <TabsContent value="tab2">Tab 2 içeriği</TabsContent>
    <TabsContent value="tab3">Tab 3 içeriği</TabsContent>
  </Tabs>
);
