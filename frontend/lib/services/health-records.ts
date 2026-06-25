import api from "@/lib/api"

export interface HealthRecord {
  id: number
  animal_id: number
  health_type_id: number
  record_date: string
  diagnosis: string | null
  treatment: string | null
  medication: string | null
  dosage: string | null
  veterinarian: string | null
  next_appointment: string | null
  observations: string | null
  animal?: { id: number; internal_code: string; name: string }
  health_type?: { id: number; name: string }
}

export const healthRecordService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/health-records", { params })
    return data
  },

  create: async (record: Partial<HealthRecord>): Promise<HealthRecord> => {
    const { data } = await api.post<HealthRecord>("/health-records", record)
    return data
  },

  update: async (id: number, record: Partial<HealthRecord>): Promise<HealthRecord> => {
    const { data } = await api.put<HealthRecord>(`/health-records/${id}`, record)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/health-records/${id}`)
  },
}

export interface HealthType {
  id: number
  name: string
  description: string
}

export const healthTypeService = {
  list: async (): Promise<HealthType[]> => {
    const { data } = await api.get<HealthType[]>("/health-types")
    return data
  },
}
