"use client";
import React, { createContext, useContext, useState, useMemo } from "react";

type DropdownContextType = {
  visible: boolean;
  setVisible: (val: boolean) => void;
};
const DropdownContext = createContext<DropdownContextType | null>(null);

export const DropdownProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);

  const value = useMemo(() => ({ visible, setVisible }), [visible]);

  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
};

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("useDropdown must be used inside a <DropdownContext>");
  }
  return context;
};
