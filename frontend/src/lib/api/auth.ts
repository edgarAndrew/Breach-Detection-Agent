import apiClient from "@/lib/http/client"

export type AuthPayload = {
    email: string
    password: string
}

export function signIn(payload: AuthPayload) {
    return apiClient.post("/api/users/login", payload)
}

export function signUp(payload: AuthPayload) {
    return apiClient.post("/api/users/register", payload)
}
