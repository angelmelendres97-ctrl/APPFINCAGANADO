import api from "@/lib/api"

export interface ReproductiveRecord {
  id: number
  animal_id: number
  reproductive_type_id: number
  event_date: string
  related_male_animal_id: number | null
  semen_code?: string | null
  technician_name?: string | null
  expected_delivery_date?: string | null
  result: string | null
  offspring_count: number | null
  observations: string | null
  animal?: { id: number; internal_code: string; name: string }
  related_male?: { id: number; internal_code: string; name: string }
  reproductive_type?: { id: number; name: string }
}

export const reproductiveRecordService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/reproductive-records", { params })
    return data
  },

  create: async (record: Partial<ReproductiveRecord>): Promise<ReproductiveRecord> => {
    const { data } = await api.post<ReproductiveRecord>("/reproductive-records", record)
    return data
  },

  update: async (id: number, record: Partial<ReproductiveRecord>): Promise<ReproductiveRecord> => {
    const { data } = await api.put<ReproductiveRecord>(`/reproductive-records/${id}`, record)
    return data
  },

  transition: async (id: number, payload: { result: string; observations?: string; offspring_count?: number }): Promise<ReproductiveRecord> => {
    const { data } = await api.post<ReproductiveRecord>(`/reproductive-records/${id}/transition`, payload)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/reproductive-records/${id}`)
  },
}

export interface ReproductiveType {
  id: number
  name: string
}

export const reproductiveTypeService = {
  list: async (): Promise<ReproductiveType[]> => {
    const { data } = await api.get<ReproductiveType[]>("/reproductive-types")
    return data
  },
}
