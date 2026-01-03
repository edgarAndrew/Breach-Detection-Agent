import z from 'zod'

const signUpSchema = z.object({
    email: z.email(),
    password: z.string().trim().min(8, { error: 'Password must be atleast 8 characters' }),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type SignUpData = z.infer<typeof signUpSchema>
export default signUpSchema;