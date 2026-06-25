import api from "@/lib/api"

export interface Lot {
  id: number
  farm_id: number
  code: string
  name: string
  type: string
  area_size: number | null
  area_unit: string | null
  capacity: number
  current_animals_count: number
  status: string
  animals?: { id: number; internal_code: string; name: string }[]
}

export const lotService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/lots", { params })
    return data
  },

  get: async (id: number): Promise<Lot> => {
    const { data } = await api.get<Lot>(`/lots/${id}`)
    return data
  },

  create: async (lot: Partial<Lot>): Promise<Lot> => {
    const { data } = await api.post<Lot>("/lots", lot)
    return data
  },

  update: async (id: number, lot: Partial<Lot>): Promise<Lot> => {
    const { data } = await api.put<Lot>(`/lots/${id}`, lot)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/lots/${id}`)
  },
}
