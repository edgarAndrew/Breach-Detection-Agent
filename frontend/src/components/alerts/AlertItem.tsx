"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

type AlertItemProps = {
    alert: {
        id: string
        title: string
        metric: string
        severity: "critical" | "warning"
        triggeredAt: string
        summary: string
        explanation: string
    }
}

export function AlertItem({ alert }: AlertItemProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="border rounded-md">
            {/* Summary row */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left hover:bg-muted/40"
            >
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "h-2 w-2 rounded-full mt-1",
                                alert.severity === "critical"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                            )}
                        />
                        <p className="font-medium">
                            {alert.title}
                        </p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {alert.summary}
                    </p>

                    <p className="text-xs text-muted-foreground">
                        Metric: {alert.metric} •{" "}
                        {new Date(alert.triggeredAt).toLocaleString()}
                    </p>
                </div>

                <ChevronDown
                    className={cn(
                        "h-4 w-4 mt-1 transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>

            {/* Expanded explanation */}
            {open && (
                <div className="border-t bg-muted/20 px-4 py-3 text-sm">
                    <p className="font-medium mb-1">
                        Why this happened
                    </p>
                    <p className="text-muted-foreground">
                        {alert.explanation}
                    </p>
                </div>
            )}
        </div>
    )
}
