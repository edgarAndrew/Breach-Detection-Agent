"use client"

import Rule from "@/types/rule"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import RuleInsights from "./rule-insights"
import RuleGraph from "./rule-graph"
import { getOperatorText } from "@/lib/rule"

type Props = {
    rule: Rule
    data: { timestamp: string; value: number }[]
}

function RuleDetails({ rule, data }: Props) {
    function handleRun() {
        // TODO: Call run in the background
        console.log(rule._id)
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
                <Button onClick={handleRun} className="gap-2">
                    <Play className="h-4 w-4" />
                    Run rule
                </Button>
            </header>
            <RuleGraph data={data} threshold={rule.threshold} />
            <RuleInsights rule={rule} data={data} />
        </section>
    )
}
export default RuleDetails;