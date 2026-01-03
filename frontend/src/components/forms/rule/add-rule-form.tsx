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
import { convertRulePDFtoJSON } from "@/lib/api/rule"

function AddRuleForm() {
    const [importOpen, setImportOpen] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importError, setImportError] = useState<string | null>(null)
    const [importing, setImporting] = useState(false)
    const [metricOptions, setMetricOptions] = useState<string[]>([])
    const [importType, setImportType] = useState<'json' | 'pdf' | null>(null)

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
                    rule_name: "",
                    attribute_name: "",
                    operator: "gt",
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

    const response_to_ui_fields = (
        rulesArray: Array<{
            attribute_name: string;
            threshold: number;
            near_thres: number;
            operator: string; // e.g., "gt", "lt", etc.
        }>
        ) => {
            console.log("Received data for UI conversion:", rulesArray);

            // Map API fields to form field names
            const mappedRules = rulesArray.map(rule => ({
                attribute_name: rule.attribute_name,
                operator: rule.operator,
                threshold: rule.threshold,
                near_thres: rule.near_thres,
            }));

            console.log("Got the output from the  reposne to ui fileds ", mappedRules)
            fields.forEach((_, index) => remove(index));
            console.log("Updated the fields")
            // @ts-ignore
            mappedRules.forEach(rule => append(rule));

            return mappedRules;
        };
   

    async function handleImportSubmit() {
        // if (!importFile) {
        //     setImportError("Please select a file")
        //     return
        // }

        setImportError(null)
        setImporting(true)

        try {
            if (importType === 'json') {
                const reader = new FileReader()
                reader.onload = (e) => {
                    try {
                        const jsonContent = JSON.parse(e.target?.result as string)
                        response_to_ui_fields(jsonContent)
                        setImportOpen(false)
                        setImportFile(null)
                    } catch (err) {
                        setImportError("Invalid JSON file")
                    } finally {
                        setImporting(false)
                    }
                }
                // @ts-ignore
                reader.readAsText(importFile)
            } else if (importType === 'pdf') {
                
                const formData = new FormData()
                // @ts-ignore
                formData.append("file", importFile)
                const response = await convertRulePDFtoJSON(formData);
                
                const rulesArray = response.data.rules;
                response_to_ui_fields(rulesArray);
                
                console.log("Added the new rules")
                setImportOpen(false)
                setImportFile(null)
            }
        } catch (err) {
            console.error(err)
            setImportError("Upload failed")
        } finally {
            setImporting(false)
        }
    }

    async function onSubmit(data: RulesData) {
        try {
            console.log("Final data")
            console.log(data)
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

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                            setImportType('json')
                            setImportOpen(true)
                        }}>
                            Import from Config
                        </Button>
                        <Button variant="outline" onClick={() => {
                            setImportType('pdf')
                            setImportOpen(true)
                        }}>
                            Import from PDF
                        </Button>
                    </div>
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
                                            name={`rules.${index}.rule_name`}
                                            control={form.control}
                                            render={({ field }) => (
                                                <Input
                                                    {...field}
                                                    id={`rule-name-${index}`}
                                                    placeholder="Rule Name"
                                                    required
                                                />
                                            )}
                                        />
                                        </div>
                                    <div className="md:col-span-2">
                                        <Controller
                                            name={`rules.${index}.attribute_name`}
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
                                onClick={() => append({rule_name:"", attribute_name: "", operator: "gt", threshold: 1.2, near_thres: 0.5 })}>
                                Add rule
                            </Button>

                            <Button type="submit" disabled={!form.formState.isValid}>
                                Save rules
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Dialog open={importOpen} onOpenChange={(open) => {
                if (!open) {
                    setImportFile(null)
                    setImportError(null)
                    setImportType(null)
                }
                setImportOpen(open)
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {importType === 'pdf' ? 'Import from PDF' : 'Import from Config'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                        <Input 
                            type="file" 
                            accept={importType === 'pdf' ? ".pdf" : ".json"} 
                            onChange={(e) => setImportFile(e.target.files?.[0] ?? null)} 
                        />

                        {importError && (
                            <p className="text-sm text-red-500">{importError}</p>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setImportOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleImportSubmit} disabled={importing}>
                                {importing ? 'Processing...' : 'Import'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default AddRuleForm;