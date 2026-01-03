'use client'
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import signInSchema, { SignInData } from "@/schema/auth/signin.schema"
import { signIn } from "@/lib/api/auth"
import { toast } from "sonner"
import { useAuth } from "@/store/authStore"

function SignInForm() {
    const isAuthenticated = useAuth((state) => state.isAuthenticated)
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const form = useForm<SignInData>({
        resolver: zodResolver(signInSchema),
        mode: 'onChange',
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: SignInData) {
        try {
            const response = await signIn(data)
            if (response.status !== 200) {
                toast.error("Sign in failed. Please check your credentials and try again.")
                return
            }
            useAuth.getState().login(response.data.access_token)
            toast.success("Signed in successfully!")
            router.replace('/dashboard')
        }
        catch (error) {
            console.error("Error during sign in:", error)
            toast.error("Sign in failed. Please check your credentials and try again.")
            return
        }
    }

    if (isAuthenticated) {
        router.replace('/dashboard')
        return null
    }

    return (
        <Card className="w-full max-w-sm border-muted/40 shadow-xl backdrop-blur supports-backdrop-filter:bg-background/80">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    Welcome back
                </CardTitle>
                <CardDescription className="text-sm">
                    Sign in to continue to your account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">
                                        Email
                                    </FieldLabel>
                                    <Input
                                        {...field}
                                        id="email"
                                        type="email"
                                        placeholder="johndoe@gmail.com"
                                        autoComplete="email"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                        <Controller
                            name="password"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <div className="relative flex items-center">
                                        <Input
                                            {...field}
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="********"
                                            autoComplete="current-password"
                                            aria-invalid={fieldState.invalid}
                                            className="pr-12 focus-visible:ring-primary/50"
                                        />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowPassword((showPassword) => !showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            className="absolute right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {fieldState.invalid && (
                                        <FieldError errors={[fieldState.error]} />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    type="submit"
                    form="sign-in-form"
                    className="w-full"
                >
                    Sign in
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/auth/signup"
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        Sign up
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
export default SignInForm