import React from "react";
import { DropdownTrigger } from "./_components/DropdownTrigger";
import { DropdownContent } from "./_components/DropdownContent";
import { useDropdown } from "./useDropdown";

type DropdownProps = {
  children: [
    React.ReactElement<typeof DropdownTrigger>,
    React.ReactElement<typeof DropdownContent>
  ];
  hover?: boolean;
};
export const Dropdown: React.FC<DropdownProps> = ({
  children,
  hover = false,
}) => {
  const { setVisible } = useDropdown();

  return (
    <div
      className="relative"
      onMouseEnter={hover ? () => setVisible(true) : undefined}
      onMouseLeave={hover ? () => setVisible(false) : undefined}
    >
      {children}
    </div>
  );
};
