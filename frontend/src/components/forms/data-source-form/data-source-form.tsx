"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import onboardingSchema, { OnBoardingData } from "@/schema/auth/onboarding.schema"
import { INLINE_EDIT_LIMIT } from "@/constants/datasource"
import { createDatasource } from "@/lib/api/datasource"
import { addOrg } from "@/lib/api/org"
import { useOrg } from "@/store/orgStore"
import { useAuth } from "@/store/authStore"

function DataSourceForm({ submitLabel }: { submitLabel: string }) {
    const router = useRouter()
    const isAuthenticated = useAuth((state) => state.isAuthenticated)
    const [step, setStep] = useState<1 | 2>(1)
    const form = useForm<OnBoardingData>({
        resolver: zodResolver(onboardingSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        criteriaMode: "all",
        defaultValues: {
            data_src_name: "",
            fields: [],
        },
    })

    const { fields, append, remove, replace } = useFieldArray({
        control: form.control,
        name: "fields",
    })

    const watchedMetrics = useWatch({
        control: form.control,
        name: "fields",
    })

    const metricValues = useMemo(() => (watchedMetrics ?? []).map((m) => m.key.trim().toLowerCase()), [watchedMetrics])

    async function onSubmit(data: OnBoardingData) {
        const payload = {
            data_src_name: data.data_src_name.trim(),
            fields: data.fields.map((f) => f.key.trim()),
            org_id: useOrg.getState().org_id!,
        }
        try {
            console.log(payload)
            const response = await createDatasource(payload)
            if (response.status !== 201) {
                toast.error("Failed to create datasource. Please try again.")
                return
            }
            router.replace('/dashboard/rules/new')
        }
        catch (error) {
            console.error("Error creating datasource:", error)
            toast.error("Failed to create datasource. Please try again.")
            return
        }
    }

    function next() {
        form.trigger(["data_src_name"]).then(async (ok) => {
            if (ok) {
                const response = await addOrg({ org_name: form.getValues("data_src_name") })
                if (response.status !== 201) {
                    toast.error("Failed to create organization. Please try again.")
                    return
                }
                else {
                    useOrg.getState().setOrg(response.data._id)
                    toast.success("Organization created successfully!")
                }
                setStep(2)
            }
        })
    }

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/auth/signin')
        }
    }, [isAuthenticated, router])

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" >
            <p className="text-sm text-muted-foreground">
                Step {step} of 2
            </p>

            {/* Step 1 - Getting the company data */}
            {step === 1 && (
                <>
                    <FieldGroup>
                        <Controller
                            name="data_src_name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel>Company name</FieldLabel>
                                    <Input {...field} />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
                                        />
                                    )}
                                </Field>
                            )}
                        />
                    </FieldGroup>
                </>
            )}

            {/* Step 2: Getting the metrics of the company for which the rule is to be applied */}
            {step === 2 && (
                <FieldGroup>
                    <FieldLabel>Metrics</FieldLabel>
                    {fields.length > 0 && (
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => replace([])}
                            className="text-xs text-black hover:text-white hover:bg-destructive mt-2"
                        >
                            Clear all metrics
                        </Button>
                    )}

                    {fields.length > INLINE_EDIT_LIMIT ? (
                        <div className="mt-3 rounded-md border bg-muted/40 p-4">
                            <p className="font-medium">
                                {fields.length} metrics configured
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                You can review, disable, or remove metrics later
                                from Dashboard → Data source → Metrics.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-3 space-y-2">
                            {fields.map((item, index) => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <Controller
                                        name={`fields.${index}.key`}
                                        control={form.control}
                                        rules={{
                                            validate: (v) => {
                                                const lc = v.toLowerCase()
                                                return (metricValues.filter((m) => m === lc).length === 1 || "Duplicate metric")
                                            },
                                        }}
                                        render={({ field }) => (
                                            <Input
                                                {...field}
                                                placeholder="Metric name"
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault()
                                                        if (field.value?.trim()) {
                                                            append({ key: "", })
                                                        }
                                                    }
                                                }}
                                            />
                                        )}
                                    />
                                    <Button type="button" variant="outline" onClick={() => remove(index)} className="hover:text-white hover:bg-destructive text-red" aria-label="Remove metric" >x</Button>
                                </div>
                            ))}

                            <Button type="button" size="sm" variant="secondary" onClick={() => append({ key: "" })}> Add metric</Button>
                        </div>
                    )}
                </FieldGroup>
            )}

            <div className="flex justify-between pt-4">
                {step === 2 && (
                    <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={true}>
                        Back
                    </Button>
                )}

                {step === 1 ? (<Button type="button" disabled={!!form.formState.errors.data_src_name} onClick={next}> Next </Button>) : (<Button type="submit" disabled={!form.formState.isValid}> {submitLabel} </Button>)}
            </div>
        </form>
    )
}

export default DataSourceForm;