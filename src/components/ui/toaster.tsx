"use client"

import { useEffect, useState, createContext, useContext, useCallback } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info"

interface Toast {
  id:      string
  message: string
  type:    ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

// ── Context ───────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <Toaster>")
  return ctx
}

// ── Provider + renderer ───────────────────────────────────────────────────────

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => dismiss(id), 3500)
  }, [dismiss])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-5 left-1/2 z-[9999] flex -translate-x-1/2 flex-col-reverse items-center gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// ── Single toast ──────────────────────────────────────────────────────────────

const ICON = {
  success: <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />,
  error:   <XCircle     className="h-4 w-4 text-red-500   shrink-0" />,
  info:    <AlertCircle className="h-4 w-4 text-blue-500  shrink-0" />,
}

const STYLE = {
  success: "border-green-200 bg-white",
  error:   "border-red-200   bg-white",
  info:    "border-blue-200  bg-white",
}

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  // Fade-in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 shadow-lg",
        "text-sm font-medium text-gray-800 transition-all duration-300",
        STYLE[t.type],
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
    >
      {ICON[t.type]}
      <span>{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        className="ml-1 rounded p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
