import api from "@/lib/api"

export interface AnimalCategory {
  id: number
  name: string
  species_id: number
}

export const categoryService = {
  list: async (): Promise<AnimalCategory[]> => {
    const { data } = await api.get<AnimalCategory[]>("/animal-categories")
    return data
  },
}
