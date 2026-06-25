import api from "@/lib/api"

export interface InventoryItem {
  id: number
  name: string
  category: string
  stock_current: number
  stock_minimum: number
  unit: string
  unit_price: number | null
  expiry_date: string | null
  supplier: string | null
}

export const inventoryService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/inventory-items", { params })
    return data
  },

  create: async (item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const { data } = await api.post<InventoryItem>("/inventory-items", item)
    return data
  },

  update: async (id: number, item: Partial<InventoryItem>): Promise<InventoryItem> => {
    const { data } = await api.put<InventoryItem>(`/inventory-items/${id}`, item)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/inventory-items/${id}`)
  },
}
