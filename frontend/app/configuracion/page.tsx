"use client"

import { useState, useEffect, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Building, Bell, Shield } from "lucide-react"
import { settingsService, type FarmSettings } from "@/lib/services/settings"
import { useToast } from "@/hooks/use-toast"

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<FarmSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      const data = await settingsService.get()
      setSettings(data)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar la configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  const updateSetting = (field: keyof FarmSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSaveGeneral = async () => {
    if (!settings) return
    try {
      await settingsService.update(settings)
      toast({
        title: "Configuración guardada",
        description: "Los datos de la finca han sido actualizados.",
      })
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando configuración...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Configuración</h1>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general" className="gap-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">General</span>
            </TabsTrigger>
            <TabsTrigger value="notificaciones" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificaciones</span>
            </TabsTrigger>
            <TabsTrigger value="seguridad" className="gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Datos de la Finca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nombre de la Finca</Label>
                    <Input
                      value={settings?.name || ""}
                      onChange={(e) => updateSetting("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Razón Social</Label>
                    <Input
                      value={settings?.business_name || ""}
                      onChange={(e) => updateSetting("business_name", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Propietario</Label>
                    <Input
                      value={settings?.owner_name || ""}
                      onChange={(e) => updateSetting("owner_name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>NIT / Identificación</Label>
                    <Input
                      value={settings?.tax_id || ""}
                      onChange={(e) => updateSetting("tax_id", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={settings?.phone || ""}
                      onChange={(e) => updateSetting("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Correo Electrónico</Label>
                    <Input
                      value={settings?.email || ""}
                      onChange={(e) => updateSetting("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>País</Label>
                    <Input
                      value={settings?.country || ""}
                      onChange={(e) => updateSetting("country", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provincia</Label>
                    <Input
                      value={settings?.province || ""}
                      onChange={(e) => updateSetting("province", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input
                      value={settings?.city || ""}
                      onChange={(e) => updateSetting("city", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input
                    value={settings?.address || ""}
                    onChange={(e) => updateSetting("address", e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveGeneral}>Guardar Cambios</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificaciones">
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Alertas de Sanidad</p>
                    <p className="text-sm text-muted-foreground">Recibir notificaciones sobre vacunas y tratamientos</p>
                  </div>
                  <Input type="checkbox" className="h-5 w-5" defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Alertas de Inventario</p>
                    <p className="text-sm text-muted-foreground">Notificar cuando el stock esté bajo</p>
                  </div>
                  <Input type="checkbox" className="h-5 w-5" defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">Eventos Próximos</p>
                    <p className="text-sm text-muted-foreground">Recordatorios de eventos programados</p>
                  </div>
                  <Input type="checkbox" className="h-5 w-5" defaultChecked />
                </div>
                <div className="flex justify-end">
                  <Button>Guardar Preferencias</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguridad">
            <Card>
              <CardHeader>
                <CardTitle>Seguridad de la Cuenta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contraseña Actual</Label>
                  <Input type="password" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nueva Contraseña</Label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar Contraseña</Label>
                    <Input type="password" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button>Cambiar Contraseña</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
