import { z } from "zod"
import fieldSchema from "../shared/metric.schema"

const onboardingSchema = z.object({
    data_src_name: z.string().min(1, "Company name is required"),
    fields: z.array(fieldSchema).min(1, "Add at least one field"),
})
export type OnBoardingData = z.infer<typeof onboardingSchema>
export default onboardingSchema