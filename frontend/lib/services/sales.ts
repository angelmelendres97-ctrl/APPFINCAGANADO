import api from "@/lib/api"

export interface Sale {
  id: number
  client_name: string
  sale_type: "animal" | "product"
  description: string
  quantity: number
  unit_price: number
  total_price: number
  payment_status: "pending" | "paid" | "partial"
  sale_date: string
  animal_id?: number | null
}

export const saleService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/sales", { params })
    return data
  },

  create: async (sale: Partial<Sale>): Promise<Sale> => {
    const { data } = await api.post<Sale>("/sales", sale)
    return data
  },

  update: async (id: number, sale: Partial<Sale>): Promise<Sale> => {
    const { data } = await api.put<Sale>(`/sales/${id}`, sale)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/sales/${id}`)
  },
}
