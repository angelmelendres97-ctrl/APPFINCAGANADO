import api from "@/lib/api"

export interface Expense {
  id: number
  category: string
  description: string
  amount: number
  responsible: string | null
  observations: string | null
  expense_date: string
}

export const expenseService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/expenses", { params })
    return data
  },

  create: async (expense: Partial<Expense>): Promise<Expense> => {
    const { data } = await api.post<Expense>("/expenses", expense)
    return data
  },

  update: async (id: number, expense: Partial<Expense>): Promise<Expense> => {
    const { data } = await api.put<Expense>(`/expenses/${id}`, expense)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/expenses/${id}`)
  },
}
