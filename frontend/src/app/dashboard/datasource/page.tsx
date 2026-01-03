// 'use client'
import DataSourceForm from "@/components/forms/data-source-form/data-source-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


export default function EditDatasourcePage() {
    return (
        <div className="max-w-2xl mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle>Data source settings</CardTitle>
                    <CardDescription>
                        Update schedule, metrics, or cron configuration.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataSourceForm
                        submitLabel="Save changes"
                    // defaultValues={{
                    //     // fetch existing datasource here
                    // }}
                    // onSubmit={(data) => {
                    //     console.log("UPDATE", data)
                    // }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
