import apiClient from "@/lib/http/client"

type Payload = {
    data_src_name: string
    fields: string[]
    org_id: string
}

export function getDatasource() {
    return apiClient.get("/api/datasources")
}

export function createDatasource(payload: Payload) {
    console.log("Creating datasource with payload:", payload)
    return apiClient.post('/api/datasources', payload)
}


export function getOrgFields() {
    return apiClient.get("/api/datasources/fields")
}