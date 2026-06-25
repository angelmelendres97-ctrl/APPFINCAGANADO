import api from "@/lib/api"

export interface Alert {
  id: number
  farm_id: number
  animal_id: number | null
  alert_type_id: number
  title: string
  message: string
  alert_date: string
  priority: string
  status: string
  is_read: boolean
  alert_type?: { id: number; name: string }
}

export const alertService = {
  list: async (params?: Record<string, string>) => {
    const { data } = await api.get("/alerts", { params })
    return data
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/alerts/${id}/mark-as-read`)
  },

  acknowledge: async (id: number): Promise<void> => {
    await api.patch(`/alerts/${id}/acknowledge`)
  },

  resolve: async (id: number): Promise<void> => {
    await api.patch(`/alerts/${id}/resolve`)
  },
}
