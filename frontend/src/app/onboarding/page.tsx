import type { Metadata } from "next"
import Link from "next/link"
import { Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
    title: "Set Up Data Source | ORIX-McLaren",
    description: "Complete the one-time setup to connect your data source. You can manage rules and upload historical data from the dashboard after setup.",
};

function OnboardingPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <section className="w-full max-w-xl space-y-8">
                <section className="text-center space-y-3">
                    <h1 className="text-3xl font-semibold">
                        Set up your data source
                    </h1>

                    <p className="text-muted-foreground">
                        This is a one-time setup. After this, you&apos;ll create
                        rules and upload historical data from the dashboard.
                    </p>
                </section>

                <Card className="border-primary shadow-md">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            <CardTitle>Configure data source</CardTitle>
                        </div>
                        <CardDescription>
                            Enter your company details, update schedule, and
                            metrics to start tracking data.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <Button asChild className="w-full">
                            <Link href="/datasource/add">
                                Continue setup
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-muted-foreground">
                    You can manage rules and upload historical data anytime
                    from the dashboard after setup.
                </p>
            </section>
        </main>
    )
}

export default OnboardingPage;