import apiClient from "../http/client";

export function getOrgRulesTrend(ruleId: string, orgId: string) {
    return apiClient.get(`/api/trends/org/${orgId}/rule/${ruleId}`)
}