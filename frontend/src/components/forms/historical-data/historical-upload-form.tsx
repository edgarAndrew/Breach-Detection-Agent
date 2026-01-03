'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import CustomButton from '@/components/shared/custom-button'
import uploadSchema, { UploadFormData } from '@/schema/shared/upload.schema'

function HistoricalDataUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { handleSubmit, setValue, reset, formState: { errors } } = useForm<UploadFormData>({ resolver: zodResolver(uploadSchema), defaultValues: { file: undefined } })

  async function onSubmit(data: UploadFormData) {
    setLoading(true)
    setSubmitError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("file", data.file)

      // TODO: Call the historical data upload api

      reset()
    } catch {
      setSubmitError("Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <Input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setValue("file", file as File, {
              shouldValidate: true,
            })
          }}
        />
        {errors.file && (
          <p className="text-sm text-destructive">
            {errors.file.message}
          </p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-destructive">
          {submitError}
        </p>
      )}

      {success && (
        <p className="text-sm text-emerald-600">
          File uploaded successfully. Data will be processed
          shortly.
        </p>
      )}

      <CustomButton
        type="upload"
        label={loading ? "Uploading…" : "Upload file"}
        icon={Upload}
        htmlType="submit"
        disabled={loading}
      />
    </form>
  )
}

export default HistoricalDataUploadForm