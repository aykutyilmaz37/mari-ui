import React from "react";
import { DropdownTrigger } from "./_components/DropdownTrigger";
import { DropdownContent } from "./_components/DropdownContent";

type DropdownProps = {
  children: [
    React.ReactElement<typeof DropdownTrigger>,
    React.ReactElement<typeof DropdownContent>
  ];
  onChange: (value: boolean) => void;
  hover?: boolean;
};
export const Dropdown: React.FC<DropdownProps> = ({
  children,
  onChange,
  hover = false,
}) => {
  return (
    <div
      className="relative inline-block"
      onMouseEnter={hover ? () => onChange(true) : undefined}
      onMouseLeave={hover ? () => onChange(false) : undefined}
    >
      {children}
    </div>
  );
};
