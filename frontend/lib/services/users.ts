import api from "@/lib/api"

export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  status: string
  role?: { id: number; name: string }
}

export const userService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/users", { params })
    return data
  },

  get: async (id: number): Promise<User> => {
    const { data } = await api.get<User>(`/users/${id}`)
    return data
  },

  create: async (user: Partial<User> & { password?: string }): Promise<User> => {
    const { data } = await api.post<User>("/users", user)
    return data
  },

  update: async (id: number, user: Partial<User>): Promise<User> => {
    const { data } = await api.put<User>(`/users/${id}`, user)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`)
  },
}
