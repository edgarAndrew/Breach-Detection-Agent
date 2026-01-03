import z from "zod"

const uploadSchema = z.object({
    file: z
        .instanceof(File, { message: "File is required" })
        .refine(
            (file) =>
                [
                    "text/csv",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-excel",
                ].includes(file.type),
            "Only CSV or Excel files are allowed"
        )
})

export type UploadFormData = z.infer<typeof uploadSchema>
export default uploadSchema;