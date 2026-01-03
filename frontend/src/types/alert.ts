type Alert = {
    id: string
    title: string
    metric: string
    severity: "critical" | "warning"
    triggeredAt: string
    explanation: string
}

export default Alert;