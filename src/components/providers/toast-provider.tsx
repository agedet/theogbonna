import React, { useEffect } from "react";
import { setToastInstance } from "../../lib/toast";
import { toast, Toaster } from "sonner";

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    setToastInstance({
      showToast: (type, message, duration, icon, id) => {
        // Pass id for deduplication - Sonner will update existing toast instead of creating duplicate
        const options = { duration, icon, id };
        switch (type) {
          case "success":
            toast.success(message, options);
            break;
          case "error":
            toast.error(message, options);
            break;
          case "warning":
            toast.warning(message, options);
            break;
          case "info":
            toast.info(message, options);
            break;
        }
      },
    });
  }, []);

  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
};
