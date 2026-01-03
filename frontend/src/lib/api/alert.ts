import apiClient from "../http/client"

export const getAlerts = async () => {
    return apiClient.get("/api/alerts")
    // return apiClient.get("/api/alerts/org")
}