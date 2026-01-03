'use client';
import { DETAIL_CARDS, STATUS_CONFIG } from "@/constants/styles";
import { cn, unixToDate } from "@/lib/utils";
import Alert from "@/types/alert";
import { AlertCircle, Bell, ChevronDown, Clock, Sparkles, TrendingUp, Zap } from "lucide-react";
import DetailCard from "./detail-card";
import PulsingDot from "./pulsing-dot";

function AlertRow({ alert, isOpen, onToggle }: { alert: Alert; isOpen: boolean; onToggle: () => void }) {

    const config = STATUS_CONFIG[alert.status]
    const formattedDate = new Date(unixToDate(alert.ingested_at)).toLocaleString()
    const percentDiff = Math.abs(((alert.current_value - alert.threshold) / alert.threshold) * 100).toFixed(1)
    const isExceeding = alert.current_value > alert.threshold
    const deviationConfig = isExceeding ? DETAIL_CARDS.deviation.breach : DETAIL_CARDS.deviation.safe

    return (
        <div className={cn(
            "group border rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 relative",
            config.borderColor,
            config.bgColor,
            isOpen && "shadow-lg border-opacity-100"
        )}>
            <div className="absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-lg -z-10"
                style={{
                    background: config.dotColor.includes('red') ? 'rgba(239, 68, 68, 0.3)' :
                        config.dotColor.includes('amber') ? 'rgba(245, 158, 11, 0.3)' :
                            'rgba(16, 185, 129, 0.3)'
                }}
            />

            <button
                onClick={onToggle}
                className={cn(
                    "w-full flex items-center justify-between px-6 py-5 text-left transition-all duration-300",
                    isOpen ? "bg-opacity-60" : "group-hover:bg-black/3 dark:group-hover:bg-white/5"
                )}
            >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="shrink-0 mt-1">
                        <PulsingDot color={config.dotColor} />
                    </div>

                    <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110", config.bgColor)}>
                                {config.icon}
                            </div>
                            <h3 className="font-bold text-base leading-none truncate">{alert.rule_name}</h3>
                            <span className={cn("text-xs px-3 py-1.5 rounded-full font-bold transition-all duration-300 group-hover:shadow-lg group-hover:scale-105", config.bgColor, config.textColor)}>
                                {config.label}
                            </span>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Zap className="w-3.5 h-3.5" />
                                {alert.field_name}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {unixToDate(alert.ingested_at).toLocaleString()}
                            </span>
                            {alert.email_sent && (
                                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                                    <Bell className="w-3.5 h-3.5" />
                                    Email sent
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 ml-4">
                    <ChevronDown className={cn("h-5 w-5 transition-transform duration-300", isOpen && "rotate-180")} />
                </div>
            </button>

            {isOpen && (
                <div className={cn("border-t bg-linear-to-b", config.gradient, config.borderColor)}>
                    <div className="px-6 py-6 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Alert Details</p>
                            </div>
                            <p className="text-sm leading-relaxed text-foreground font-medium">{alert.message}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <DetailCard
                                label="Current Value"
                                value={alert.current_value}
                                colorConfig={DETAIL_CARDS.current}
                                icon={({ className }) => <Zap className={className} />}
                            />
                            <DetailCard
                                label="Threshold"
                                value={alert.threshold}
                                colorConfig={DETAIL_CARDS.threshold}
                                icon={({ className }) => <AlertCircle className={className} />}
                            />
                            <DetailCard
                                label="Deviation"
                                value={`${percentDiff}%`}
                                colorConfig={deviationConfig}
                                icon={({ className }) => <TrendingUp className={className} />}
                            />
                        </div>

                        <div className="pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground font-medium">
                                🕐 Triggered on {formattedDate}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AlertRow;