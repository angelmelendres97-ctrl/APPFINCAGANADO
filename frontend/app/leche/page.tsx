"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { StatusBadge } from "@/components/status-badge"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SearchableSelect } from "@/components/searchable-select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, Download } from "lucide-react"
import { milkRecordService, type MilkRecord } from "@/lib/services/milk-records"
import { animalService, type Animal } from "@/lib/services/animals"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface RegistroLeche {
  id: number
  animalId: number
  fecha: string
  jornada: string
  cantidad: number
  temperatura: number
  mastitis: boolean
}

const toRegistroLeche = (record: MilkRecord): RegistroLeche => ({
  id: record.id,
  animalId: record.animal_id,
  fecha: record.record_date,
  jornada: record.milking_session === "morning" ? "Mañana" : "Tarde",
  cantidad: record.quantity_liters,
  temperatura: record.temperature ?? 0,
  mastitis: record.mastitis_check ?? false,
})

const toMilkRecordPayload = (r: Partial<RegistroLeche>) => ({
  animal_id: r.animalId,
  record_date: r.fecha,
  milking_session: r.jornada === "Mañana" ? "morning" : "afternoon",
  quantity_liters: r.cantidad,
  temperature: r.temperatura,
  mastitis_check: r.mastitis,
})

const columns = [
  {
    key: "animalId",
    label: "Animal",
    render: (item: RegistroLeche & { animalCodigo?: string; animalNombre?: string }) => (
      <span className="font-medium text-primary">{item.animalCodigo || `#${item.animalId}`}</span>
    ),
  },
  {
    key: "fecha",
    label: "Fecha",
    render: (item: RegistroLeche) => item.fecha?.split("T")[0],
  },
  {
    key: "jornada",
    label: "Jornada",
    render: (item: RegistroLeche) => (
      <StatusBadge status={item.jornada} variant="info" />
    ),
  },
  {
  key: "cantidad",
  label: "Cantidad (L)",
  render: (item: RegistroLeche) => (
    <span className="font-semibold">
      {Number(item.cantidad ?? 0).toFixed(2)}
    </span>
  ),
},
 {
  key: "temperatura",
  label: "Temp. (°C)",
  render: (item: RegistroLeche) =>
    Number(item.temperatura ?? 0).toFixed(2),
},
  {
    key: "mastitis",
    label: "Mastitis",
    render: (item: RegistroLeche) => (
      <StatusBadge status={item.mastitis ? "Sí" : "No"} />
    ),
  },
]

const defaultRegistro: Partial<RegistroLeche> = {
  animalId: 0,
  fecha: new Date().toISOString().split("T")[0],
  jornada: "Mañana",
  cantidad: 0,
  temperatura: 36.5,
  mastitis: false,
}

export default function LechePage() {
  const [registros, setRegistros] = useState<RegistroLeche[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Partial<RegistroLeche> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recordsData, animalsData] = await Promise.all([
        milkRecordService.list(),
        animalService.list(),
      ])
      const loadedAnimals = unwrapList<Animal>(animalsData).filter((a) => a.sex === "female")
      setAnimals(loadedAnimals)
      const mapped = unwrapList<MilkRecord>(recordsData).map(toRegistroLeche)
      const withAnimalInfo = mapped.map((r) => {
        const animal = loadedAnimals.find((a) => a.id === r.animalId)
        return { ...r, animalCodigo: animal?.internal_code, animalNombre: animal?.name }
      })
      setRegistros(withAnimalInfo)
    } catch {
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const milkingAnimals = animals
  const animalOptions = milkingAnimals.map((a) => ({
    value: String(a.id),
    label: `${a.internal_code} - ${a.name}`,
  }))

  const stats = useMemo(() => {
    const produccionHoy = registros.reduce((acc, r) => acc + r.cantidad, 0)
    const animalesOrdenio = new Set(registros.map((r) => r.animalId)).size
    const promedio = animalesOrdenio > 0 ? produccionHoy / animalesOrdenio : 0
    return {
      produccionHoy,
      animalesOrdenio,
      promedio,
    }
  }, [registros])

  const handleCreate = () => {
    setCurrentRegistro({ ...defaultRegistro })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (registro: RegistroLeche) => {
    setCurrentRegistro({ ...registro })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (registro: RegistroLeche) => {
    setCurrentRegistro(registro)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentRegistro?.id) {
      try {
        await milkRecordService.delete(currentRegistro.id)
        toast({
          title: "Registro eliminado",
          description: "El registro ha sido eliminado correctamente.",
        })
        await loadData()
      } catch {
        toast({
          title: "Error",
          description: "No se pudo eliminar el registro.",
          variant: "destructive",
        })
      }
    }
  }, [currentRegistro, loadData, toast])

  const handleSave = async () => {
    if (!currentRegistro?.animalId || !currentRegistro?.cantidad) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing && currentRegistro.id) {
        await milkRecordService.update(currentRegistro.id, toMilkRecordPayload(currentRegistro))
        toast({
          title: "Registro actualizado",
          description: "El registro ha sido actualizado correctamente.",
        })
      } else {
        await milkRecordService.create(toMilkRecordPayload(currentRegistro))
        toast({
          title: "Registro creado",
          description: "El nuevo registro ha sido creado correctamente.",
        })
      }
      setDialogOpen(false)
      await loadData()
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar el registro.",
        variant: "destructive",
      })
    }
  }

  const updateField = (field: keyof RegistroLeche, value: string | number | boolean) => {
    setCurrentRegistro((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-48 items-center justify-center">
          <p className="text-muted-foreground">Cargando registros...</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Control de Leche</h1>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Producción Hoy</p>
              <p className="text-3xl font-bold text-primary">
                {parseFloat(stats.produccionHoy ?? 0).toFixed(1)} L
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Animales en Ordeño</p>
              <p className="text-3xl font-bold">{stats.animalesOrdenio}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Promedio Actual</p>
              <p className="text-3xl font-bold">{stats.promedio.toFixed(1)} L</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1" />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={handleCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          data={registros}
          columns={columns}
          searchPlaceholder="Buscar animal..."
          searchKeys={["animalId"]}
          actions={(item) => (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleEdit(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
          emptyMessage="No hay registros de producción"
        />

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Registro" : "Nuevo Registro de Leche"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal *</Label>
                <SearchableSelect
                  options={animalOptions}
                  value={currentRegistro?.animalId ? String(currentRegistro.animalId) : ""}
                  onValueChange={(value) => updateField("animalId", Number(value))}
                  placeholder="Buscar animal..."
                  searchPlaceholder="Escriba para buscar..."
                  emptyMessage="No se encontró el animal."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={currentRegistro?.fecha?.split("T")[0] || ""}
                    onChange={(e) => updateField("fecha", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jornada">Jornada</Label>
                  <Select
                    value={currentRegistro?.jornada || ""}
                    onValueChange={(value) => updateField("jornada", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mañana">Mañana</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad (L) *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={currentRegistro?.cantidad || ""}
                    onChange={(e) => updateField("cantidad", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperatura">Temperatura (°C)</Label>
                  <Input
                    id="temperatura"
                    type="number"
                    step="0.1"
                    placeholder="36.5"
                    value={currentRegistro?.temperatura || ""}
                    onChange={(e) => updateField("temperatura", Number(e.target.value))}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mastitis">Mastitis</Label>
                <Select
                  value={currentRegistro?.mastitis ? "true" : "false"}
                  onValueChange={(value) => updateField("mastitis", value === "true")}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Sí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11 px-6">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="h-11 px-6">
                {isEditing ? "Guardar Cambios" : "Guardar Registro"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Registro"
          description="¿Está seguro que desea eliminar este registro de producción? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
