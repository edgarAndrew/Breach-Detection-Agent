import apiClient from "../http/client"
import { RulesData } from "@/schema/rule/rules.schema"

export function getOrgRules() {
    return apiClient.get("/api/rules")
}

export function createRule(payload: RulesData) {
    return apiClient.post("/api/rules", payload)
}

export function deleteRule(id: string) {
    return apiClient.delete(`/api/rules/${id}`)
}

export function getRuleById(id: string) {
    return apiClient.get(`/api/rules/${id}`)
}