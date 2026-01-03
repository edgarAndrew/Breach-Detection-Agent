"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell } from "lucide-react"
import Alert, { AlertStatus } from "@/types/alert"
import { PAGE_SIZE } from "@/constants/shared"
import { getAlerts } from "@/lib/api/alert"
import { toast } from "sonner"
import { SortOption } from "@/types/sort-options"
import PaginationControls from "@/components/alerts/pagination-controls"
import AlertsList from "@/components/alerts/alert-list"
import AlertControls from "@/components/alerts/alert-controls"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/authStore"
import { unixToDate } from "@/lib/utils"

function useUniqueValues<T extends Alert>(alerts: T[], key: keyof T) {

    return useMemo(() => {
        return Array.from(new Set(alerts.map(a => a[key] as string))).sort()
    }, [alerts, key])
}

function AlertsTab() {
    const router = useRouter()
    const isAuthenticated = useAuth(state => state.isAuthenticated)
    const [alerts, setAlerts] = useState<Alert[]>([])
    const [status, setStatus] = useState<AlertStatus | "all">("all")
    const [sort, setSort] = useState<SortOption>("newest")
    const [ruleId, setRuleId] = useState("all")
    const [fieldName, setFieldName] = useState("all")
    const [page, setPage] = useState(1)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadAlerts() {
            try {
                const response = await getAlerts()
                if (response.status === 200) {
                    setAlerts(response.data)
                    toast.success("Alerts loaded successfully")
                } else {
                    toast.error("Failed to load alerts")
                }
            } catch {
                toast.error("Failed to load alerts")
            } finally {
                setIsLoading(false)
            }
        }
        if (!isAuthenticated) {
            router.push('/auth/signin')
            return
        }

        loadAlerts()
    }, [router, isAuthenticated])

    const ruleIds = useUniqueValues(alerts, "rule_id")
    const fieldNames = useUniqueValues(alerts, "field_name")

    const filtered = useMemo(() => {
        let data = alerts
        if (status !== "all") {
            data = data.filter((a) => a.status === status)
        }
        if (ruleId !== "all") {
            data = data.filter((a) => a.rule_id === ruleId)
        }
        if (fieldName !== "all") {
            data = data.filter((a) => a.field_name === fieldName)
        }
        return [...data].sort((a, b) => sort === "newest" ? new Date(unixToDate(a.ingested_at)).getTime() - new Date(unixToDate(b.ingested_at)).getTime() : new Date(unixToDate(a.ingested_at)).getTime() - new Date(unixToDate(b.ingested_at)).getTime())
    }, [status, sort, alerts, ruleId, fieldName])

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    const breachCount = alerts.filter(a => a.status === "BREACH").length

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <div className="px-8 py-12">
                <div className="mx-auto max-w-5xl space-y-8">
                    <div className="space-y-3">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h1 className="text-5xl font-black bg-linear-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent">
                                    Alerts
                                </h1>
                                <p className="text-muted-foreground max-w-2xl mt-2 font-medium">
                                    Real-time monitoring of metric violations. Expand alerts to view detailed analysis and insights.
                                </p>
                            </div>
                            {breachCount > 0 && (
                                <div className="animate-pulse">
                                    <Bell className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                            )}
                        </div>
                    </div>

                    <AlertControls
                        status={status}
                        onStatusChange={(v) => { setStatus(v); setPage(1) }}
                        sort={sort}
                        onSortChange={setSort}
                        totalAlerts={alerts.length}
                        breachCount={breachCount}
                        ruleId={ruleId}
                        onRuleIdChange={(v) => { setRuleId(v); setPage(1) }}
                        fieldName={fieldName}
                        onFieldNameChange={(v) => { setFieldName(v); setPage(1) }}
                        ruleIds={ruleIds}
                        fieldNames={fieldNames}
                    />

                    {isLoading ? (
                        <div className="text-center py-16">
                            <div className="mb-4 flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            </div>
                            <p className="text-muted-foreground font-medium">Loading alerts...</p>
                        </div>
                    ) : (
                        <>
                            <AlertsList alerts={paginated} />
                            <PaginationControls totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AlertsTab;