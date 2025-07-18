"use client";

import { Tree } from "@/components/ui/tree";
import { TreeData } from "@/components/ui/tree/types";

const treeData: TreeData[] = [
  {
    title: '0-0',
    key: '0-0',
    children: [
      {
        title: '1-0-0',
        key: '0-0-0',
        children: [
          { title: '0-0-0-0', key: '0-0-0-0', children:[{title:'ahmet', key: '0-0-0-0-1'}]},
          { title: '0-0-0-1', key: '0-0-0-1', disabled: true },
          { title: '0-0-0-2', key: '0-0-0-2' },
        ],
      },
      {
        title: '2-0-1',
        key: '0-0-1',
        children: [
          { title: '0-0-1-0', key: '0-0-1-0' },
          { title: '0-0-1-1', key: '0-0-1-1' },
          { title: '0-0-1-2', key: '0-0-1-2' },
        ],
      },
      {
        title: '0-0-2',
        key: '0-0-2',
      },
    ],
  },
  {
    title: '2-1',
    key: '0-1',
    children: [
      { title: '0-1-0-0', key: '0-1-0-0' },
      { title: '0-1-0-1', key: '0-1-0-1' },
      { title: '0-1-0-2', key: '0-1-0-2' },
    ],
  },
  {
    title: '3-2',
    key: '0-2',
  },
];
export default function Page() {
  return <div>App

    <Tree treeData={treeData} />
  </div>;
}
