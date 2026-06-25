import api from "@/lib/api"

export interface DashboardStats {
  total_animals: number
  active_animals: number
  female_count: number
  male_count: number
  total_lots: number
  active_lots: number
  today_milk_total: number
  animals_milking_today: number
  active_alerts: number
  pending_events: number
  upcoming_events: {
    id: number
    title: string
    event_date: string
    priority: string
    event_type?: { name: string }
  }[]
  recent_alerts: {
    id: number
    title: string
    message: string
    priority: string
    alert_date: string
  }[]
  monthly_production: {
    month: string
    total_liters: number
    average_weight?: number
  }[]
  sex_distribution: { name: string; value: number }[]
}

export const dashboardService = {
  stats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<DashboardStats>("/dashboard/stats")
    return data
  },
}
