"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { AlertIcon, CheckIcon, CloseIcon } from "./icons";

type Tone = "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

interface ToastContextValue {
  notify: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const VISIBLE_FOR = 3200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);
  const timers = useRef<number[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: Tone = "success") => {
      const id = nextId.current++;
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);

      const timer = window.setTimeout(() => dismiss(id), VISIBLE_FOR);
      timers.current.push(timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm shadow-lg ring-1 animate-slide-up",
              toast.tone === "success"
                ? "bg-slate-900 text-slate-50 ring-slate-900/10"
                : "bg-rose-600 text-white ring-rose-700/20",
            )}
          >
            {toast.tone === "success" ? (
              <CheckIcon className="h-4 w-4 shrink-0" />
            ) : (
              <AlertIcon className="h-4 w-4 shrink-0" />
            )}
            <span className="min-w-0 flex-1 break-words">{toast.message}</span>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-md p-1 opacity-70 transition hover:opacity-100"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a ToastProvider");
  }
  return context;
}
