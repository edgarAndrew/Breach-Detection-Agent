import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
            <div className="max-w-md text-center space-y-4">
                <h1 className="text-4xl font-semibold">
                    Page not found
                </h1>

                <p className="text-muted-foreground">
                    The page you’re looking for doesn’t exist or may
                    have been moved.
                </p>

                <Button asChild>
                    <Link href="/dashboard">
                        Go to dashboard
                    </Link>
                </Button>
            </div>
        </div>
    )
}
