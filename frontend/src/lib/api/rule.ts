import apiClient, {apiClientFile} from "../http/client"
import { RulesData } from "@/schema/rule/rules.schema"

export function getOrgRules() {
    // return apiClient.get("/api/rules/org")
    return apiClient.get("/api/rules")
}

export function createRule(payload: RulesData) {
    return apiClient.post("/api/rules", payload['rules'])
}

export function deleteRule(id: string) {
    return apiClient.delete(`/api/rules/${id}`)
}

export function getRuleById(id: string) {
    return apiClient.get(`/api/rules/${id}`)
}

export function convertRulePDFtoJSON(payload: FormData) {
    console.log("Sending FormData:", payload);
    console.log("File in FormData:", payload.get("file"));
    return apiClientFile.post(`/api/rules/pdf-to-json`, payload);
}

export function runRuleOnDemand(rule_id: string, start_ts: number, end_ts: number){
    return apiClient.get(`/api/rules/events?rule_id=${rule_id}&start_ts=${start_ts}&end_ts=${end_ts}`)
}