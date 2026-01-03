import { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import DataSourceForm from "@/components/forms/data-source-form/data-source-form"

export const metadata: Metadata = {
    title: 'Add Data Source',
    description: 'Configure your company data source by defining metrics and scheduling automated checks.',
}

function DataSourceOnboardingPage() {
    return (
        <main className="max-w-2xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Set up your data source</CardTitle>
                    <CardDescription>
                        One-time setup. You can update metrics and schedule
                        later from the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataSourceForm submitLabel="Complete setup" />
                </CardContent>
            </Card>
        </main>
    )
}
export default DataSourceOnboardingPage;
