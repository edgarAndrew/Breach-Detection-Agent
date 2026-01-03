'use client'
import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import rulesSchema, { type RulesData } from "@/schema/rule/rules.schema"
import { RULE_OPERATORS } from "@/constants/rules"
import { createRule } from "@/lib/api/rule"
import { toast } from "sonner"
import { getOrgFields } from "@/lib/api/datasource"


function AddRuleForm() {
    const [importOpen, setImportOpen] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importError, setImportError] = useState<string | null>(null)
    const [importing, setImporting] = useState(false)
    const [metricOptions, setMetricOptions] = useState<string[]>([])

    useEffect(() => {
        async function fetchMetrics() {
            const response = await getOrgFields()
            const metricOptions = response.data
            setMetricOptions(metricOptions)
        }
        fetchMetrics()
    }, [])

    const form = useForm<RulesData>({
        resolver: zodResolver(rulesSchema),
        mode: "onChange",
        reValidateMode: "onChange",
        defaultValues: {
            rules: [
                {
                    field: "",
                    operator: ">",
                    threshold: 0,
                    near_thres: 0,
                },
            ],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "rules",
    })

    async function handleImportSubmit() {
        if (!importFile) {
            setImportError("Please select a file")
            return
        }

        setImportError(null)
        setImporting(true)

        const body = new FormData()
        body.append("file", importFile)

        try {
            // TODO: Call bulk import
            setImportOpen(false)
            setImportFile(null)
        } catch {
            setImportError("Upload failed")
        } finally {
            setImporting(false)
        }
    }

    async function onSubmit(data: RulesData) {
        try {
            const response = await createRule(data)
            if (response.status !== 201) {
                toast.error("Failed to create rules. Please try again.")
                return
            }
            toast.success("Rules created successfully.")
        }
        catch (error) {
            console.error("Error creating rules:", error)
            toast.error("Failed to create rules. Please try again.")
            return
        }
    }

    return (
        <section>
            <Card className="w-full max-w-4xl md:max-w-5xl">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Rules</CardTitle>
                        <CardDescription>
                            Define conditions that trigger alerts or actions.
                        </CardDescription>
                    </div>

                    <Button variant="outline" onClick={() => setImportOpen(true)}>
                        Import rules
                    </Button>
                </CardHeader>

                <CardContent className="space-y-4">
                    {!!form.formState.errors.rules && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                Please fix the errors in your rules before continuing.
                            </AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        {fields.map((rule, index) => {
                            return (
                                <div key={rule.id} className="grid gap-3 rounded-md border px-3 py-3 grid-cols-1 md:grid-cols-12 md:items-center">
                                    <span className="text-sm text-muted-foreground md:col-span-1">If</span>
                                    <div className="md:col-span-2">
                                        <Controller
                                            name={`rules.${index}.field`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Metric" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {metricOptions.map((metric, index) => (
                                                            <SelectItem key={index} value={metric}>
                                                                {metric}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Controller
                                            name={`rules.${index}.operator`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {RULE_OPERATORS.map(op => (
                                                            <SelectItem key={op.key} value={op.key}>
                                                                {op.value}
                                                            </SelectItem>
                                                        ))}

                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Controller
                                            name={`rules.${index}.threshold`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="25"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))
                                                    }
                                                />
                                            )}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground md:col-span-1">within</span>
                                    <div className="md:col-span-2">
                                        <Controller
                                            name={`rules.${index}.near_thres`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    type="number"
                                                    placeholder="5"
                                                    value={field.value ?? ""}
                                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                                />
                                            )}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground md:col-span-1">%</span>
                                    <div className="md:col-span-1 md:justify-self-end">
                                        <Button type="button" variant="ghost" onClick={() => remove(index)} className="text-red-600 hover:text-red-700 justify-self-end md:justify-self-auto">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}

                        <div className="flex justify-between pt-2">
                            <Button type="button" variant="secondary" disabled={!form.formState.isValid || !!form.formState.errors.rules}
                                onClick={() => append({ field: "", operator: ">", threshold: 1.2, near_thres: 0.5 })}>
                                Add rule
                            </Button>

                            <Button type="submit" disabled={!form.formState.isValid}>
                                Save rules
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Import rules</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input type="file" accept=".csv,.xlsx,.json" onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} />

                        {importError && (
                            <p className="text-sm text-red-500">{importError}</p>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setImportOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleImportSubmit} disabled={importing}>
                                Import
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default AddRuleForm;