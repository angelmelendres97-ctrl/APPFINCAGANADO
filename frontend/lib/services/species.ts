import api from "@/lib/api"

export interface Species {
  id: number
  name: string
}

export const speciesService = {
  list: async (): Promise<Species[]> => {
    const { data } = await api.get<Species[]>("/species")
    return data
  },
}
