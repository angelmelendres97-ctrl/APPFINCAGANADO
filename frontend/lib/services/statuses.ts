import api from "@/lib/api"

export interface AnimalStatus {
  id: number
  name: string
}

export const statusService = {
  list: async (): Promise<AnimalStatus[]> => {
    const { data } = await api.get<AnimalStatus[]>("/animal-statuses")
    return data
  },
}
