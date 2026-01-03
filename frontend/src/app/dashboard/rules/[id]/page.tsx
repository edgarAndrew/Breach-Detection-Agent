// import { Metadata } from "next"
'use client'
import RuleDetails from "@/components/rules/rule-details"
import Rule from "@/types/rule"
import { getRuleById } from "@/lib/api/rule";
import { getOrgDetailsByUserId } from "@/lib/api/org";
import { getOrgRulesTrend } from "@/lib/api/trends";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import TrendData from "@/types/trendData";

// export const metadata: Metadata = {
//     title: "Rule Details",
//     description: "View rule configuration, execution results, and insights."
// }

function RuleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const [rule, setRule] = useState<Rule | null>(null);
    const [trendData, setTrendData] = useState<TrendData | null>(null);

    useEffect(() => {
        async function fetchData() {
            const { id } = await params;
            const response = await getRuleById(id);
            setRule(response.data);
            if (response.status !== 200 || !response.data) {
                toast.error("Failed to fetch rule details.");
                return;
            }
            const orgResponse = await getOrgDetailsByUserId();
            if (orgResponse.status != 200 || !orgResponse.data) {
                toast.error("Failed to fetch organization details.");
                return;
            }
            // const trendResponse = await getOrgRulesTrend(id, orgResponse.data.org_id);
            const trendResponse = await getOrgRulesTrend('rule_001', 'os-comp');
            if (trendResponse.status != 200 || !trendResponse.data) {
                toast.error("Failed to fetch trend data.");
                return;
            }
            setTrendData(trendResponse.data);

        }
        fetchData();
    }, [params]);

    return (
        <main className="mx-auto w-full max-w-5xl px-4 space-y-8">
            {rule && trendData && <RuleDetails rule={rule} data={trendData} />}
        </main>
    )
}
export default RuleDetailsPage;