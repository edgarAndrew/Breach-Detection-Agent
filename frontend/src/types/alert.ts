export type AlertStatus = "SAFE" | "NEAR_BREACH" | "BREACH"

type Alert = {
    _id: string
    event_id: string
    org_id: string
    rule_id: string
    rule_name: string
    status: AlertStatus
    field_name: string
    current_value: number
    threshold: number
    message: string
    insights: Record<string, unknown>
    created_at: Date
    email_sent: boolean
}

export default Alert;