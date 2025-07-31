import { TreeData } from "./types";

export const getAllChildKeys = (node: TreeData): string[] => {
  if (!node.children) return [];
  return node.children.reduce<string[]>(
    (acc, child) => [...acc, child.key, ...getAllChildKeys(child)],
    []
  );
};

export const findParentKey = (
  data: TreeData[],
  childKey: string,
  parentKey: string | null = null
): string | null => {
  for (const node of data) {
    if (node.key === childKey) return parentKey;
    if (node.children) {
      const found = findParentKey(node.children, childKey, node.key);
      if (found) return found;
    }
  }
  return null;
};

export const findNodeByKey = (
  data: TreeData[],
  key: string
): TreeData | null => {
  for (const node of data) {
    if (node.key === key) return node;
    if (node.children) {
      const found = findNodeByKey(node.children, key);
      if (found) return found;
    }
  }
  return null;
};

export const getAllParentKeys = (
  data: TreeData[],
  childKey: string
): string[] => {
  const parentKey = findParentKey(data, childKey);
  if (parentKey) {
    return [parentKey, ...getAllParentKeys(data, parentKey)];
  }
  return [];
};

export const removeUnneededParents = (
  data: TreeData[],
  checked: string[],
  childKey: string
): string[] => {
  const parentKey = findParentKey(data, childKey);
  if (!parentKey) return checked;
  const parentNode = findNodeByKey(data, parentKey);
  if (!parentNode?.children) return checked;
  const hasOtherCheckedChild = parentNode.children.some(
    (child) => child.key !== childKey && checked.includes(child.key)
  );
  if (!hasOtherCheckedChild) {
    const newChecked = checked.filter((k) => k !== parentKey);
    return removeUnneededParents(data, newChecked, parentKey);
  }
  return checked;
};

// Bir parent'ın herhangi bir child'ı checkedKeys içinde mi?
export const hasAnyCheckedChild = (
  node: import("./types").TreeData,
  checkedKeys: string[]
): boolean => {
  if (!node.children) return false;
  return node.children.some(
    (child) =>
      checkedKeys.includes(child.key) || hasAnyCheckedChild(child, checkedKeys)
  );
};
