import cronstrue from "cronstrue"

function CronPreview({ cron }: { cron: string }) {
    // try {
    return (
        <p className="text-xs text-muted-foreground">
            Runs: {cronstrue.toString(cron)}
        </p>
    )
    // } catch {
    return null
    // }
}

export default CronPreview;
