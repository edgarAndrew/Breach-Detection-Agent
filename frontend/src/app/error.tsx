"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="max-w-md text-center space-y-4">
                <h1 className="text-3xl font-semibold">
                    Something went wrong
                </h1>

                <p className="text-muted-foreground">
                    An unexpected error occurred. Please try again or
                    refresh the page.
                </p>

                <div className="flex justify-center gap-2">
                    <Button onClick={reset}>
                        Try again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => location.reload()}
                    >
                        Refresh
                    </Button>
                </div>
            </div>
        </div>
    )
}
