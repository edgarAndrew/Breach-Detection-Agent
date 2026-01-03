import type { Metadata } from "next"
import HistoricalDataUploadForm from "@/components/forms/historical-data/historical-upload-form"

export const metadata: Metadata = {
    title: "Upload historical data | ORIX-McLaren",
    description: "Upload historical CSV or Excel data to backfill metrics and power insights in ORIX-McLaren.",
}

function HistoricalDataUploadPage() {
    return (
        <main>
            <section className="mx-auto max-w-4xl px-6 py-10">
                <section className="space-y-2">
                    <h1 className="text-3xl font-semibold">
                        Upload historical data
                    </h1>
                    <p className="text-muted-foreground max-w-2xl">
                        Upload a CSV or Excel file to backfill historical data.
                        Processing happens asynchronously on the server.
                    </p>
                </section>
                <HistoricalDataUploadForm />
            </section>
        </main>
    )
}
export default HistoricalDataUploadPage;