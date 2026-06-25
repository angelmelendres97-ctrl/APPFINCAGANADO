import api from "@/lib/api"

export interface User {
  id: number
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  role?: { id: number; name: string }
  status: string
  avatar_path?: string
}

export interface LoginResponse {
  user: User
  token: string
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/login", { email, password })
    return data
  },

  register: async (userData: {
    first_name: string
    last_name: string
    email: string
    password: string
    password_confirmation: string
  }): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>("/auth/register", userData)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout")
  },

  me: async (): Promise<User> => {
    const { data } = await api.get<User>("/auth/me")
    return data
  },
}
