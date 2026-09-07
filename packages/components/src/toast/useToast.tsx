"use client";

const TOAST_TIMEOUT = 5000;

const generateToastId = () => Date.now();

const removeToastAfterDelay = (
  id: number,
  setToasts: React.Dispatch<React.SetStateAction<ToastData[]>>
) => {
  setTimeout(() => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, TOAST_TIMEOUT);
};

const handleClose = (
  id: number,
  setToasts: React.Dispatch<React.SetStateAction<ToastData[]>>
) => {
  setToasts((prev) => prev.filter((t) => t.id !== id));
};
import React, { createContext, useContext, useState } from "react";
import { ToastType } from "./types";
import { Toast } from "./Toast";

type ToastData = {
  id: number;
  title: string;
  description?: string;
  type?: ToastType;
};

type ToastContextType = {
  showToast: (t: Omit<ToastData, "id">) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = React.useCallback((toast: Omit<ToastData, "id">) => {
    const id = generateToastId();
    setToasts((prev) => [...prev, { ...toast, id }]);
    removeToastAfterDelay(id, setToasts);
  }, []);

  const contextValue = React.useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="static z-[9999]">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() => handleClose(toast.id, setToasts)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
