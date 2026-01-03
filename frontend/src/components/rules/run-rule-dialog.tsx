"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Play } from "lucide-react"
import { toast } from "sonner"

type Unit = "minutes" | "hours" | "days"

export default function RunRuleDialog({
    onRun,
}: {
    onRun: (payload: {
        start_ts: number
        end_ts: number
    }) => Promise<boolean>
}) {
    const [open, setOpen] = useState(false)
    const [startValue, setStartValue] = useState(1)
    const [startUnit, setStartUnit] = useState<Unit>("hours")
    const [endValue, setEndValue] = useState(0)
    const [endUnit, setEndUnit] = useState<Unit>("minutes")

    function toSeconds(value: number, unit: Unit) {
        if (unit === "minutes") return value * 60
        if (unit === "hours") return value * 3600
        return value * 86400
    }

    async function handleRun() {
        const startDelta = toSeconds(startValue, startUnit)
        const endDelta = toSeconds(endValue, endUnit)

        if (startDelta <= endDelta) {
            toast.error("Start time must be earlier than end time")
            return
        }

        const now = Date.now() / 1000 

        const start_ts = now - startDelta
        const end_ts = now - endDelta

        const success = await onRun({ start_ts, end_ts })
        if (success){
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Play className="h-4 w-4" />
                    Run rule
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Run rule for time range</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Start */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start (ago)</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={0}
                                value={startValue}
                                onChange={(e) =>
                                    setStartValue(Number(e.target.value))
                                }
                            />
                            <Select
                                value={startUnit}
                                onValueChange={(v) =>
                                    setStartUnit(v as Unit)
                                }
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">
                                        Minutes
                                    </SelectItem>
                                    <SelectItem value="hours">
                                        Hours
                                    </SelectItem>
                                    <SelectItem value="days">
                                        Days
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* End */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">End (ago)</label>
                        <div className="flex gap-2">
                            <Input
                                type="number"
                                min={0}
                                value={endValue}
                                onChange={(e) =>
                                    setEndValue(Number(e.target.value))
                                }
                            />
                            <Select
                                value={endUnit}
                                onValueChange={(v) =>
                                    setEndUnit(v as Unit)
                                }
                            >
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="minutes">
                                        Minutes
                                    </SelectItem>
                                    <SelectItem value="hours">
                                        Hours
                                    </SelectItem>
                                    <SelectItem value="days">
                                        Days
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button className="gap-2" onClick={handleRun}>
                        <Play className="h-4 w-4" />
                        Run rule
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
