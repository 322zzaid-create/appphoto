"use client";

import { toast as hotToast } from "react-hot-toast";
import { ToastItem } from "@/components/ui/toast";

const DEFAULT_DURATION = 4000;

export const toast = {
  success(message: string) {
    hotToast.custom(
      (t) => <ToastItem t={t} message={message} type="success" />,
      { duration: DEFAULT_DURATION },
    );
  },
  error(message: string) {
    hotToast.custom(
      (t) => <ToastItem t={t} message={message} type="error" />,
      { duration: DEFAULT_DURATION },
    );
  },
};
