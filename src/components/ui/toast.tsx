import { cn } from "@/lib/utils/cn";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast } from "react-hot-toast";

const iconMap = {
  success: <CheckCircle className="h-4 w-4 text-green-400" />,
  error: <XCircle className="h-4 w-4 text-red-400" />,
  loading: (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
  ),
};

const bgMap = {
  success: "border-green-500/20",
  error: "border-red-500/20",
  loading: "border-white/10",
};

interface ToastItemProps {
  t: Toast;
  message: string;
}

export function ToastItem({ t, message }: ToastItemProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 rounded-xl border bg-[#0f0f1a]/95 px-4 py-3 backdrop-blur-2xl shadow-2xl",
        t.visible ? "animate-enter" : "animate-leave",
        bgMap[t.type as keyof typeof bgMap] ?? "border-white/10",
      )}
    >
      {iconMap[t.type as keyof typeof iconMap] ?? <Info className="h-4 w-4 text-blue-400" />}
      <p className="flex-1 text-sm text-white/90">{message}</p>
      <button
        onClick={() => {
          if (t.type !== "loading") {
            import("react-hot-toast").then((m) => m.default.dismiss(t.id));
          }
        }}
        className="shrink-0 rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export const toastStyles = {
  style: {
    background: "transparent",
    boxShadow: "none",
    padding: 0,
  },
  className: "font-sans",
  duration: 4000,
};
