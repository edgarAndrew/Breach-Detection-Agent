import axios from "axios"
const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DATA_ORCHESTRATOR_SERVER_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

apiClient.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

const apiClientFile = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DATA_ORCHESTRATOR_SERVER_URL,
    headers: {
        "Content-Type": "multipart/form-data",
    },
});

apiClientFile.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default apiClient
export { apiClientFile };