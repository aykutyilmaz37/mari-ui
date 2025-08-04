import React from "react";

type DropdownTriggerProps = {
  children: React.ReactNode;
  visible: boolean;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export const DropdownTrigger: React.FC<DropdownTriggerProps> = ({
  children,
  visible,
  setVisible,
}) => {
  const handleTrigger = () => setVisible(!visible);

  return <div onClick={handleTrigger}>{children}</div>;
};
