'use client'
import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import signUpSchema, { SignUpData } from "@/schema/auth/signup.schema"
import { signUp } from "@/lib/api/auth"
import { useAuth } from "@/store/authStore"

function SignUpForm() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const form = useForm<SignUpData>({
        resolver: zodResolver(signUpSchema),
        mode: 'onChange',
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: SignUpData) {
        try {
            const response = await signUp({email: data.email, password: data.password})
            if (response.status !== 201) {
                toast.error("Sign up failed. Please try again.")
                return
            }
            useAuth.getState().login(response.data.access_token)
            toast.success("Account created successfully!")
            router.replace('/onboarding')
        }
        catch (error) {
            console.error("Error during sign up:", error)
            toast.error("Sign up failed. Please try again.")
            return
        }
    }

    return (
        <Card className="w-full max-w-sm mx-auto border-muted/40 shadow-xl backdrop-blur supports-backdrop-filter:bg-background/80">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-semibold tracking-tight">
                    Create an account
                </CardTitle>
                <CardDescription>
                    Enter your details to get started.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    id="sign-up-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <FieldGroup>
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
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
                                    <FieldLabel htmlFor="password">Password</FieldLabel>

                                    <div className="relative flex items-center">
                                        <Input
                                            {...field}
                                            id="password"
                                            placeholder="********"
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            className="pr-12"
                                            aria-invalid={fieldState.invalid}
                                        />

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowPassword((v) => !v)}
                                            aria-label={
                                                showPassword ? "Hide password" : "Show password"
                                            }
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
                        <Controller
                            name="confirmPassword"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor="confirmPassword">
                                        Confirm password
                                    </FieldLabel>
                                    <div className="relative flex items-center">
                                        <Input
                                            {...field}
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="********"
                                            autoComplete="new-password"
                                            className="pr-12"
                                            aria-invalid={fieldState.invalid}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setShowConfirmPassword((showPassword) => !showPassword)
                                            }
                                            aria-label={
                                                showConfirmPassword
                                                    ? "Hide password"
                                                    : "Show password"
                                            }
                                            className="absolute right-1 h-8 w-8 text-muted-foreground hover:text-foreground"
                                        >
                                            {showConfirmPassword ? (
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
                <Button type="submit" form="sign-up-form" className="w-full">
                    Create account
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/auth/signin"
                        className="font-medium text-primary hover:underline underline-offset-4"
                    >
                        Sign in
                    </Link>
                </div>
            </CardFooter>
        </Card>
    )
}
export default SignUpForm;