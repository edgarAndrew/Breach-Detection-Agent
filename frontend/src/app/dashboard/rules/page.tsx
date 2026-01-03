'use client'
import RuleTable from "@/components/rules/rule-table"
import { useRouter } from "next/navigation"
import { useAuth } from "@/store/authStore"
import { useEffect } from "react"

function RuleListPage() {
    const isAuthenticated = useAuth((state) => state.isAuthenticated)
    const router = useRouter()

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/auth/signup")
        }
    }, [isAuthenticated, router])

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