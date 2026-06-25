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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, Syringe, Stethoscope, Activity } from "lucide-react"
import {
  healthRecordService,
  healthTypeService,
  type HealthRecord,
  type HealthType,
} from "@/lib/services/health-records"
import { animalService, type Animal } from "@/lib/services/animals"
import { useToast } from "@/hooks/use-toast"
import { unwrapList } from "@/lib/services/pagination"

interface RegistroSanidad {
  id: number
  animalId: number
  fecha: string
  tipo: string
  diagnostico: string
  medicamento: string
  dosis: string
  viaAdministracion: string
  proximaFecha: string
  veterinario: string
  observaciones: string
}

const toRegistroSanidad = (record: HealthRecord, healthTypes: HealthType[]): RegistroSanidad => {
  const healthType = healthTypes.find((t) => t.id === record.health_type_id)
  const tipoMap: Record<string, string> = {
    "Vaccine": "Vacuna",
    "Treatment": "Tratamiento",
    "Check-up": "Control",
    "Deworming": "Desparasitación",
  }
  const tipo = healthType ? (tipoMap[healthType.name] || healthType.name) : "Control"

  return {
    id: record.id,
    animalId: record.animal_id,
    fecha: record.record_date,
    tipo,
    diagnostico: record.diagnosis || "",
    medicamento: record.medication || "",
    dosis: record.dosage || "",
    viaAdministracion: "",
    proximaFecha: record.next_appointment || "",
    veterinario: record.veterinarian || "",
    observaciones: record.observations || "",
  }
}

const toHealthRecordPayload = (r: Partial<RegistroSanidad>, healthTypes: HealthType[]) => {
  const tipoReverseMap: Record<string, string> = {
    "Vacuna": "Vaccine",
    "Tratamiento": "Treatment",
    "Control": "Check-up",
    "Desparasitación": "Deworming",
  }
  const healthType = healthTypes.find(
    (t) => t.name === (tipoReverseMap[r.tipo || ""] || r.tipo)
  )

  return {
    animal_id: r.animalId,
    health_type_id: healthType?.id || 1,
    record_date: r.fecha,
    diagnosis: r.diagnostico || null,
    medication: r.medicamento || null,
    dosage: r.dosis || null,
    veterinarian: r.veterinario || null,
    next_appointment: r.proximaFecha || null,
    observations: r.observaciones || null,
  }
}

const getAnimalInfo = (id: number, animals: Animal[]) => {
  const animal = animals.find((a) => a.id === id)
  return animal ? `${animal.internal_code} ${animal.name}` : String(id)
}

const columns = [
  {
    key: "animalId",
    label: "Animal",
    render: (item: RegistroSanidad & { animalInfo?: string }) => (
      <span className="font-medium text-primary">{item.animalInfo || `#${item.animalId}`}</span>
    ),
  },
  { key: "fecha", label: "Fecha" },
  {
    key: "tipo",
    label: "Tipo",
    render: (item: RegistroSanidad) => (
      <StatusBadge
        status={item.tipo}
        variant={
          item.tipo === "Vacuna"
            ? "success"
            : item.tipo === "Tratamiento"
              ? "warning"
              : "info"
        }
      />
    ),
  },
  {
    key: "medicamento",
    label: "Medicamento",
    render: (item: RegistroSanidad) => item.medicamento || "-",
  },
  { key: "veterinario", label: "Veterinario" },
]

const defaultRegistro: Partial<RegistroSanidad> = {
  animalId: 0,
  fecha: new Date().toISOString().split("T")[0],
  tipo: "Vacuna",
  diagnostico: "",
  medicamento: "",
  dosis: "",
  viaAdministracion: "Intramuscular",
  proximaFecha: "",
  veterinario: "",
  observaciones: "",
}

const viaOptions = [
  { value: "Intramuscular", label: "Intramuscular" },
  { value: "Subcutánea", label: "Subcutánea" },
  { value: "Intravenosa", label: "Intravenosa" },
  { value: "Oral", label: "Oral" },
  { value: "Tópica", label: "Tópica" },
]

export default function SanidadPage() {
  const [registros, setRegistros] = useState<RegistroSanidad[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [healthTypes, setHealthTypes] = useState<HealthType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentRegistro, setCurrentRegistro] = useState<Partial<RegistroSanidad> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const [recordsData, animalsData, typesData] = await Promise.all([
        healthRecordService.list(),
        animalService.list(),
        healthTypeService.list(),
      ])
      const healthTypeList = unwrapList<HealthType>(typesData)
      setHealthTypes(healthTypeList)
      const animalList = unwrapList<Animal>(animalsData)
      setAnimals(animalList)
      const mapped = unwrapList<HealthRecord>(recordsData).map((r) => {
        const reg = toRegistroSanidad(r, healthTypeList)
        const animal = animalList.find((a) => a.id === r.animal_id)
        return { ...reg, animalInfo: animal ? `${animal.internal_code} ${animal.name}` : `#${r.animal_id}` }
      })
      setRegistros(mapped)
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

  const stats = useMemo(() => {
    const vacunas = registros.filter((r) => r.tipo === "Vacuna").length
    const tratamientos = registros.filter((r) => r.tipo === "Tratamiento").length
    const controles = registros.filter((r) => r.tipo === "Control").length
    return { vacunas, tratamientos, controles }
  }, [registros])

  const animalOptions = animals.map((a) => ({
    value: String(a.id),
    label: `${a.internal_code} - ${a.name}`,
  }))

  const handleCreate = () => {
    setCurrentRegistro({ ...defaultRegistro })
    setIsEditing(false)
    setDialogOpen(true)
  }

  const handleEdit = (registro: RegistroSanidad) => {
    setCurrentRegistro({ ...registro })
    setIsEditing(true)
    setDialogOpen(true)
  }

  const handleDelete = (registro: RegistroSanidad) => {
    setCurrentRegistro(registro)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = useCallback(async () => {
    if (currentRegistro?.id) {
      try {
        await healthRecordService.delete(currentRegistro.id)
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
    if (!currentRegistro?.animalId || !currentRegistro?.tipo) {
      toast({
        title: "Error",
        description: "Por favor complete los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      if (isEditing && currentRegistro.id) {
        await healthRecordService.update(currentRegistro.id, toHealthRecordPayload(currentRegistro, healthTypes))
        toast({
          title: "Registro actualizado",
          description: "El registro ha sido actualizado correctamente.",
        })
      } else {
        await healthRecordService.create(toHealthRecordPayload(currentRegistro, healthTypes))
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

  const updateField = (field: keyof RegistroSanidad, value: string) => {
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
        <h1 className="text-2xl font-bold">Sanidad y Tratamientos</h1>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-green-100 p-3 text-green-600">
                <Syringe className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vacunas Pendientes</p>
                <p className="text-2xl font-bold">{stats.vacunas}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tratamientos Activos</p>
                <p className="text-2xl font-bold">{stats.tratamientos}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                <Stethoscope className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revisiones Vet.</p>
                <p className="text-2xl font-bold">{stats.controles}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-end">
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={registros}
          columns={columns}
          searchPlaceholder="Buscar animal..."
          searchKeys={["animalId", "veterinario", "medicamento"]}
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
          emptyMessage="No hay registros sanitarios"
        />

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Registro" : "Nuevo Registro Sanitario"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="animalId">Animal *</Label>
                <SearchableSelect
                  options={animalOptions}
                  value={currentRegistro?.animalId ? String(currentRegistro.animalId) : ""}
                  onValueChange={(value) => updateField("animalId", value)}
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
                    value={currentRegistro?.fecha || ""}
                    onChange={(e) => updateField("fecha", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={currentRegistro?.tipo || ""}
                    onValueChange={(value) => updateField("tipo", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vacuna">Vacuna</SelectItem>
                      <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                      <SelectItem value="Control">Control</SelectItem>
                      <SelectItem value="Desparasitación">Desparasitación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnostico">Diagnóstico</Label>
                <Input
                  id="diagnostico"
                  placeholder="Diagnóstico o motivo"
                  value={currentRegistro?.diagnostico || ""}
                  onChange={(e) => updateField("diagnostico", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medicamento">Medicamento</Label>
                  <Input
                    id="medicamento"
                    placeholder="Nombre del medicamento"
                    value={currentRegistro?.medicamento || ""}
                    onChange={(e) => updateField("medicamento", e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosis">Dosis</Label>
                  <Input
                    id="dosis"
                    placeholder="Ej: 5ml"
                    value={currentRegistro?.dosis || ""}
                    onChange={(e) => updateField("dosis", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="viaAdministracion">Vía de Administración</Label>
                  <SearchableSelect
                    options={viaOptions}
                    value={currentRegistro?.viaAdministracion || ""}
                    onValueChange={(value) => updateField("viaAdministracion", value)}
                    placeholder="Seleccionar vía..."
                    searchPlaceholder="Buscar..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proximaFecha">Próxima Fecha</Label>
                  <Input
                    id="proximaFecha"
                    type="date"
                    value={currentRegistro?.proximaFecha || ""}
                    onChange={(e) => updateField("proximaFecha", e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="veterinario">Veterinario</Label>
                <Input
                  id="veterinario"
                  placeholder="Nombre del veterinario"
                  value={currentRegistro?.veterinario || ""}
                  onChange={(e) => updateField("veterinario", e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones adicionales"
                  rows={3}
                  value={currentRegistro?.observaciones || ""}
                  onChange={(e) => updateField("observaciones", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-11 px-6">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="h-11 px-6">
                Guardar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Eliminar Registro"
          description="¿Está seguro que desea eliminar este registro sanitario? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
