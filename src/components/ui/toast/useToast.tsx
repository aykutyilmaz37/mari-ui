import React from "react";
import { ToastType } from "./types";
import { Toast } from "./Toast";

export const useToast = () => {
  // Toast state'i
  const [toasts, setToasts] = React.useState<
    { id: number; title: string; description?: string; type?: ToastType }[]
  >([]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };
  // Toast ekleme fonksiyonu
  const showToast = (toast: {
    title: string;
    description?: string;
    type?: ToastType;
  }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  
  const ToastProvider = () => {
    return (
      <div className="static z-[9999]">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            type={toast.type}
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </div>
    );
  };

  return { showToast, ToastProvider };
};
