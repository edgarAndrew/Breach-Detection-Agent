import type { Metadata } from "next"
import SignUpForm from "@/components/forms/auth/sign-up-form";

export const metadata: Metadata = {
    title: "Create an account",
    description: "Create an account to start tracking metrics, configuring rules, and receiving alerts.",
}


function SignUpPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/40 to-muted">
            <SignUpForm />
        </main>
    )
}
export default SignUpPage;