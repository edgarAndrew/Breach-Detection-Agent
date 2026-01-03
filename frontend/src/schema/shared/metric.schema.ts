import z from "zod";

const fieldSchema = z.object({
    key: z.string().min(1, "Field name is required"),
})

export type FieldData = z.infer<typeof fieldSchema>;
export default fieldSchema;