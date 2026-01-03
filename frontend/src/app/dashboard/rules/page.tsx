import type { Metadata } from "next"
import RuleTable from "@/components/rules/rule-table"

export const metadata: Metadata = {
    title: "Rules",
    description: "View and manage your alert rules",
}

function RuleListPage() {
    return (
        <main className="mx-auto w-full max-w-4xl px-4">
            <header className="pb-4 md:pb-6">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                    Organization Rules
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Rules that define alerting conditions across your organization.
                </p>
            </header>
            < RuleTable />
        </main>
    )

}

export default RuleListPage;