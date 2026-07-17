import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Minimal ScrollArea — a plain div with the project's custom scrollbar class.
 * Mirrors the shadcn ScrollArea API surface so the Threads tree code works unchanged.
 * ref is intentionally not forwarded (not needed for our implementation).
 */
function ScrollArea({
  className,
  children,
  dir,
  ref: _ref,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { dir?: string; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      dir={dir}
      className={cn("scrollbar-thin overflow-auto", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { ScrollArea }
