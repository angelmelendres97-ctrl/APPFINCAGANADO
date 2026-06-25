import api from "@/lib/api"

export interface FarmSettings {
  id: number
  name: string
  business_name?: string
  owner_name?: string
  tax_id?: string
  phone?: string
  email?: string
  country?: string
  province?: string
  city?: string
  address?: string
}

export const settingsService = {
  get: async (): Promise<FarmSettings> => {
    const { data } = await api.get<FarmSettings>("/settings")
    return data
  },

  update: async (settings: Partial<FarmSettings>): Promise<FarmSettings> => {
    const { data } = await api.put<FarmSettings>("/settings", settings)
    return data
  },
}
