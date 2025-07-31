import { twMerge } from "tailwind-merge";
import { TreeData } from "./types";
import {
  findNodeByKey,
  getAllChildKeys,
  getAllParentKeys,
  hasAnyCheckedChild,
  removeUnneededParents,
} from "./utils";
import { Checkbox } from "../checkbox";
import { Button } from "../button";
import { PlayIcon } from "lucide-react";
import React from "react";

type UseTreeProps = {
  treeData: TreeData[];
  expandedKeys: string[];
  setExpandedKeys: React.Dispatch<React.SetStateAction<string[]>>;
  checkedKeys: string[];
  setCheckedKeys: React.Dispatch<React.SetStateAction<string[]>>;
  icon?: React.ReactNode;
};

export const useTree = ({
  treeData,
  expandedKeys,
  setExpandedKeys,
  checkedKeys,
  setCheckedKeys,
  icon,
}: UseTreeProps) => {
  const handleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const onCheck = (key: string) => {
    let newCheckedKeys = [...checkedKeys];
    const node = findNodeByKey(treeData, key);
    if (!node) return;

    const isChecked = checkedKeys.includes(key);

    if (!isChecked) {
      // Seçili değilse, seçilecek
      newCheckedKeys.push(key);
      // Eğer parent ise, tüm child'ları da seç
      const allChildKeys = getAllChildKeys(node);
      newCheckedKeys = Array.from(
        new Set([...newCheckedKeys, ...allChildKeys])
      );
      // Tüm parent zincirini seç
      const allParentKeys = getAllParentKeys(treeData, key);
      newCheckedKeys = Array.from(
        new Set([...newCheckedKeys, ...allParentKeys])
      );
    } else {
      // Seçiliyse, kaldır
      newCheckedKeys = newCheckedKeys.filter((k) => k !== key);
      // Eğer parent ise, tüm child'ları da kaldır
      const allChildKeys = getAllChildKeys(node);
      newCheckedKeys = newCheckedKeys.filter((k) => !allChildKeys.includes(k));
      // Parent zincirinde, başka seçili child yoksa parent'ı da kaldır
      newCheckedKeys = removeUnneededParents(treeData, newCheckedKeys, key);
    }
    setCheckedKeys(Array.from(new Set(newCheckedKeys)));
  };

  const renderTree = (childrenData?: TreeData[]) => {
    return (
      <ul className="ml-4 flex flex-col">
        {childrenData?.map((tree) => {
          const isExpanded = expandedKeys.includes(tree.key);
          const hasChildren = tree.children && tree.children.length > 0;
          const childSelected = hasAnyCheckedChild(tree, checkedKeys);

          const allChildSelected =
            tree.children &&
            tree.children.length > 0 &&
            tree.children.every((child) => checkedKeys.includes(child.key));

          let checkboxOpacity: string | undefined;
          if (allChildSelected) {
            checkboxOpacity = "opacity-100";
          } else if (childSelected) {
            checkboxOpacity = "opacity-50";
          } else {
            checkboxOpacity = undefined;
          }

          return (
            <li
              key={tree.key}
              className={twMerge(
                tree.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className="flex items-center">
                <Checkbox
                  disabled={tree.disabled}
                  checked={checkedKeys.includes(tree.key)}
                  onChange={() => onCheck(tree.key)}
                  className={checkboxOpacity}
                />
                <Button
                  onClick={() => hasChildren && handleExpand(tree.key)}
                  aria-expanded={isExpanded}
                  className={twMerge(
                    hasChildren ? "cursor-pointer" : "cursor-auto"
                  )}
                  disabled={!hasChildren}
                >
                  {icon ?? (
                    <PlayIcon
                      size={10}
                      className={twMerge(
                        "fill-black transform transform-all duration-300",
                        isExpanded && "rotate-90",
                        hasChildren ? "cursor-pointer" : "cursor-not-allowed"
                      )}
                    />
                  )}
                </Button>
                <Button
                  onClick={() => hasChildren && handleExpand(tree.key)}
                  className={twMerge(
                    hasChildren ? "cursor-pointer" : "cursor-auto"
                  )}
                >
                  <span>{tree.title} </span>
                </Button>
              </span>
              {hasChildren && isExpanded && renderTree(tree.children)}
            </li>
          );
        })}
      </ul>
    );
  };

  return { handleExpand, onCheck, renderTree };
};
