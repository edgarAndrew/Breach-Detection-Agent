"use client"

import { useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const PAGE_SIZE = 5

const alerts = Array.from({ length: 23 }).map((_, i) => ({
    id: String(i),
    title:
        i % 2 === 0
            ? "Revenue drop detected"
            : "P/E ratio threshold exceeded",
    metric: i % 2 === 0 ? "Revenue" : "P/E Ratio",
    severity: i % 3 === 0 ? "critical" : "warning",
    triggeredAt: new Date(
        Date.now() - i * 3600_000
    ).toISOString(),
    explanation:
        "The metric violated the configured rule based on recent data. This may indicate underlying performance changes or data ingestion issues.",
}))

export default function AlertsPage() {
    const [severity, setSeverity] = useState<
        "all" | "critical" | "warning"
    >("all")
    const [sort, setSort] = useState<"newest" | "oldest">(
        "newest"
    )
    const [page, setPage] = useState(1)
    const [openId, setOpenId] = useState<string | null>(null)

    

    const filtered = useMemo(() => {
        let data = alerts

        if (severity !== "all") {
            data = data.filter(
                (a) => a.severity === severity
            )
        }

        data = [...data].sort((a, b) =>
            sort === "newest"
                ? +new Date(b.triggeredAt) -
                +new Date(a.triggeredAt)
                : +new Date(a.triggeredAt) -
                +new Date(b.triggeredAt)
        )

        return data
    }, [severity, sort])

    const totalPages = Math.ceil(
        filtered.length / PAGE_SIZE
    )

    const paginated = filtered.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE
    )

    return (
        <div className="px-8 py-10">
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold">
                        Alerts
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Alerts are generated when metrics violate configured
                        rules. Expand an alert to understand why it occurred.
                    </p>
                </div>

                {/* Controls */}
                <div className="flex gap-4">
                    <Select
                        value={severity}
                        onValueChange={(v) => {
                            setPage(1)
                            setSeverity(v as any)
                        }}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                All severities
                            </SelectItem>
                            <SelectItem value="critical">
                                Critical
                            </SelectItem>
                            <SelectItem value="warning">
                                Warning
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={sort}
                        onValueChange={(v) =>
                            setSort(v as any)
                        }
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">
                                Newest first
                            </SelectItem>
                            <SelectItem value="oldest">
                                Oldest first
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Alerts */}
                <div className="space-y-3">
                    {paginated.map((alert) => {
                        const open = openId === alert.id

                        return (
                            <div
                                key={alert.id}
                                className="border rounded-md"
                            >
                                <button
                                    onClick={() =>
                                        setOpenId(
                                            open ? null : alert.id
                                        )
                                    }
                                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    alert.severity ===
                                                        "critical"
                                                        ? "bg-red-500"
                                                        : "bg-yellow-500"
                                                )}
                                            />
                                            <span className="font-medium">
                                                {alert.title}
                                            </span>
                                        </div>

                                        <p className="text-xs text-muted-foreground">
                                            Metric: {alert.metric} •{" "}
                                            {new Date(
                                                alert.triggeredAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <ChevronDown
                                        className={cn(
                                            "h-4 w-4 transition-transform",
                                            open && "rotate-180"
                                        )}
                                    />
                                </button>

                                {open && (
                                    <div className="border-t bg-muted/20 px-4 py-3 text-sm">
                                        <p className="font-medium mb-1">
                                            Why this alert was triggered
                                        </p>
                                        <p className="text-muted-foreground">
                                            {alert.explanation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Pagination */}
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setPage((p) =>
                                        Math.max(1, p - 1)
                                    )
                                }}
                            />
                        </PaginationItem>

                        {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                        ).map((p) => (
                            <PaginationItem key={p}>
                                <PaginationLink
                                    href="#"
                                    isActive={p === page}
                                    onClick={(e) => {
                                        e.preventDefault()
                                        setPage(p)
                                    }}
                                >
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}

                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setPage((p) =>
                                        Math.min(
                                            totalPages,
                                            p + 1
                                        )
                                    )
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    )
}
