import { AlertStatus } from "@/types/alert";
import { AlertCircle, AlertTriangle, CheckCircle2 } from "lucide-react";

export const STATUS_CONFIG: Record<AlertStatus, { label: string; bgColor: string; borderColor: string; textColor: string; dotColor: string; icon: React.ReactNode; gradient: string }> = {
    BREACH: {
        label: "Breach",
        bgColor: "bg-red-50 dark:bg-red-950/30",
        borderColor: "border-red-200 dark:border-red-800",
        textColor: "text-red-900 dark:text-red-100",
        dotColor: "bg-red-500",
        icon: <AlertCircle className="w-4 h-4" />,
        gradient: "from-red-500/20 to-transparent",
    },
    NEAR_BREACH: {
        label: "Near Breach",
        bgColor: "bg-amber-50 dark:bg-amber-950/30",
        borderColor: "border-amber-200 dark:border-amber-800",
        textColor: "text-amber-900 dark:text-amber-100",
        dotColor: "bg-amber-500",
        icon: <AlertTriangle className="w-4 h-4" />,
        gradient: "from-amber-500/20 to-transparent",
    },
    SAFE: {
        label: "Safe",
        bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
        borderColor: "border-emerald-200 dark:border-emerald-800",
        textColor: "text-emerald-900 dark:text-emerald-100",
        dotColor: "bg-emerald-500",
        icon: <CheckCircle2 className="w-4 h-4" />,
        gradient: "from-emerald-500/20 to-transparent",
    },
}

export const DETAIL_CARDS = {
    current: {
        bg: "from-blue-500/10 via-blue-400/5 to-transparent",
        border: "border-blue-200 dark:border-blue-800",
        label: "text-blue-700 dark:text-blue-300",
        value: "text-blue-900 dark:text-blue-100",
        icon: "text-blue-600 dark:text-blue-400",
        accent: "bg-blue-500/10"
    },
    threshold: {
        bg: "from-purple-500/10 via-purple-400/5 to-transparent",
        border: "border-purple-200 dark:border-purple-800",
        label: "text-purple-700 dark:text-purple-300",
        value: "text-purple-900 dark:text-purple-100",
        icon: "text-purple-600 dark:text-purple-400",
        accent: "bg-purple-500/10"
    },
    deviation: {
        breach: {
            bg: "from-red-500/10 via-red-400/5 to-transparent",
            border: "border-red-200 dark:border-red-800",
            label: "text-red-700 dark:text-red-300",
            value: "text-red-900 dark:text-red-100",
            icon: "text-red-600 dark:text-red-400",
            accent: "bg-red-500/10"
        },
        safe: {
            bg: "from-emerald-500/10 via-emerald-400/5 to-transparent",
            border: "border-emerald-200 dark:border-emerald-800",
            label: "text-emerald-700 dark:text-emerald-300",
            value: "text-emerald-900 dark:text-emerald-100",
            icon: "text-emerald-600 dark:text-emerald-400",
            accent: "bg-emerald-500/10"
        }
    }
}