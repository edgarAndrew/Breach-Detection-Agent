import { cn } from "@/lib/utils";

function PulsingDot({ color }: { color: string }) {
    return (
        <div className="relative w-3 h-3">
            <div className={cn("absolute inset-0 rounded-full animate-pulse", color)} />
            <div className={cn("absolute inset-0 rounded-full", color)} />
        </div>
    )
}
export default PulsingDot;