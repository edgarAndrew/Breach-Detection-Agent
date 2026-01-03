"use client"

import Rule from "@/types/rule"
import RuleGraph from "./rule-graph"
import { getOperatorText } from "@/lib/rule"
import TrendData from "@/types/trendData"
import RunRuleDialog from "./run-rule-dialog"
import { runRuleOnDemand } from "@/lib/api/rule"
import { toast } from "sonner"

type Props = {
    rule: Rule
    data: TrendData
    setData: (data: TrendData) => void;
}

function RuleDetails({ rule, data, setData }: Props) {

    async function runRuleApi({ start_ts, end_ts }: { start_ts: number; end_ts: number }) {
        const response = await runRuleOnDemand(rule._id, start_ts, end_ts)
        if (response.status != 200 || !response.data) {
            toast.error("Failed to run the rule on demand")
            return false;
        }
        const { rule_id, overall_health, threshold, trend } = response.data
        const data = { health: overall_health, org_id: '', rule_id, trend, threshold }
        setData(data)
        return true;
    }

    return (
        <section className="space-y-6">
            <header className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-semibold leading-relaxed">
                        If {rule.attribute_name} {getOperatorText(rule.operator)}{" "} {rule.threshold} within {rule.near_thres}%
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Rule ID: {rule._id}
                    </p>
                </div>

                <RunRuleDialog
                    onRun={async ({ start_ts, end_ts }) => {
                        return await runRuleApi({start_ts, end_ts })
                    }}
                />

            </header>
            {
                data.trend.length > 0 ?
                    <RuleGraph data={data.trend} threshold={data.threshold} health={data.health} />
                    : <p>No data exists for the current time period</p>
            }
        </section>
    )
}
export default RuleDetails;