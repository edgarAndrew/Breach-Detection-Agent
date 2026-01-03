'use client';
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import AlertRow from "./alert-row";
import Alert from "@/types/alert";

function AlertsList({ alerts }: { alerts: Alert[] }) {
    const [openId, setOpenId] = useState<string | null>(null)

    return (
        <div className="space-y-3">
            {alerts.length === 0 ? (
                <div className="text-center py-16">
                    <div className="mb-4 flex justify-center">
                        <div className="p-4 rounded-full bg-linear-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/30">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <p className="text-lg font-bold">No alerts found</p>
                    <p className="text-sm text-muted-foreground mt-1">Everything is running smoothly! 🎉</p>
                </div>
            ) : (
                alerts.map((alert) => (
                    <AlertRow
                        key={alert._id}
                        alert={alert}
                        isOpen={openId === alert._id}
                        onToggle={() => setOpenId(openId === alert._id ? null : alert._id)}
                    />
                ))
            )}
        </div>
    )
}

export default AlertsList;