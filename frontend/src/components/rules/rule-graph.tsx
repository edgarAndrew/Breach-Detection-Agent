type Point = {
    timestamp: string
    value: number
}

function RuleGraph({ data, threshold }: { data: Point[], threshold: number }) {
    return (
        <section className="rounded-lg border p-4">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
                Metric trend (last 24h)
            </h2>
            {/* TODO: Replace the placeholder graph */}
            <div className="h-48 flex items-end gap-1">
                {data.map((p, i) => (
                    <div key={i} className={`flex-1 rounded-sm ${p.value > threshold ? "bg-red-500/70" : "bg-blue-500/70"}`} style={{ height: `${p.value}%` }} title={`${p.timestamp}: ${p.value.toFixed(1)}`}
                    />
                ))}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
                Red bars indicate values breaching the threshold.
            </p>
        </section>
    )
}
export default RuleGraph;