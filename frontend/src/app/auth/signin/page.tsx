import type { Metadata } from "next"
import SignInForm from "@/components/forms/auth/sign-in-form";

export const metadata: Metadata = {
    title: "Sign in | ORIX-McLaren",
    description: "Sign in to your Orix account to access your dashboard, data sources, rules, and alerts."
}


function SignInPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/40 to-muted">
            <SignInForm />
        </main>
    )
}
export default SignInPage;