/**
 * Milo Toast — minimal, sleek, icon-based notifications.
 *
 * Usage:
 *   import { toast } from "@/components/ui/toast"
 *   toast.success("Node created")
 *   toast.error("Failed to sync")
 *   toast.info("Syncing email…")
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react"
import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"

/* ---------- types --------------------------------------------------------- */

type ToastVariant = "success" | "error" | "info" | "warning"

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastAPI {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
  warning: (message: string) => void
}

/* ---------- context ------------------------------------------------------- */

interface ToastContextValue {
  add: (message: string, variant: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

/* ---------- icons (inline SVG so no extra dep) ---------------------------- */

function Icon({ variant }: { variant: ToastVariant }) {
  if (variant === "success") {
    return (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity=".3" />
        <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (variant === "error") {
    return (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
        <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity=".3" />
        <path d="M6 6l4 4M10 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  if (variant === "warning") {
    return (
      <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
        <path d="M8 2.5L14.5 13.5H1.5L8 2.5Z" stroke="currentColor" strokeOpacity=".3" strokeLinejoin="round" />
        <path d="M8 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.5" r=".75" fill="currentColor" />
      </svg>
    )
  }
  // info
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeOpacity=".3" />
      <path d="M8 7.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5.25" r=".75" fill="currentColor" />
    </svg>
  )
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-emerald-500/40 text-emerald-400",
  error:   "border-rose-500/40    text-rose-400",
  warning: "border-amber-500/40   text-amber-400",
  info:    "border-border         text-muted-foreground",
}

/* ---------- single toast -------------------------------------------------- */

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDismiss(item.id), 3500)
    return () => clearTimeout(t)
  }, [item.id, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{    opacity: 0, y: -8, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      onClick={() => onDismiss(item.id)}
      className={cn(
        "flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5",
        "bg-popover shadow-lg backdrop-blur-sm select-none text-sm font-medium",
        VARIANT_STYLES[item.variant]
      )}
    >
      <Icon variant={item.variant} />
      <span className="text-foreground">{item.message}</span>
    </motion.div>
  )
}

/* ---------- provider ------------------------------------------------------ */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((message: string, variant: ToastVariant) => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => {
      // Deduplicate: skip if identical message already visible
      if (prev.some((t) => t.message === message)) return prev
      return [...prev.slice(-3), { id, message, variant }] // max 4 visible
    })
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Expose imperative API on module-level singleton
  useEffect(() => {
    toastAPI.current = {
      success: (m) => add(m, "success"),
      error:   (m) => add(m, "error"),
      info:    (m) => add(m, "info"),
      warning: (m) => add(m, "warning"),
    }
    return () => { toastAPI.current = null }
  }, [add])

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem item={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

/* ---------- imperative singleton API ------------------------------------- */

const toastAPI = { current: null as ToastAPI | null }

export const toast: ToastAPI = {
  success: (m) => toastAPI.current?.success(m),
  error:   (m) => toastAPI.current?.error(m),
  info:    (m) => toastAPI.current?.info(m),
  warning: (m) => toastAPI.current?.warning(m),
}

/* ---------- hook (optional) ----------------------------------------------- */

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>")
  return ctx
}
