import z from 'zod'

const signInSchema = z.object({
    email: z.email(),
    password: z.string().trim().min(8, { error: 'Password must be atleast 8 characters' })
})

export type SignInData = z.infer<typeof signInSchema>
export default signInSchema;