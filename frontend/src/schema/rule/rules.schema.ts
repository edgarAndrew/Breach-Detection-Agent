import { z } from "zod"

const ruleSchema = z.object({
    field: z.string().min(1),
    operator: z.enum([">", "<", ">=", "<=", "="], "Operator is required"),
    threshold: z.number(),
    near_thres: z.number().min(0, "Near threshold percentage must be between 0 and 100").max(100, "Near threshold percentage must be between 0 and 100"),
})

const rulesSchema = z.object({
    rules: z.array(ruleSchema).min(1),
})

export type RulesData = z.infer<typeof rulesSchema>
export default rulesSchema;