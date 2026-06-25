"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Bell, Check, AlertTriangle, Info, X } from "lucide-react"
import { alertService, type Alert } from "@/lib/services/alerts"
import { useToast } from "@/hooks/use-toast"

interface Alerta {
  id: number
  mensaje: string
  tipo: string
}

const toAlerta = (alert: Alert): Alerta => ({
  id: alert.id,
  mensaje: alert.message || alert.title,
  tipo:
    alert.priority === "high"
      ? "Alta"
      : alert.priority === "medium"
        ? "Media"
        : "Baja",
})

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentAlerta, setCurrentAlerta] = useState<Alerta | null>(null)
  const { toast } = useToast()

  const loadAlertas = useCallback(async () => {
    try {
      setLoading(true)
      const data = await alertService.list()
      setAlertas((data as Alert[]).map(toAlerta))
    } catch {
      toast({ title: "Error", description: "No se pudieron cargar las alertas.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadAlertas()
  }, [loadAlertas])

  const stats = useMemo(() => {
    const altas = alertas.filter((a) => a.tipo === "Alta").length
    const medias = alertas.filter((a) => a.tipo === "Media").length
    const bajas = alertas.filter((a) => a.tipo === "Baja").length
    return { altas, medias, bajas, total: alertas.length }
  }, [alertas])

  const handleDismiss = (alerta: Alerta) => {
    setCurrentAlerta(alerta)
    setDeleteDialogOpen(true)
  }

  const confirmDismiss = useCallback(async () => {
    if (currentAlerta?.id) {
      try {
        await alertService.resolve(currentAlerta.id)
        toast({ title: "Alerta descartada", description: "La alerta ha sido descartada." })
        await loadAlertas()
      } catch {
        toast({ title: "Error", description: "No se pudo descartar la alerta.", variant: "destructive" })
      }
    }
  }, [currentAlerta, loadAlertas, toast])

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "Alta": return <AlertTriangle className="h-5 w-5" />
      case "Media": return <Bell className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getColor = (tipo: string) => {
    switch (tipo) {
      case "Alta": return "bg-red-100 text-red-600 border-red-200"
      case "Media": return "bg-amber-100 text-amber-600 border-amber-200"
      default: return "bg-blue-100 text-blue-600 border-blue-200"
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando alertas...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Centro de Alertas</h1>

        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-muted p-3">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-red-100 p-3 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Altas</p>
                <p className="text-2xl font-bold">{stats.altas}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Medias</p>
                <p className="text-2xl font-bold">{stats.medias}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bajas</p>
                <p className="text-2xl font-bold">{stats.bajas}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {alertas.length === 0 ? (
          <Card>
            <CardContent className="flex h-48 flex-col items-center justify-center text-center">
              <Check className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-lg font-medium">No hay alertas pendientes</p>
              <p className="text-sm text-muted-foreground">Todo está bajo control</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <Card key={alerta.id} className={`border-l-4 ${getColor(alerta.tipo)}`}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${getColor(alerta.tipo)}`}>
                      {getIcon(alerta.tipo)}
                    </div>
                    <div>
                      <p className="font-medium">{alerta.mensaje}</p>
                      <StatusBadge status={alerta.tipo} />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDismiss(alerta)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <ConfirmDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} title="Descartar Alerta" description="¿Está seguro que desea descartar esta alerta?" confirmLabel="Descartar" variant="default" onConfirm={confirmDismiss} />
      </div>
    </AppLayout>
  )
}
