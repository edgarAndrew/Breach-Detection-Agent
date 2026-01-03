"use client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Point from "@/types/point"
import { toSentenceCase } from "@/lib/utils"

interface RuleGraphProps {
    data: Point[]
    threshold: number
    health: string;
}

function formatTime(ts: number) {
    return new Date(ts * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })
}

function getStatus(value: number, threshold: number) {
    const diff = value - threshold
    if (diff > 10) return { label: "Critical", color: "hsl(0, 84%, 60%)" }
    if (diff > 0) return { label: "Warning", color: "hsl(38, 92%, 50%)" }
    return { label: "Normal", color: "hsl(142, 72%, 44%)" }
}


function RuleGraph({ data, threshold, health }: RuleGraphProps) {
    if (!data || data.length === 0) return null

    const chartData = data.map((point, index) => ({
        ...point,
        distanceFromThreshold: point.value - threshold,
        index: index
    }))

    const lastValue = data[data.length - 1].value
    const firstValue = data[0].value
    const status = getStatus(lastValue, threshold)
    const trend = lastValue > firstValue ? "↑ Increasing" : lastValue < firstValue ? "↓ Decreasing" : "→ Stable"

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Health</p>
                        <p className="text-lg font-semibold wrap-break-word"> {toSentenceCase(health)} </p>
                    </CardContent>

                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-lg font-semibold" style={{ color: status.color }}>
                            {status.label}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Trend</p>
                        <p className="text-lg font-semibold">{trend}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Distance</p>
                        <p className="text-lg font-semibold">{(lastValue - threshold).toFixed(1)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground">Data Points</p>
                        <p className="text-lg font-semibold">{data.length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Values Chart */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                        Metric Values ({data.length} points)
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="index"
                                label={{ value: "Data Point #", position: "insideBottom", offset: -10 }}
                            />
                            <YAxis
                                label={{ value: "Value", angle: -90, position: "insideLeft" }}
                            />
                            <Tooltip
                                // formatter={(value) => value.toFixed(2)}
                                labelFormatter={(index) => `Point ${index}, Time: ${formatTime(chartData[index]?.timestamp)}`}
                            />

                            <ReferenceLine
                                y={threshold}
                                stroke="hsl(0, 84%, 60%)"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                label={{
                                    value: `Threshold: ${threshold}`,
                                    position: "right",
                                    fill: "hsl(0, 84%, 60%)",
                                    fontSize: 11,
                                }}
                            />

                            <Line
                                type="linear"
                                dataKey="value"
                                stroke="hsl(210, 100%, 50%)"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "hsl(210, 100%, 50%)" }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-muted-foreground">
                        Distance from Threshold
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="index"
                                label={{ value: "Data Point #", position: "insideBottom", offset: -10 }}
                            />
                            <YAxis
                                label={{ value: "Distance", angle: -90, position: "insideLeft" }}
                            />
                            <Tooltip
                                // formatter={(value) => value.toFixed(2)}
                                labelFormatter={(index) => `Point ${index}`}
                            />
                            <ReferenceLine
                                y={0}
                                stroke="hsl(0, 84%, 60%)"
                                strokeDasharray="5 5"
                                strokeWidth={2}
                                label={{
                                    value: "At Threshold",
                                    position: "right",
                                    fill: "hsl(0, 84%, 60%)",
                                    fontSize: 11,
                                }}
                            />
                            <Line
                                type="linear"
                                dataKey="distanceFromThreshold"
                                stroke="hsl(142, 72%, 44%)"
                                strokeWidth={2}
                                dot={{ r: 3, fill: "hsl(142, 72%, 44%)" }}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}

export default RuleGraph