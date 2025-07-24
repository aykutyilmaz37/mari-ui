import React from "react";
import { TabsList } from "./_components/TabsList";
import { TabsContent } from "./_components/TabsContent";
import { TabsProvider } from "./useTabs";

type TabsProps = {
  defaultActiveTab: string;
  children: [
    React.ReactElement<typeof TabsList>,
    ...React.ReactElement<typeof TabsContent>[]
  ];
};
export const Tabs: React.FC<TabsProps> = ({ defaultActiveTab, children }) => {
  return (
    <TabsProvider defaultActiveTab={defaultActiveTab}>
      <div className="min-w-full">{children}</div>
    </TabsProvider>
  );
};
