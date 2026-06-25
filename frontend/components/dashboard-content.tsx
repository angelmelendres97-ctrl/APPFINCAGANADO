"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/status-badge"
import {
  PawPrint,
  Milk,
  Sun,
  Heart,
  Calendar,
  AlertTriangle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { dashboardService, type DashboardStats } from "@/lib/services/dashboard"
import { useToast } from "@/hooks/use-toast"

const COLORS = ["#22c55e", "#3b82f6"]

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dashboardService.stats()
      setStats(data)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">Cargando dashboard...</p>
      </div>
    )
  }

  if (!stats) return null

  const statCards = [
    {
      label: "Total Animales",
      value: stats.total_animals,
      icon: PawPrint,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Activos",
      value: stats.active_animals,
      icon: Milk,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Hembras",
      value: stats.female_count,
      icon: Sun,
      color: "bg-amber-100 text-amber-600",
    },
    {
      label: "Machos",
      value: stats.male_count,
      icon: Heart,
      color: "bg-pink-100 text-pink-600",
    },
    {
      label: "Producción Hoy",
      value: `${stats.today_milk_total.toFixed(1)}L`,
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Alertas Activas",
      value: stats.active_alerts,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
    },
  ]

  const produccionMensual = (stats.monthly_production || []).map((p) => ({
    mes: p.month,
    produccion: p.total_liters,
    peso: p.average_weight || 0,
  }))

  const distribucionSexo = (stats.sex_distribution || []).length > 0
    ? stats.sex_distribution.map((d, i) => ({ ...d, color: COLORS[i % COLORS.length] }))
    : [
        { name: "Hembras", value: stats.female_count, color: COLORS[0] },
        { name: "Machos", value: stats.male_count, color: COLORS[1] },
      ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inicio</h1>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-full p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Production Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Producción Mensual</CardTitle>
            <p className="text-sm text-muted-foreground">Últimos meses</p>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {produccionMensual.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={produccionMensual}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="mes"
                      className="text-xs"
                      tick={{ fill: "currentColor" }}
                    />
                    <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="produccion"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={{ fill: "#22c55e" }}
                      name="Producción (L)"
                    />
                    {produccionMensual[0]?.peso ? (
                      <Line
                        type="monotone"
                        dataKey="peso"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6" }}
                        name="Peso Promedio (kg)"
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">No hay datos de producción</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sex Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución por Sexo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribucionSexo}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distribucionSexo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value, entry: { payload?: { value: number } }) => (
                      <span className="text-sm">
                        {value} ({entry.payload?.value})
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events and Alerts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Eventos Próximos</CardTitle>
            <StatusBadge status={`${stats.upcoming_events?.length || 0} eventos`} variant="info" />
          </CardHeader>
          <CardContent>
            {stats.upcoming_events && stats.upcoming_events.length > 0 ? (
              <div className="space-y-4">
                {stats.upcoming_events.map((evento) => (
                  <div
                    key={evento.id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{evento.title}</p>
                      <p className="text-sm text-muted-foreground">{evento.event_type?.name || ""}</p>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(evento.event_date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay eventos próximos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Alertas Recientes</CardTitle>
            <StatusBadge
              status={`${stats.recent_alerts?.filter((a) => a.priority === "high").length || 0} críticas`}
              variant="danger"
            />
          </CardHeader>
          <CardContent>
            {stats.recent_alerts && stats.recent_alerts.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_alerts.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-center gap-4 rounded-lg border p-3"
                  >
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        alerta.priority === "high"
                          ? "bg-red-500"
                          : alerta.priority === "medium"
                            ? "bg-amber-500"
                            : "bg-green-500"
                      }`}
                    />
                    <p className="flex-1 text-sm">{alerta.message || alerta.title}</p>
                    <StatusBadge
                      status={
                        alerta.priority === "high"
                          ? "Alta"
                          : alerta.priority === "medium"
                            ? "Media"
                            : "Baja"
                      }
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay alertas recientes
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
