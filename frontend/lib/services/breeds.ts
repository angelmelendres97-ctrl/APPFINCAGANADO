import api from "@/lib/api"

export interface Breed {
  id: number
  name: string
  species_id: number
  species?: { id: number; name: string }
}

export const breedService = {
  list: async (): Promise<Breed[]> => {
    const { data } = await api.get<Breed[]>("/breeds")
    return data
  },
}
