import api from "@/lib/api"

export interface Event {
  id: number
  farm_id: number
  animal_id: number | null
  lot_id: number | null
  event_type_id: number
  title: string
  description: string | null
  event_date: string
  priority: string
  status: string
  event_type?: { id: number; name: string }
}

export const eventService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/events", { params })
    return data
  },

  create: async (event: Partial<Event>): Promise<Event> => {
    const { data } = await api.post<Event>("/events", event)
    return data
  },

  update: async (id: number, event: Partial<Event>): Promise<Event> => {
    const { data } = await api.put<Event>(`/events/${id}`, event)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`)
  },
}

export interface EventType {
  id: number
  name: string
}

export const eventTypeService = {
  list: async (): Promise<EventType[]> => {
    const { data } = await api.get<EventType[]>("/event-types")
    return data
  },
}
