import * as React from "react"
import { cn } from "@/lib/utils"

type StatusDotStatus = "completed" | "running" | "failed" | "pending" | "idle"

interface StatusDotProps {
  status: StatusDotStatus
  size?: "sm" | "md"
  className?: string
}

const STATUS_CONFIG: Record<
  StatusDotStatus,
  { colorClass: string; pulseClass: string; label: string }
> = {
  completed: {
    colorClass: "bg-emerald-500",
    pulseClass: "",
    label: "Completed",
  },
  running: {
    colorClass: "bg-amber-500",
    pulseClass: "animate-pulse",
    label: "Running",
  },
  failed: {
    colorClass: "bg-red-500",
    pulseClass: "",
    label: "Failed",
  },
  pending: {
    colorClass: "bg-gray-300 dark:bg-gray-600",
    pulseClass: "",
    label: "Pending",
  },
  idle: {
    colorClass: "bg-gray-200 dark:bg-gray-700",
    pulseClass: "",
    label: "Idle",
  },
}

const SIZE_CLASS: Record<"sm" | "md", string> = {
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
}

function StatusDot({ status, size = "md", className }: StatusDotProps) {
  const config = STATUS_CONFIG[status]
  const sizeClass = SIZE_CLASS[size]

  return (
    <span
      role="img"
      aria-label={config.label}
      className={cn(
        "rounded-full inline-block shrink-0",
        sizeClass,
        config.colorClass,
        config.pulseClass,
        className
      )}
    />
  )
}

export { StatusDot }
export type { StatusDotProps, StatusDotStatus }
