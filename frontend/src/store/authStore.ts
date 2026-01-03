import AuthState from '@/types/store/auth'
import { create } from 'zustand'

const useAuth = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    token: null,
    login: (token) => {
        set({ isAuthenticated: true, token })
        localStorage.setItem('token', token)
    },
    logout: () => {
        set({ isAuthenticated: false, token: null })
        localStorage.removeItem('token')
    },
}))

export { useAuth }