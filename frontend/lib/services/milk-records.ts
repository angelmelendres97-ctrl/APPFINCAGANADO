import api from "@/lib/api"

export interface MilkRecord {
  id: number
  animal_id: number
  record_date: string
  quantity_liters: number
  milking_session: string
  temperature?: number
  mastitis_check?: boolean
  observation?: string
  animal?: { id: number; internal_code: string; name: string; status?: { id: number; name: string } }
}

export interface MilkStatistics {
  date: string
  total_liters: number
  animals_milking: number
  average: number
}

export const milkRecordService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/milk-records", { params })
    return data
  },

  create: async (record: Partial<MilkRecord>): Promise<MilkRecord> => {
    const { data } = await api.post<MilkRecord>("/milk-records", record)
    return data
  },

  update: async (id: number, record: Partial<MilkRecord>): Promise<MilkRecord> => {
    const { data } = await api.put<MilkRecord>(`/milk-records/${id}`, record)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/milk-records/${id}`)
  },

  statistics: async (params?: Record<string, string>): Promise<MilkStatistics> => {
    const { data } = await api.get<MilkStatistics>("/milk-records/statistics", { params })
    return data
  },
}
