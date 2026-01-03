import { RULE_OPERATORS } from "@/constants/rules"
import Rule from "@/types/rule"

export function getOperatorText(operator: string): string {
    const match = RULE_OPERATORS.find((op) => op.key === operator)
    return match?.value ?? operator
}

export function formatRule(rule: Rule): string {
    return `If ${rule.field} ${getOperatorText(rule.operator)} ${rule.threshold} within ${rule.near_thres}%`
}