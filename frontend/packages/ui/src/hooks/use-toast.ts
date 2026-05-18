"use client";

import { toast as sonnerToast } from "sonner";

export type ToastOptions = {
  description?: string;
  duration?: number;
  icon?: React.ReactNode;
};

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    return sonnerToast.success(message, options);
  },
  error: (message: string, options?: ToastOptions) => {
    return sonnerToast.error(message, options);
  },
  info: (message: string, options?: ToastOptions) => {
    return sonnerToast(message, options);
  },
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

export { Toaster } from "../components/ui/toast";