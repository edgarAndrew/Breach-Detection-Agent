import { Metadata } from "next"
import { notFound } from "next/navigation"
import RuleDetails from "@/components/rules/rule-details"
import Rule from "@/types/rule"

export const metadata: Metadata = {
    title: "Rule Details",
    description: "View rule configuration, execution results, and insights."
}

async function fetchRule(id: string): Promise<Rule> {
    return {
        id,
        field: "CPU Usage",
        operator: ">",
        threshold: 75,
        near_thres: 5,
    }
}

async function fetchRuleData(id: string) {
    console.log(id)
    return Array.from({ length: 24 }).map((_, i) => ({
        timestamp: `T-${24 - i}h`,
        value: 40 + Math.random() * 50,
    }))
}

async function RuleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const rule = await fetchRule(id)
    const data = await fetchRuleData(id)

    if (!rule || !data) {
        notFound()
    }

    return (
        <main className="mx-auto w-full max-w-5xl px-4 space-y-8">
            <RuleDetails rule={rule} data={data} />
        </main>
    )
}
export default RuleDetailsPage;