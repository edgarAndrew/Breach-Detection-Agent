import Rule from "@/types/rule"

function RuleInsights({ rule, data }: { rule: Rule, data: { value: number }[] }) {
    const max = Math.max(...data.map((d) => d.value))
    const breaches = data.filter((d) => d.value > rule.threshold).length

    return (
        <section className="rounded-lg border p-4 space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
                Insights
            </h2>
            <ul className="text-sm space-y-1">
                <li>
                    • Maximum observed value:{" "}
                    <span className="font-medium">{max.toFixed(1)}</span>
                </li>
                <li>
                    • Threshold breaches:{" "}
                    <span className="font-medium">{breaches}</span>
                </li>
                <li>
                    • Rule would have triggered{" "}
                    <span className="font-medium">
                        {breaches > 0 ? "at least once" : "no alerts"}
                    </span>{" "}
                    in this period.
                </li>
            </ul>
        </section>
    )
}
export default RuleInsights;