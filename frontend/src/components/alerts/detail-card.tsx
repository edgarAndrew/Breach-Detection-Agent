import { DETAIL_CARDS } from "@/constants/styles"
import { cn } from "@/lib/utils"

interface DetailCardProps {
    label: string
    value: string | number
    colorConfig: typeof DETAIL_CARDS.current
    icon?: React.ComponentType<{ className: string }>
    showLabel?: boolean
}

function DetailCard({ label, value, colorConfig, icon: IconComponent }: DetailCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl border p-4 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer",
            `bg-linear-to-br ${colorConfig.bg}`,
            colorConfig.border
        )}>
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-linear-to-r from-white via-transparent to-transparent" />

            <div className={cn(
                "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur",
                colorConfig.border
            )} />

            <div className="absolute -top-1 -right-1 w-20 h-20 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-2xl" style={{
                background: colorConfig.bg.includes('blue') ? 'rgb(59, 130, 246)' :
                    colorConfig.bg.includes('purple') ? 'rgb(147, 51, 234)' :
                        'rgb(16, 185, 129)'
            }} />

            <div className="relative space-y-2">
                <div className="flex items-center justify-between">
                    <p className={cn("text-xs font-semibold uppercase tracking-wider transition-all duration-300 group-hover:scale-110 origin-left", colorConfig.label)}>
                        {label}
                    </p>
                    {IconComponent && (
                        <IconComponent className={cn("w-4 h-4 transition-all duration-300 group-hover:scale-125 group-hover:rotate-12", colorConfig.icon)} />
                    )}
                </div>
                <p className={cn("text-2xl font-bold tracking-tight transition-all duration-300 group-hover:scale-110 origin-left", colorConfig.value)}>
                    {value}
                </p>
            </div>
            <div className="absolute inset-0 translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-linear-to-r from-transparent via-white/20 dark:via-white/10 to-transparent" />
        </div>
    )
}

export default DetailCard;