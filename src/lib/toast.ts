// Global toast instance - will be set by ToastProvider
let toastInstance: {
  showToast: (
    type: "success" | "error" | "warning" | "info",
    message: string,
    duration?: number,
    icon?: React.ReactNode,
    id?: string
  ) => void;
} | null = null;

export const setToastInstance = (instance: typeof toastInstance) => {
  toastInstance = instance;
};

// Generate a stable ID from message content for automatic deduplication
// Identical messages will update existing toast instead of creating duplicates
const generateToastId = (type: string, message: string): string => {
  return `${type}-${message.slice(0, 50).replace(/\s+/g, "-").toLowerCase()}`;
};

// Global toast API with automatic deduplication
export const toast = {
  success: (message: string, duration = 2500, icon?: React.ReactNode) => {
    const id = generateToastId("success", message);
    toastInstance?.showToast("success", message, duration, icon, id);
  },

  error: (message: string, duration = 2500, icon?: React.ReactNode) => {
    const id = generateToastId("error", message);
    toastInstance?.showToast("error", message, duration, icon, id);
  },

  warn: (message: string, duration = 2500, icon?: React.ReactNode) => {
    const id = generateToastId("warning", message);
    toastInstance?.showToast("warning", message, duration, icon, id);
  },

  info: (message: string, duration = 2500, icon?: React.ReactNode) => {
    const id = generateToastId("info", message);
    toastInstance?.showToast("info", message, duration, icon, id);
  },
};

