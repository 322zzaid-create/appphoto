import { cn } from "@/lib/utils/cn";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import type { Toast } from "react-hot-toast";
import toast from "react-hot-toast";

type ToastKind = "success" | "error" | "loading";

const iconMap: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
  loading: (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
  ),
};

const styleMap: Record<ToastKind, { border: string; icon: string; glow: string }> = {
  success: {
    border: "border-emerald-500/25",
    icon: "bg-emerald-500/15 text-emerald-400",
    glow: "shadow-[0_8px_40px_-12px_rgba(16,185,129,0.5)]",
  },
  error: {
    border: "border-red-500/25",
    icon: "bg-red-500/15 text-red-400",
    glow: "shadow-[0_8px_40px_-12px_rgba(239,68,68,0.5)]",
  },
  loading: {
    border: "border-white/15",
    icon: "bg-white/10 text-white",
    glow: "shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)]",
  },
};

interface ToastItemProps {
  t: Toast;
  message: string;
  type?: ToastKind;
}

export function ToastItem({ t, message, type }: ToastItemProps) {
  const kind: ToastKind =
    type ?? (t.type === "success" || t.type === "error" ? t.type : "loading");
  const s = styleMap[kind];

  return (
    <div
      className={cn(
        "pointer-events-auto flex w-[min(92vw,26rem)] items-center gap-3 rounded-2xl border px-4 py-3",
        "bg-[#12121e]/95 backdrop-blur-2xl",
        s.border,
        s.glow,
        t.visible ? "toast-in" : "toast-out",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          s.icon,
        )}
      >
        {iconMap[kind] ?? <Info className="h-4 w-4" />}
      </span>
      <p className="flex-1 text-sm font-medium text-white/90">{message}</p>
      <button
        onClick={() => {
          if (t.type !== "loading") toast.dismiss(t.id);
        }}
        aria-label="Dismiss"
        className="shrink-0 rounded-lg p-1 text-white/30 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
