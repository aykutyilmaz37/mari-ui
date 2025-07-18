import React from "react";
import { TreeData } from "./types";
import { useTree } from "./useTree";

type TreeProps = {
  treeData: TreeData[];
  icon?: React.ReactNode;
};

export const Tree: React.FC<TreeProps> = ({ treeData, icon }) => {
  const [expandedKeys, setExpandedKeys] = React.useState<string[]>([]);
  const [checkedKeys, setCheckedKeys] = React.useState<string[]>([]);

  const { renderTree } = useTree({
    treeData,
    expandedKeys,
    setExpandedKeys,
    checkedKeys,
    setCheckedKeys,
    icon,
  });

  return <ul className="flex flex-col">{renderTree(treeData)}</ul>;
};
