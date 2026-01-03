import apiClient from "../http/client";

export function addOrg(payload: { org_name: string }) {
    return apiClient.post("/api/organizations", payload)
}