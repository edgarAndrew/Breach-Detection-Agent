import apiClient from "@/lib/http/client"

export type Metric = {
    id: string
    key: string
}

export function listMetrics(params: {
    page: number
    search?: string
}) {
    return apiClient.get("/metrics", { params })
}

export function createMetric(key: string) {
    return apiClient.post("/metrics", { key })
}

export function deleteMetric(id: string) {
    return apiClient.delete(`/metrics/${id}`)
}
