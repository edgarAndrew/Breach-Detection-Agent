import apiClient from "../http/client";

export function addOrg(payload: { org_name: string }) {
    return apiClient.post("/api/organizations", payload)
}

export function getOrgDetailsByUserId() {
    return apiClient.get("/api/memberships/get-org-details")
}