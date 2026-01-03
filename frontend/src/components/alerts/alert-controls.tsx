import { SORT_OPTIONS, STATUS_OPTIONS } from "@/constants/alert";
import { AlertStatus } from "@/types/alert"
import type { SortOption } from '@/types/sort-options';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";

interface AlertControlsProps {
    status: AlertStatus | "all"
    onStatusChange: (value: AlertStatus | "all") => void
    sort: SortOption
    onSortChange: (value: SortOption) => void
    totalAlerts: number
    breachCount: number
    ruleId: string
    onRuleIdChange: (value: string) => void
    fieldName: string
    onFieldNameChange: (value: string) => void
    ruleIds: string[]
    fieldNames: string[]
}

function AlertControls({ status, onStatusChange, sort, onSortChange, totalAlerts, breachCount, ruleId, onRuleIdChange, fieldName, onFieldNameChange, ruleIds, fieldNames }: AlertControlsProps) {
    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                {breachCount > 0 && (
                    <div className="px-4 py-3 rounded-lg bg-linear-to-r from-red-50 to-red-100/50 dark:from-red-950/40 dark:to-red-900/30 border border-red-200 dark:border-red-800 flex items-center gap-2 animate-pulse">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                        <span className="text-sm font-bold text-red-900 dark:text-red-100">
                            {breachCount} Active {breachCount === 1 ? "Breach" : "Breaches"}
                        </span>
                    </div>
                )}
                <span className="text-sm font-semibold text-muted-foreground ml-auto">
                    {totalAlerts} total alert{totalAlerts !== 1 ? "s" : ""}
                </span>
            </div>

            <div className="flex flex-wrap gap-3">
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-44 font-semibold">
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        {STATUS_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={sort} onValueChange={onSortChange}>
                    <SelectTrigger className="w-44 font-semibold">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        {SORT_OPTIONS.map(({ value, label }) => (
                            <SelectItem key={value} value={value}>
                                {label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={ruleId} onValueChange={onRuleIdChange}>
                    <SelectTrigger className="w-44 font-semibold">
                        <SelectValue placeholder="All Rule IDs" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Rule IDs</SelectItem>
                        {ruleIds.map((id) => (
                            <SelectItem key={id} value={id}>
                                {id}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={fieldName} onValueChange={onFieldNameChange}>
                    <SelectTrigger className="w-44 font-semibold">
                        <SelectValue placeholder="All Fields" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Fields</SelectItem>
                        {fieldNames.map((name) => (
                            <SelectItem key={name} value={name}>
                                {name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}

export default AlertControls;