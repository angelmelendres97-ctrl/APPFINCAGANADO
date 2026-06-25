import api from "@/lib/api"

export interface Animal {
  id: number
  farm_id: number
  lot_id: number | null
  breed_id: number | null
  category_id: number | null
  status_id: number | null
  internal_code: string
  ear_tag: string | null
  name: string | null
  sex: "male" | "female"
  birth_date: string | null
  weight_current: number | null
  color: string | null
  photo_path: string | null
  mother_id: number | null
  father_id: number | null
  active: boolean
  created_by: number | null
  lot?: { id: number; name: string; code: string }
  breed?: { id: number; name: string }
  category?: { id: number; name: string }
  status?: { id: number; name: string }
  mother?: { id: number; internal_code: string; name: string }
  father?: { id: number; internal_code: string; name: string }
  photos?: { id: number; file_path: string; description: string | null }[]
}

export const animalService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/animals", { params })
    return data
  },

  get: async (id: number): Promise<Animal> => {
    const { data } = await api.get<Animal>(`/animals/${id}`)
    return data
  },

  create: async (animal: Partial<Animal>): Promise<Animal> => {
    const { data } = await api.post<Animal>("/animals", animal)
    return data
  },

  update: async (id: number, animal: Partial<Animal>): Promise<Animal> => {
    const { data } = await api.put<Animal>(`/animals/${id}`, animal)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/animals/${id}`)
  },
}
