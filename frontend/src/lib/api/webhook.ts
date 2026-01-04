import apiClient from "../http/client"
// import { RulesData } from "@/schema/rule/rules.schema"

export function getOrgWebhook() {
    return apiClient.get("/api/webhooks")
}

export function createOrgWebhook() {
    return apiClient.post("/api/webhooks")
}

export function regenerateWebhookApiKey() {
    return apiClient.post("/api/webhooks/regenerate-key")
}